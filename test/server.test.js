import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer as createHttpServer } from '../server/server.js';
import { createServer as createNetServer } from 'node:net';

const backup = {
  version: 1,
  data: {
    goals: { calories: 2000, protein: 135, carbs: 220, fat: 65, water: 10 },
    days: {},
    customFoods: [],
    weights: []
  }
};

test('accounts, per-user encrypted backups, and the Gemini proxy are isolated', async (t) => {
  const port = await new Promise((resolve, reject) => {
    const probe = createNetServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const selectedPort = probe.address().port;
      probe.close((error) => error ? reject(error) : resolve(selectedPort));
    });
  });
  let upstreamRequest;
  let recommendationOutput = {
    reply: 'מצאתי אפשרות מתאימה.',
    questionAsked: false,
    suggestions: [{
      name: 'טוסט גבינה',
      portion: 'פרוסה אחת עם 30 גרם גבינה',
      calories: 450,
      reason: 'נשארת מתחת לתקציב.'
    }]
  };
  const service = createHttpServer({
    allowedOrigin: `http://127.0.0.1:${port}`,
    secureCookies: false,
    geminiKey: 'server-only-test-key',
    backupKey: Buffer.alloc(32, 7),
    logger: { error() {} },
    fetchImpl: async (url, options) => {
      upstreamRequest = { url, options };
      const requestBody = JSON.parse(options.body);
      const isRecommendation = Boolean(requestBody.response_format.schema.properties.suggestions);
      const outputText = isRecommendation ? JSON.stringify(recommendationOutput) : '{"items":[]}';
      return new Response(JSON.stringify({ output_text: outputText }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
  service.createUser('manager', 'correct-horse-battery-staple', 'admin');
  service.createUser('alice', 'correct-horse-battery-staple');
  service.createUser('bob', 'correct-horse-battery-staple');

  await new Promise((resolve) => service.server.listen(port, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve, reject) => service.server.close((error) => error ? reject(error) : resolve()));
    service.db.close();
  });

  const origin = `http://127.0.0.1:${port}`;
  async function login(username) {
    const response = await fetch(`${origin}/api/auth/login`, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: 'correct-horse-battery-staple' })
    });
    assert.equal(response.status, 200);
    return response.headers.get('set-cookie').split(';', 1)[0];
  }
  async function api(path, cookie, options = {}) {
    return fetch(`${origin}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.method && options.method !== 'GET' ? { Origin: origin } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...options.headers
      }
    });
  }

  const noSession = await api('/api/auth/me');
  assert.equal(noSession.status, 401);

  const manager = await login('manager');
  const created = await api('/api/admin/users', manager, {
    method: 'POST',
    body: JSON.stringify({ username: 'charlie', password: 'another-secure-password' })
  });
  assert.equal(created.status, 201);
  const users = await api('/api/admin/users', manager);
  assert.equal(users.status, 200);
  assert.equal((await users.json()).users.length, 4);

  const alice = await login('alice');
  const backupSave = await api('/api/backup', alice, {
    method: 'PUT',
    body: JSON.stringify(backup)
  });
  assert.equal(backupSave.status, 200);

  const bob = await login('bob');
  assert.equal((await api('/api/backup', bob)).status, 404);
  const aliceBackup = await api('/api/backup', alice);
  assert.equal(aliceBackup.status, 200);
  assert.deepEqual((await aliceBackup.json()).data, backup.data);

  const aiResponse = await api('/api/gemini/analyze', alice, {
    method: 'POST',
    body: JSON.stringify({ input: 'log a meal' })
  });
  assert.equal(aiResponse.status, 200);
  const aiPayload = await aiResponse.json();
  assert.deepEqual(aiPayload, { output_text: '{"items":[]}' });
  assert.equal(upstreamRequest.options.headers['x-goog-api-key'], 'server-only-test-key');
  assert.equal(JSON.stringify(aiPayload).includes('server-only-test-key'), false);
  assert.equal(upstreamRequest.options.body.includes('server-only-test-key'), false);

  const recommendation = await api('/api/gemini/recommend', alice, {
    method: 'POST',
    body: JSON.stringify({
      date: '2026-10-17',
      goal: 2000,
      eaten: 1500,
      burned: 0,
      questionsAsked: 0,
      messages: [{ role: 'user', content: 'תציע משהו חלבי עד היתרה' }]
    })
  });
  assert.equal(recommendation.status, 200);
  const recommendationBody = await recommendation.json();
  assert.equal(recommendationBody.remainingCalories, 500);
  assert.equal(recommendationBody.answer.suggestions[0].calories, 450);
  const recommendationRequest = JSON.parse(upstreamRequest.options.body);
  assert.match(recommendationRequest.input, /"availableForSuggestions":500/);
  assert.ok(recommendationRequest.response_format.schema.properties.suggestions);
  assert.equal(upstreamRequest.options.headers['x-goog-api-key'], 'server-only-test-key');

  recommendationOutput = {
    reply: 'נסה את ההצעה הזאת.',
    questionAsked: false,
    suggestions: [{
      name: 'מנה גדולה',
      portion: 'מנה',
      calories: 501,
      reason: 'משביעה.'
    }]
  };
  const overBudget = await api('/api/gemini/recommend', alice, {
    method: 'POST',
    body: JSON.stringify({
      date: '2026-10-17',
      goal: 2000,
      eaten: 1500,
      burned: 0,
      questionsAsked: 0,
      messages: [{ role: 'user', content: 'תציע משהו' }]
    })
  });
  assert.equal(overBudget.status, 502);

  const tooManyQuestions = await api('/api/gemini/recommend', alice, {
    method: 'POST',
    body: JSON.stringify({
      date: '2026-10-17',
      goal: 2000,
      eaten: 1500,
      burned: 0,
      questionsAsked: 4,
      messages: [{ role: 'user', content: 'תציע משהו' }]
    })
  });
  assert.equal(tooManyQuestions.status, 400);

  const deniedOrigin = await fetch(`${origin}/api/auth/logout`, {
    method: 'POST',
    headers: { Origin: 'https://attacker.example', Cookie: alice }
  });
  assert.equal(deniedOrigin.status, 403);
});
