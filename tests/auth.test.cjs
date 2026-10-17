const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('admin account creation resets the form and refreshes the user list after the request', async () => {
  const root = path.join(__dirname, '..');
  const elements = new Map();
  const listeners = new Map();
  const requests = [];
  const userRows = [];

  function element(id) {
    if (!elements.has(id)) {
      const classes = new Set();
      const children = [];
      elements.set(id, {
        id,
        value: id === 'new-username' ? 'newuser' : 'secure-password-123',
        textContent: '',
        children,
        disabled: false,
        classList: {
          add: (...names) => names.forEach((name) => classes.add(name)),
          remove: (...names) => names.forEach((name) => classes.delete(name)),
          toggle: (name, force) => force ? classes.add(name) : classes.delete(name)
        },
        addEventListener: (name, handler) => listeners.set(`${id}:${name}`, handler),
        replaceChildren: (...nodes) => {
          children.splice(0, children.length, ...nodes);
          if (id === 'admin-users-list') userRows.splice(0, userRows.length, ...nodes);
        },
        appendChild: (child) => {
          children.push(child);
          if (id === 'admin-users-list') userRows.push(child);
          return child;
        },
        reset: () => { elements.get(id).wasReset = true; }
      });
    }
    return elements.get(id);
  }

  const document = {
    body: { classList: { add() {}, remove() {} } },
    getElementById: element,
    createElement: (tag) => element(`created-${tag}-${Math.random()}`),
    addEventListener: (name, handler) => listeners.set(`document:${name}`, handler)
  };
  const window = {
    location: { reload() {} }
  };
  const context = vm.createContext({
    document,
    window,
    navigator: {},
    Headers,
    console: { error() {} },
    fetch: async (url, options = {}) => {
      requests.push({ url, options });
      if (url === '/api/auth/me') {
        return { ok: true, status: 200, json: async () => ({ user: { id: 1, username: 'admin', role: 'admin' } }) };
      }
      if (url === '/api/admin/users' && options.method === 'POST') {
        return { ok: true, status: 201, json: async () => ({ user: { id: 2, username: 'newuser' } }) };
      }
      if (url === '/api/admin/users') {
        return { ok: true, status: 200, json: async () => ({ users: [
          { id: 1, username: 'admin', role: 'admin', enabled: true },
          { id: 2, username: 'newuser', role: 'user', enabled: true }
        ] }) };
      }
      throw new Error(`Unexpected request: ${url}`);
    }
  });

  vm.runInContext(fs.readFileSync(path.join(root, 'auth.js'), 'utf8'), context);
  await listeners.get('document:DOMContentLoaded')();
  await Promise.resolve();
  await Promise.resolve();

  const form = element('create-user-form');
  const submit = listeners.get('create-user-form:submit');
  const event = { currentTarget: form, preventDefault() {} };
  const pending = submit(event);
  event.currentTarget = null;
  await pending;

  assert.equal(form.wasReset, true);
  assert.match(element('admin-status').textContent, /המשתמש נוצר/);
  assert.ok(requests.some(({ url, options }) => url === '/api/admin/users' && options.method === 'POST'));
  assert.ok(userRows.some((row) => row.children.some((child) => child.textContent.startsWith('newuser'))));
});
