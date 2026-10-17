const test = require('node:test');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Model IndexedDB's structured cloning and transaction completion, using real Web Crypto.
function storage() {
  const records = new Map();
  let failure = false;
  const indexedDB = {
    open() {
      const request = {};
      queueMicrotask(() => {
        request.result = {
          close() {},
          transaction() {
            const tx = {
              objectStore() {
                const execute = (action) => {
                  const op = {};
                  queueMicrotask(() => {
                    if (failure) {
                      tx.error = new Error('Storage unavailable');
                      tx.onabort();
                    } else {
                      op.result = action();
                      tx.oncomplete();
                    }
                  });
                  return op;
                };
                return {
                  get: (id) => execute(() => structuredClone(records.get(id))),
                  put: (value, id) => execute(() => records.set(id, structuredClone(value))),
                  delete: (id) => execute(() => records.delete(id))
                };
              }
            };
            return tx;
          }
        };
        request.onsuccess();
      });
      return request;
    }
  };
  return { indexedDB, records, fail: (value) => { failure = value; } };
}

function load(store) {
  const context = vm.createContext({
    indexedDB: store.indexedDB, crypto: webcrypto, TextEncoder, TextDecoder, Uint8Array
  });
  vm.runInContext(readFileSync(path.join(__dirname, '..', 'key-store.js'), 'utf8'), context);
  return vm.runInContext('deviceKeyStore', context);
}

test('key survives fresh execution context without a password, and is encrypted at rest', async () => {
  const db = storage();
  await load(db).save('test-api-value');
  const record = db.records.get('gemini');
  assert.deepEqual(Object.keys(record).sort(), ['ciphertext', 'iv', 'key', 'version']);
  assert.equal(record.key.extractable, false);
  assert.equal(record.key.algorithm.name, 'AES-GCM');
  assert.equal(record.iv.length, 12);
  assert.equal(new TextDecoder().decode(record.ciphertext).includes('test-api-value'), false);
  await assert.rejects(webcrypto.subtle.exportKey('raw', record.key));
  assert.equal(await load(db).load(), 'test-api-value');
});

test('replacement rotates encryption; deletion persists across restarts', async () => {
  const db = storage();
  const store = load(db);
  assert.equal(await store.load(), null);
  await store.save('first');
  const before = db.records.get('gemini');
  await store.save('second');
  assert.notDeepEqual(before.iv, db.records.get('gemini').iv);
  assert.equal(await load(db).load(), 'second');
  await store.remove();
  assert.equal(await load(db).load(), null);
});

test('failed replacement and deletion reject without destroying the previous record', async () => {
  const db = storage();
  const store = load(db);
  await store.save('original');
  db.fail(true);
  await assert.rejects(store.save('replacement'), /Storage unavailable/);
  await assert.rejects(store.remove(), /Storage unavailable/);
  await assert.rejects(store.load(), /Storage unavailable/);
  db.fail(false);
  assert.equal(await load(db).load(), 'original');
});

test('empty input and corrupted ciphertext are rejected', async () => {
  const db = storage();
  const store = load(db);
  await assert.rejects(store.save('  '));
  await store.save('original');
  new Uint8Array(db.records.get('gemini').ciphertext)[0] ^= 1;
  await assert.rejects(load(db).load());
});
