(() => {
  const loginForm = document.getElementById('login-form');
  const loginButton = document.getElementById('login-button');
  const loginStatus = document.getElementById('login-status');
  let resolveAuth;
  window.serverAuthUser = null;
  window.serverAuthReady = new Promise((resolve) => { resolveAuth = resolve; });

  async function request(path, options = {}) {
    const method = options.method || 'GET';
    const headers = new Headers(options.headers || {});
    if (options.body !== undefined) headers.set('Content-Type', 'application/json');
    if (method !== 'GET' && method !== 'HEAD') headers.set('X-CaloriTrack-Request', '1');
    const response = await fetch(path, {
      ...options, method, headers, credentials: 'same-origin', cache: 'no-store'
    });
    let result = {};
    try {
      result = await response.json();
    } catch {
      if (response.ok) throw new Error('השרת החזיר תשובה לא תקינה.');
    }
    if (response.status === 401 && path !== '/api/auth/me' && !path.startsWith('/api/auth/login')) {
      window.location.reload();
      throw new Error('החיבור פג. מתחבר מחדש...');
    }
    if (!response.ok) throw new Error(result.error || 'הבקשה נכשלה. נסה שוב.');
    return result;
  }
  window.serverApi = request;

  function showAuthGate(message = '', isError = false) {
    document.body.classList.remove('auth-pending', 'authenticated');
    document.body.classList.add('auth-required');
    document.getElementById('auth-gate').classList.remove('hidden');
    loginStatus.textContent = message;
    loginStatus.classList.toggle('ai-error', isError);
  }

  async function refreshAdminUsers() {
    const list = document.getElementById('admin-users-list');
    const { users } = await request('/api/admin/users');
    list.replaceChildren();
    users.forEach((user) => {
      const row = document.createElement('li');
      const identity = document.createElement('span');
      identity.textContent = `${user.username} · ${user.enabled ? 'פעיל' : 'מושבת'}${user.hasBackup ? ' · יש גיבוי' : ''}`;
      row.appendChild(identity);
      if (user.role === 'user' && user.enabled) {
        const disable = document.createElement('button');
        disable.type = 'button';
        disable.className = 'danger-btn btn-sm';
        disable.textContent = 'השבת חשבון';
        disable.addEventListener('click', async () => {
          if (!window.confirm(`להשבית את החשבון ${user.username}? ההתחברות תיחסם, אך הנתונים המקומיים לא יימחקו.`)) return;
          disable.disabled = true;
          try {
            await request(`/api/admin/users/${user.id}/disable`, { method: 'POST' });
            await refreshAdminUsers();
          } catch (error) {
            disable.disabled = false;
            document.getElementById('admin-status').textContent = error.message;
          }
        });
        row.appendChild(disable);
      }
      list.appendChild(row);
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length) {
          await Promise.all(registrations.map((registration) => registration.unregister()));
          const oldCaches = await caches.keys();
          await Promise.all(oldCaches
            .filter((name) => name.startsWith('caloritrack-'))
            .map((name) => caches.delete(name)));
          window.location.reload();
          resolveAuth(null);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to retire the previous service worker:', error);
      showAuthGate('לא ניתן לנקות את המטמון הישן והמאובטח. הפעל מחדש את הדפדפן ונסה שוב.', true);
      resolveAuth(null);
      return;
    }

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      loginButton.disabled = true;
      loginStatus.textContent = 'מתחבר...';
      try {
        await request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            username: document.getElementById('login-username').value.trim(),
            password: document.getElementById('login-password').value
          })
        });
        window.location.reload();
      } catch (error) {
        showAuthGate(error.message, true);
        document.getElementById('login-password').value = '';
      } finally {
        loginButton.disabled = false;
      }
    });

    try {
      const { user } = await request('/api/auth/me');
      window.serverAuthUser = user;
      document.body.classList.remove('auth-pending');
      document.body.classList.remove('auth-required');
      document.body.classList.add('authenticated');
      document.getElementById('auth-gate').classList.add('hidden');
      document.getElementById('account-name').textContent = user.username;
      document.getElementById('header-account-name').textContent = user.username;
      document.getElementById('account-role').textContent = user.role === 'admin' ? 'מנהל' : 'משתמש';
      document.getElementById('admin-users-card').classList.toggle('hidden', user.role !== 'admin');
      resolveAuth(user);
      if (user.role === 'admin') refreshAdminUsers().catch((error) => {
        document.getElementById('admin-status').textContent = error.message;
      });
    } catch (error) {
      showAuthGate(error.message === 'יש להתחבר למערכת.'
        ? '' : 'לא ניתן להתחבר לשרת כרגע. בדוק את חיבור האינטרנט ונסה שוב.', error.message !== 'יש להתחבר למערכת.');
      resolveAuth(null);
    }

    document.getElementById('logout-button').addEventListener('click', async (event) => {
      event.currentTarget.disabled = true;
      try {
        await request('/api/auth/logout', { method: 'POST', body: '{}' });
        window.location.reload();
      } catch (error) {
        event.currentTarget.disabled = false;
        document.getElementById('backup-status').textContent = error.message;
      }
    });

    document.getElementById('create-user-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = document.getElementById('create-user-button');
      button.disabled = true;
      const status = document.getElementById('admin-status');
      try {
        await request('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            username: document.getElementById('new-username').value.trim(),
            password: document.getElementById('new-user-password').value
          })
        });
        event.currentTarget.reset();
        status.textContent = 'המשתמש נוצר. מסור לו את פרטי הכניסה בערוץ מאובטח.';
        await refreshAdminUsers();
      } catch (error) {
        status.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });

    document.getElementById('backup-to-server-button').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      const status = document.getElementById('backup-status');
      button.disabled = true;
      try {
        if (!window.caloriTrack) throw new Error('הנתונים המקומיים עדיין נטענים.');
        const data = window.caloriTrack.getState();
        await request('/api/backup', {
          method: 'PUT',
          body: JSON.stringify({ version: 1, data })
        });
        status.textContent = 'הגיבוי האישי נשמר בשרת כשהוא מוצפן.';
      } catch (error) {
        status.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });

    document.getElementById('restore-from-server-button').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      const status = document.getElementById('backup-status');
      if (!window.confirm('שחזור יחליף את הנתונים המקומיים של החשבון הזה בגיבוי האחרון שבשרת. להמשיך?')) return;
      button.disabled = true;
      try {
        const backup = await request('/api/backup');
        if (!window.caloriTrack) throw new Error('הנתונים המקומיים עדיין נטענים.');
        window.caloriTrack.replaceState(backup.data);
        status.textContent = `הגיבוי שוחזר בהצלחה (${new Date(backup.updatedAt).toLocaleString('he-IL')}).`;
      } catch (error) {
        status.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
  });
})();
