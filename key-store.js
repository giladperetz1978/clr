const deviceKeyStore = (() => {
  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('caloritrack-device-key', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('keys');
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('סגור חלונות נוספים של האפליקציה ונסה שוב.'));
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close();
        resolve(request.result);
      };
    });
  }

  async function transaction(mode, operation) {
    const db = await open();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction('keys', mode);
        const request = operation(tx.objectStore('keys'));
        tx.oncomplete = () => resolve(request.result);
        tx.onabort = () => reject(tx.error || new Error('שמירת המפתח בוטלה.'));
        tx.onerror = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  }

  async function decrypt(record) {
    if (record.version !== 1 || !record.key || !record.iv || !record.ciphertext) {
      throw new Error('המפתח השמור פגום. מחק אותו או שמור מפתח חדש.');
    }
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: record.iv }, record.key, record.ciphertext
    );
    return new TextDecoder().decode(plaintext);
  }

  return {
    async load() {
      const record = await transaction('readonly', (store) => store.get('gemini'));
      return record ? decrypt(record) : null;
    },
    async save(apiKey) {
      if (typeof apiKey !== 'string' || !apiKey.trim()) throw new Error('יש להזין מפתח Gemini.');
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
      );
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv }, key, new TextEncoder().encode(apiKey)
      );
      await transaction('readwrite', (store) => store.put({ version: 1, key, iv, ciphertext }, 'gemini'));
    },
    async remove() {
      await transaction('readwrite', (store) => store.delete('gemini'));
    }
  };
})();
