import { DatabaseSync } from 'node:sqlite';
import { createAccount } from './server.js';
import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';

function prompt(label) {
  const rl = createInterface({ input: stdin, output: stdout });
  return new Promise((resolve) => rl.question(label, (answer) => {
    rl.close();
    resolve(answer.trim());
  }));
}

function secret(label) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
      reject(new Error('יש להפעיל את הפקודה מתוך טרמינל אינטראקטיבי.'));
      return;
    }
    stdout.write(label);
    let value = '';
    const onData = (chunk) => {
      for (const char of chunk.toString('utf8')) {
        if (char === '\u0003') {
          stdin.setRawMode(false);
          stdin.off('data', onData);
          stdout.write('\n');
          reject(new Error('הפקודה בוטלה.'));
          return;
        }
        if (char === '\r' || char === '\n') {
          stdin.setRawMode(false);
          stdin.off('data', onData);
          stdout.write('\n');
          resolve(value);
          return;
        }
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (char >= ' ') value += char;
      }
    };
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);
  });
}

async function main() {
  const dbPath = process.env.DATABASE_PATH || '/var/lib/caloritrack/accounts.sqlite';
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL COLLATE NOCASE UNIQUE, password_salt BLOB NOT NULL, password_hash BLOB NOT NULL, role TEXT NOT NULL CHECK(role IN (\'admin\', \'user\')), enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0, 1)), created_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL); CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at); CREATE TABLE IF NOT EXISTS backups (user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, iv BLOB NOT NULL, ciphertext BLOB NOT NULL, tag BLOB NOT NULL, updated_at INTEGER NOT NULL);');
  try {
    if (process.argv[2] !== 'init-admin') {
      throw new Error('שימוש: node server/cli.js init-admin');
    }
    if (Number(db.prepare('SELECT COUNT(*) AS count FROM users').get().count) !== 0) {
      throw new Error('כבר קיימים חשבונות. יצירת מנהל ראשוני חסומה.');
    }
    const username = await prompt('שם משתמש למנהל: ');
    const password = await secret('סיסמת מנהל (12 תווים ומעלה; לא יוצג): ');
    const confirmation = await secret('אימות סיסמה: ');
    if (password !== confirmation) throw new Error('הסיסמאות אינן תואמות.');
    const admin = createAccount(db, username, password, 'admin');
    console.info(`נוצר חשבון מנהל: ${admin.username}`);
    console.info('שמור את שם המשתמש והסיסמה במקום מאובטח. לא ניתן לשחזר סיסמה שנשכחה.');
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
