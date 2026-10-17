import {
  createHash,
  randomBytes,
  scrypt,
  scryptSync,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
  hkdfSync
} from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { createServer as httpCreateServer } from 'node:http';
import { promisify } from 'node:util';
import { URL } from 'node:url';

const scryptAsync = promisify(scrypt);
const SESSION_TTL_SECONDS = 12 * 60 * 60;
const MAX_BACKUP_BYTES = 4 * 1024 * 1024;
const MAX_GEMINI_INPUT_BYTES = 256 * 1024;
const MEAL_KEYS = ['breakfast', 'lunch', 'dinner', 'snacks'];
const FOOD_CATEGORIES = [
  'חלבונים ובשר',
  'מוצרי חלב וביצים',
  'לחם, דגנים ופחמימות',
  'ירקות ופירות',
  'שומנים, אגוזים וממרחים',
  'מאכלים ישראליים ומהירים',
  'חטיפים, מתוקים ומשקאות',
  'אישי'
];

export class HttpError extends Error {
  constructor(status, message, code = '') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function makeSchema() {
  return {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            date: { type: 'string' },
            portion: { type: 'string' },
            calories: { type: 'integer' },
            protein: { type: 'number' },
            carbs: { type: 'number' },
            fat: { type: 'number' },
            meal: { type: 'string', enum: MEAL_KEYS },
            category: { type: 'string', enum: FOOD_CATEGORIES },
            source: { type: 'string', enum: ['local_database', 'web_search', 'estimate'] }
          },
          required: ['name', 'date', 'portion', 'calories', 'protein', 'carbs', 'fat', 'meal', 'category', 'source']
        }
      },
      activities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            date: { type: 'string' },
            kind: { type: 'string', enum: ['basketball_3v3', 'other'] },
            durationMinutes: { type: 'integer' },
            startTime: { type: 'string' },
            endTime: { type: 'string' },
            calories: { type: 'integer' }
          },
          required: ['name', 'date', 'kind', 'durationMinutes', 'startTime', 'endTime', 'calories']
        }
      },
      water: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            amountMl: { type: 'integer' }
          },
          required: ['date', 'amountMl']
        }
      },
      note: { type: 'string' }
    },
    required: ['items', 'activities', 'water', 'note']
  };
}

function makeRecommendationSchema() {
  return {
    type: 'object',
    properties: {
      reply: { type: 'string' },
      questionAsked: { type: 'boolean' },
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            portion: { type: 'string' },
            calories: { type: 'integer' },
            reason: { type: 'string' }
          },
          required: ['name', 'portion', 'calories', 'reason']
        }
      }
    },
    required: ['reply', 'questionAsked', 'suggestions']
  };
}

function buildRecommendationPrompt(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'פרטי שיחת ההמלצות אינם תקינים.');
  }
  const date = body?.date;
  const parsedDate = typeof date === 'string' ? new Date(`${date}T00:00:00.000Z`) : null;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)
      || !Number.isFinite(parsedDate?.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    throw new HttpError(400, 'תאריך היום ביומן אינו תקין.');
  }
  const metrics = ['goal', 'eaten', 'burned'];
  if (metrics.some((key) => !Number.isSafeInteger(body[key]) || body[key] < 0 || body[key] > 200000)
      || body.goal > 10000) {
    throw new HttpError(400, 'נתוני הקלוריות אינם תקינים.');
  }
  if (!Number.isInteger(body.questionsAsked) || body.questionsAsked < 0 || body.questionsAsked > 3) {
    throw new HttpError(400, 'מספר שאלות ההבהרה אינו תקין.');
  }
  if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 12
      || body.messages[body.messages.length - 1]?.role !== 'user') {
    throw new HttpError(400, 'היסטוריית השיחה אינה תקינה.');
  }

  let totalCharacters = 0;
  const messages = body.messages.map((message) => {
    if (!message || !['user', 'assistant'].includes(message.role)
        || typeof message.content !== 'string' || !message.content.trim()
        || message.content.length > 1800) {
      throw new HttpError(400, 'הודעה בשיחה אינה תקינה.');
    }
    totalCharacters += message.content.length;
    return `${message.role === 'user' ? 'המשתמש' : 'העוזר'}: ${message.content}`;
  });
  if (totalCharacters > 12000) throw new HttpError(413, 'היסטוריית השיחה ארוכה מדי.');

  const remainingCalories = body.goal + body.burned - body.eaten;
  const availableCalories = Math.max(0, remainingCalories);
  const prompt = [
    'אתה צ׳אט המלצות מזון בלבד. אל תרשום, אל תוסיף ואל תשנה שום נתון ביומן; הממשק הזה לעולם אינו רושם מאכלים.',
    'התאם הצעות ליתרת הקלוריות המחושבת בהקשר. כל פריט במערך suggestions חייב לכלול מנה ברורה והערכה סבירה של הקלוריות, ולעולם לא לחרוג מהתקציב הזמין. אם אין מנה מתאימה או שהיתרה אפס/שלילית, החזר suggestions ריק והסבר זאת ב-reply. אין להציג הצעת מזון שעוברת את התקציב.',
    'כשמבקשים כמות למאכל מסוים, חשב כמות מרבית מעשית שהקלוריות שלה אינן עוברות את התקציב; ציין את הכמות ואת הערכת הקלוריות. אם הנתונים תלויים במתכון/מותג, ציין הנחות או השתמש בחיפוש רק למוצר ספציפי.',
    'נהל שיחה בעברית ובטון ידידותי. אפשר לשאול עד שלוש שאלות הבהרה בשיחה, שאלה אחת בכל הודעה, כדי לברר סוג מאכל או ארוחה, העדפות (חלבי, צמחי, טבעוני וכדומה) ומה המשתמש רוצה לאכול. אם כבר יש מספיק מידע, תן הצעות במקום לשאול. לאחר שנשאלו שלוש שאלות, אל תשאל עוד ושב עם ההמלצה הטובה ביותר לפי המידע הקיים.',
    'השב רק במבנה JSON של הסכמה. reply הוא התשובה/השאלה בעברית; questionAsked הוא true רק אם reply מכיל שאלת הבהרה אחת; suggestions מכיל עד חמש הצעות. אל תכלול תוכן שאינו המלצת אוכל, כמות או בירור העדפות. שמור על עצות תזונה כלליות ומאוזנות ואל תציג אותן כייעוץ רפואי.',
    `הקשר יומי מחושב: ${JSON.stringify({
      date,
      goal: body.goal,
      eaten: body.eaten,
      burned: body.burned,
      remaining: remainingCalories,
      availableForSuggestions: availableCalories
    })}`,
    `שאלות הבהרה שכבר נשאלו בשיחה: ${body.questionsAsked} מתוך 3.`,
    `השיחה עד כה:\n${messages.join('\n')}`
  ].join('\n\n');

  return { prompt, remainingCalories, availableCalories };
}

function extractOutputText(result) {
  if (typeof result.output_text === 'string') return result.output_text;
  const text = [];
  (result.steps || []).forEach((step) => {
    if (step.type !== 'model_output') return;
    (step.content || []).forEach((content) => {
      if (typeof content.text === 'string') text.push(content.text);
    });
  });
  return text.join('\n').trim();
}

function validateRecommendationAnswer(result, context, questionsAsked) {
  let answer;
  try {
    answer = JSON.parse(extractOutputText(result));
  } catch {
    throw new HttpError(502, 'Gemini החזיר תשובת המלצה לא תקינה.');
  }
  if (!answer || typeof answer.reply !== 'string' || !answer.reply.trim()
      || answer.reply.length > 1800 || typeof answer.questionAsked !== 'boolean'
      || !Array.isArray(answer.suggestions) || answer.suggestions.length > 5) {
    throw new HttpError(502, 'Gemini החזיר תשובת המלצה לא תקינה.');
  }
  if (answer.questionAsked && questionsAsked >= 3) {
    throw new HttpError(502, 'התקבלה שאלת הבהרה מעבר למגבלת השיחה. נסה שוב.');
  }
  answer.suggestions.forEach((suggestion) => {
    if (!suggestion || typeof suggestion.name !== 'string' || !suggestion.name.trim()
        || suggestion.name.length > 100 || typeof suggestion.portion !== 'string'
        || !suggestion.portion.trim() || suggestion.portion.length > 140
        || !Number.isSafeInteger(suggestion.calories) || suggestion.calories < 0
        || suggestion.calories > context.availableCalories
        || typeof suggestion.reason !== 'string' || suggestion.reason.length > 500) {
      throw new HttpError(502, 'הצעת Gemini חרגה מתקציב הקלוריות או לא תקינה. נסה שוב.');
    }
  });
  return answer;
}

function passwordHash(password, salt) {
  return scryptAsync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map((part) => {
    const separator = part.indexOf('=');
    return separator < 0
      ? ['', '']
      : [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
  }).filter(([name]) => name));
}

function validateUserInput(username, password) {
  if (typeof username !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/.test(username)) {
    throw new HttpError(400, 'שם משתמש: 3–32 תווים באנגלית, ספרות, נקודה, מקף או קו תחתון.');
  }
  if (typeof password !== 'string' || Buffer.byteLength(password, 'utf8') < 12
      || Buffer.byteLength(password, 'utf8') > 256) {
    throw new HttpError(400, 'הסיסמה חייבת להכיל לפחות 12 תווים.');
  }
}

function validateBackup(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || value.version !== 1 || !value.data || typeof value.data !== 'object'
      || Array.isArray(value.data)) {
    throw new HttpError(400, 'קובץ הגיבוי אינו בפורמט הנתמך.');
  }
  const { data } = value;
  if (!data.goals || typeof data.goals !== 'object'
      || !data.days || typeof data.days !== 'object' || Array.isArray(data.days)
      || !Array.isArray(data.customFoods) || data.customFoods.length > 1000
      || !Array.isArray(data.weights) || data.weights.length > 10000
      || Object.keys(data.days).length > 10000) {
    throw new HttpError(400, 'מבנה נתוני הגיבוי אינו תקין או חורג מהמגבלה.');
  }
}

function deriveBackupKey(masterKey, userId) {
  return Buffer.from(hkdfSync('sha256', masterKey, Buffer.from(String(userId)), 'caloritrack-backup-v1', 32));
}

function encryptBackup(masterKey, userId, data) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deriveBackupKey(masterKey, userId), iv);
  const ciphertext = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  return { iv, ciphertext, tag: cipher.getAuthTag() };
}

function decryptBackup(masterKey, userId, iv, ciphertext, tag) {
  const decipher = createDecipheriv('aes-256-gcm', deriveBackupKey(masterKey, userId), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

export function createDatabase(dbPath) {
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA secure_delete = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_salt BLOB NOT NULL,
      password_hash BLOB NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0, 1)),
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS backups (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      iv BLOB NOT NULL,
      ciphertext BLOB NOT NULL,
      tag BLOB NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  return db;
}

export function createAccount(db, username, password, role = 'user', now = Date.now) {
  validateUserInput(username, password);
  if (role !== 'admin' && role !== 'user') throw new HttpError(400, 'סוג חשבון לא תקין.');
  const salt = randomBytes(16);
  const passwordDigest = scryptSync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  try {
    const result = db.prepare(`
      INSERT INTO users (username, password_salt, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(username, salt, passwordDigest, role, now());
    return { id: Number(result.lastInsertRowid), username, role };
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) throw new HttpError(409, 'שם המשתמש כבר קיים.');
    throw error;
  }
}

export function createServer({
  dbPath = ':memory:',
  allowedOrigin = 'https://caloritrack.144.91.96.77.sslip.io',
  geminiKey,
  backupKey = randomBytes(32),
  fetchImpl = fetch,
  now = () => Date.now(),
  secureCookies = true,
  logger = console
} = {}) {
  if (typeof geminiKey !== 'string' || !geminiKey.trim()) throw new Error('Missing server Gemini API credential.');
  if (!Buffer.isBuffer(backupKey) || backupKey.length !== 32) throw new Error('Backup encryption key must be 32 bytes.');
  const origin = new URL(allowedOrigin).origin;
  const db = createDatabase(dbPath);
  const loginAttempts = new Map();
  const aiCalls = new Map();
  const dummySalt = randomBytes(16);
  const dummyHash = scryptSync('unusable-password', dummySalt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });

  function getClientIp(request) {
    const remote = request.socket.remoteAddress || '';
    if (remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1') {
      return String(request.headers['x-real-ip'] || remote).slice(0, 64);
    }
    return remote.slice(0, 64);
  }

  function checkRateLimit(map, key, limit, windowMs) {
    const timestamp = now();
    const previous = map.get(key) || [];
    const active = previous.filter((entry) => entry > timestamp - windowMs);
    if (active.length >= limit) throw new HttpError(429, 'בוצעו יותר מדי ניסיונות. נסה שוב מאוחר יותר.');
    active.push(timestamp);
    map.set(key, active);
    if (map.size > 5000) {
      for (const [oldKey, entries] of map) {
        if (!entries.some((entry) => entry > timestamp - windowMs)) map.delete(oldKey);
      }
    }
  }

  async function readJson(request, maxBytes = 16 * 1024) {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > maxBytes) throw new HttpError(413, 'הבקשה גדולה מדי.');
      chunks.push(chunk);
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      throw new HttpError(400, 'תוכן הבקשה אינו JSON תקין.');
    }
  }

  function send(response, status, value, extraHeaders = {}) {
    response.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      ...extraHeaders
    });
    response.end(value === null ? '' : JSON.stringify(value));
  }

  function setSessionCookie(response, token) {
    const secure = secureCookies ? '; Secure' : '';
    response.setHeader('Set-Cookie',
      `caloritrack_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure}`);
  }

  function clearSessionCookie(response) {
    const secure = secureCookies ? '; Secure' : '';
    response.setHeader('Set-Cookie',
      `caloritrack_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`);
  }

  function requireSameOrigin(request) {
    const requestOrigin = request.headers.origin;
    if (requestOrigin !== origin) throw new HttpError(403, 'מקור הבקשה אינו מורשה.');
    const fetchSite = request.headers['sec-fetch-site'];
    if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
      throw new HttpError(403, 'הבקשה נחסמה מטעמי אבטחה.');
    }
  }

  function getUser(request) {
    const token = parseCookies(request.headers.cookie).caloritrack_session;
    if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) throw new HttpError(401, 'יש להתחבר למערכת.');
    const session = db.prepare(`
      SELECT users.id, users.username, users.role, sessions.expires_at
      FROM sessions JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ? AND users.enabled = 1
    `).get(hashToken(token));
    if (!session || session.expires_at <= now()) {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
      throw new HttpError(401, 'פג תוקף ההתחברות. התחבר שוב.');
    }
    return { id: session.id, username: session.username, role: session.role };
  }

  function requireAdmin(user) {
    if (user.role !== 'admin') throw new HttpError(403, 'פעולה זו זמינה למנהל בלבד.');
  }

  function createUser(username, password, role = 'user') {
    return createAccount(db, username, password, role, now);
  }

  async function login(request, response) {
    requireSameOrigin(request);
    checkRateLimit(loginAttempts, getClientIp(request), 10, 15 * 60 * 1000);
    const body = await readJson(request);
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const user = username.length <= 64
      ? db.prepare('SELECT id, username, password_salt, password_hash, role, enabled FROM users WHERE username = ? COLLATE NOCASE').get(username)
      : undefined;
    const salt = user?.password_salt || dummySalt;
    const expected = user?.password_hash || dummyHash;
    const candidate = await passwordHash(password, salt);
    if (!user || !user.enabled || !timingSafeEqual(candidate, expected)) {
      throw new HttpError(401, 'שם המשתמש או הסיסמה שגויים.');
    }

    const token = randomBytes(32).toString('base64url');
    const expiresAt = now() + SESSION_TTL_SECONDS * 1000;
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now());
    db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
      .run(hashToken(token), user.id, expiresAt);
    loginAttempts.delete(getClientIp(request));
    setSessionCookie(response, token);
    send(response, 200, { user: { id: user.id, username: user.username, role: user.role } });
  }

  async function callGemini(request, response, user, mode = 'analyze') {
    const bucketKey = `user:${user.id}`;
    checkRateLimit(aiCalls, bucketKey, 30, 60 * 1000);
    const body = await readJson(request, MAX_GEMINI_INPUT_BYTES);
    const recommendationContext = mode === 'recommend' ? buildRecommendationPrompt(body) : null;
    const input = recommendationContext ? recommendationContext.prompt : body.input;
    if (typeof input !== 'string' || !input.trim() || Buffer.byteLength(input, 'utf8') > MAX_GEMINI_INPUT_BYTES) {
      throw new HttpError(400, 'תיאור ההודעה חסר או ארוך מדי.');
    }
    let upstream;
    try {
      upstream = await fetchImpl('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
        body: JSON.stringify({
          model: 'gemini-3.8-flash',
          input,
          tools: [{ type: 'google_search' }],
          response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema: mode === 'recommend' ? makeRecommendationSchema() : makeSchema()
          }
        }),
        signal: AbortSignal.timeout(60_000)
      });
      const responseText = await upstream.text();
      if (Buffer.byteLength(responseText, 'utf8') > 1024 * 1024) {
        throw new HttpError(502, 'תשובת Gemini גדולה מדי.');
      }
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new HttpError(502, 'Gemini החזיר תשובה לא תקינה.');
      }
      if (!upstream.ok) {
        const status = upstream.status === 429 ? 429 : 502;
        throw new HttpError(status, upstream.status === 429
          ? 'מכסת בקשות Gemini זמנית מלאה. נסה שוב מאוחר יותר.'
          : 'בקשת Gemini נכשלה. בדוק את מפתח השרת או נסה שוב מאוחר יותר.');
      }
      if (recommendationContext) {
        const answer = validateRecommendationAnswer(result, recommendationContext, body.questionsAsked);
        send(response, 200, {
          answer,
          remainingCalories: recommendationContext.remainingCalories
        });
        return;
      }
      send(response, 200, result);
    } catch (error) {
      if (error instanceof HttpError) throw error;
      logger.error('Gemini upstream request failed:', error.name || 'Error');
      throw new HttpError(502, 'לא ניתן להתחבר ל-Gemini. נסה שוב מאוחר יותר.');
    }
  }

  async function backup(request, response, user) {
    if (request.method === 'GET') {
      const record = db.prepare('SELECT iv, ciphertext, tag, updated_at FROM backups WHERE user_id = ?').get(user.id);
      if (!record) throw new HttpError(404, 'עדיין אין גיבוי בשרת לחשבון הזה.', 'no_backup');
      let data;
      try {
        data = JSON.parse(decryptBackup(backupKey, user.id, record.iv, record.ciphertext, record.tag));
        validateBackup(data);
      } catch (error) {
        logger.error('Encrypted backup integrity check failed for account:', user.id);
        throw new HttpError(500, 'לא ניתן לקרוא את הגיבוי. הוא נפגם או שמפתח השרת השתנה.');
      }
      send(response, 200, { ...data, updatedAt: record.updated_at });
      return;
    }
    if (request.method === 'PUT') {
      const data = await readJson(request, MAX_BACKUP_BYTES);
      validateBackup(data);
      const encrypted = encryptBackup(backupKey, user.id, JSON.stringify(data));
      const timestamp = now();
      db.prepare(`
        INSERT INTO backups (user_id, iv, ciphertext, tag, updated_at) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET iv = excluded.iv, ciphertext = excluded.ciphertext,
          tag = excluded.tag, updated_at = excluded.updated_at
      `).run(user.id, encrypted.iv, encrypted.ciphertext, encrypted.tag, timestamp);
      send(response, 200, { saved: true, updatedAt: timestamp });
      return;
    }
    throw new HttpError(405, 'שיטת הבקשה אינה נתמכת.');
  }

  async function adminUsers(request, response, user, url) {
    requireAdmin(user);
    if (request.method === 'GET' && url.pathname === '/api/admin/users') {
      const users = db.prepare(`
        SELECT id, username, role, enabled, created_at AS createdAt,
          EXISTS(SELECT 1 FROM backups WHERE backups.user_id = users.id) AS hasBackup
        FROM users ORDER BY id
      `).all();
      send(response, 200, { users });
      return;
    }
    if (request.method === 'POST' && url.pathname === '/api/admin/users') {
      const body = await readJson(request);
      const created = createUser(body.username, body.password, 'user');
      send(response, 201, { user: created });
      return;
    }
    const reset = /^\/api\/admin\/users\/(\d+)\/password$/.exec(url.pathname);
    if (request.method === 'POST' && reset) {
      const targetId = Number(reset[1]);
      const target = db.prepare('SELECT id, role FROM users WHERE id = ?').get(targetId);
      if (!target) throw new HttpError(404, 'המשתמש לא נמצא.');
      if (target.role === 'admin') throw new HttpError(403, 'לא ניתן לאפס סיסמת מנהל דרך מסך המשתמשים.');
      const body = await readJson(request);
      validateUserInput(`User${String(targetId).padStart(3, '0')}`, body.password);
      const salt = randomBytes(16);
      const digest = scryptSync(body.password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
      db.prepare('UPDATE users SET password_salt = ?, password_hash = ? WHERE id = ?')
        .run(salt, digest, targetId);
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(targetId);
      send(response, 200, { reset: true });
      return;
    }
    const disable = /^\/api\/admin\/users\/(\d+)\/disable$/.exec(url.pathname);
    if (request.method === 'POST' && disable) {
      const targetId = Number(disable[1]);
      const target = db.prepare('SELECT id, role FROM users WHERE id = ?').get(targetId);
      if (!target) throw new HttpError(404, 'המשתמש לא נמצא.');
      if (target.role === 'admin' || target.id === user.id) {
        throw new HttpError(403, 'לא ניתן להשבית את חשבון המנהל המחובר.');
      }
      db.prepare('UPDATE users SET enabled = 0 WHERE id = ?').run(targetId);
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(targetId);
      send(response, 200, { disabled: true });
      return;
    }
    throw new HttpError(404, 'הנתיב לא נמצא.');
  }

  const server = httpCreateServer(async (request, response) => {
    const url = new URL(request.url, origin);
    try {
      if (request.method === 'GET' && url.pathname === '/api/health') {
        send(response, 200, { ok: true });
        return;
      }
      if (request.method === 'GET' && url.pathname === '/api/status') {
        getUser(request);
        send(response, 200, { geminiAvailable: true });
        return;
      }
      if (request.method === 'POST') requireSameOrigin(request);
      if (request.method === 'POST' && url.pathname === '/api/auth/login') {
        await login(request, response);
        return;
      }
      if (request.method === 'GET' && url.pathname === '/api/auth/me') {
        const user = getUser(request);
        send(response, 200, { user });
        return;
      }
      if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
        const token = parseCookies(request.headers.cookie).caloritrack_session;
        if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
        clearSessionCookie(response);
        send(response, 200, { loggedOut: true });
        return;
      }

      const user = getUser(request);
      if (url.pathname.startsWith('/api/admin/')) {
        await adminUsers(request, response, user, url);
        return;
      }
      if (url.pathname === '/api/backup') {
        await backup(request, response, user);
        return;
      }
      if (request.method === 'POST' && url.pathname === '/api/gemini/analyze') {
        await callGemini(request, response, user);
        return;
      }
      if (request.method === 'POST' && url.pathname === '/api/gemini/recommend') {
        await callGemini(request, response, user, 'recommend');
        return;
      }
      throw new HttpError(404, 'הנתיב לא נמצא.');
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status >= 500 && !(error instanceof HttpError)) logger.error('Unhandled API error:', error.name || 'Error');
      if (!response.headersSent) {
        send(response, status, { error: error instanceof HttpError ? error.message : 'אירעה שגיאת שרת.' });
      } else if (!response.writableEnded) {
        response.end();
      }
    }
  });

  return {
    server,
    db,
    close() {
      server.close();
      db.close();
    },
    createUser,
    setGeminiKey(value) {
      if (typeof value !== 'string' || !value.trim()) throw new Error('Gemini key cannot be empty.');
      geminiKey = value;
    }
  };
}
