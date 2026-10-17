const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function setup({ voice = false, native = false, supported = true, locked = false } = {}) {
  const elements = new Map();
  const listeners = new Map();
  const timers = new Map();
  const submissions = [];
  const recognizers = [];
  const errors = [];
  let now = 0;
  let timerId = 0;
  const element = (id) => {
    if (!elements.has(id)) {
      const classes = new Set();
      const handlers = new Map();
      const attributes = {};
      elements.set(id, {
        listeners: handlers,
        value: '', textContent: '', maxLength: 1200, dataset: {}, style: {}, readOnly: false,
        classList: {
          add: (...names) => names.forEach((name) => classes.add(name)),
          remove: (...names) => names.forEach((name) => classes.delete(name)),
          contains: (name) => classes.has(name),
          toggle: (name, force) => {
            const enabled = force === undefined ? !classes.has(name) : force;
            if (enabled) classes.add(name);
            else classes.delete(name);
          }
        },
        setAttribute: (name, value) => { attributes[name] = value; },
        getAttribute: (name) => attributes[name],
        addEventListener: (name, handler) => handlers.set(name, handler),
        click: () => handlers.get('click')?.(),
        requestSubmit: () => submissions.push({
          text: element('ai-food-description').value,
          date: element('ai-food-form').dataset.voiceDate
        })
      });
    }
    return elements.get(id);
  };
  class Recognition {
    constructor() { recognizers.push(this); this.stops = 0; this.aborts = 0; }
    start() { this.onstart?.(); }
    stop() { this.stops++; }
    abort() { this.aborts++; }
    result(text, final = true) {
      const result = [{ transcript: text }];
      result.isFinal = final;
      this.onresult({ results: [result] });
    }
    end() { this.onend?.(); }
  }
  const document = {
    hidden: false,
    getElementById: element,
    querySelector: element,
    querySelectorAll: () => [],
    addEventListener: (name, handler) => listeners.set(`document:${name}`, handler)
  };
  const window = {
    isSecureContext: true,
    caloriTrackNativeVoice: native,
    serverAuthUser: locked ? null : { id: 1 },
    location: { href: '' },
    SpeechRecognition: supported ? Recognition : undefined,
    addEventListener: (name, handler) => listeners.set(`window:${name}`, handler)
  };
  const context = vm.createContext({
    document, window, console: { error: (...args) => errors.push(args) },
    localStorage: { getItem: () => null },
    setTimeout: (fn, delay) => {
      timers.set(++timerId, { fn, at: now + delay });
      return timerId;
    },
    clearTimeout: (id) => timers.delete(id)
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), context);
  vm.runInContext(`state = {goals: {calories: 2000, protein: 135, carbs: 220, fat: 65, water: 10}, customFoods: [], days: {}, weights: []}; currentDate = '2026-10-17';`, context);
  if (voice) vm.runInContext(fs.readFileSync(path.join(root, 'voice.js'), 'utf8'), context);
  return {
    context, element, document, window, submissions, recognizers, errors,
    run: (code) => vm.runInContext(code, context),
    emit: (name, detail) => listeners.get(name)?.({ detail }),
    advance: (ms) => {
      const end = now + ms;
      while (true) {
        const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].fn();
      }
      now = end;
    }
  };
}

function food(date = '2026-10-16') {
  return {
    name: 'Eggs', date, portion: '2', calories: 156, protein: 13, carbs: 1, fat: 11,
    meal: 'breakfast', category: 'מוצרי חלב וביצים', source: 'local_database'
  };
}

test('HTML has unique IDs and all static script targets exist', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const file of ['app.js', 'auth.js', 'voice.js']) {
    const script = fs.readFileSync(path.join(root, file), 'utf8');
    for (const [, id] of script.matchAll(/getElementById\('([^']+)'\)/g)) {
      assert.ok(ids.includes(id) || id === 'inline-add-ex-btn', `${file}: ${id}`);
    }
  }
});

test('Gemini key is server-managed, and local data is account scoped', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(app, /\/api\/gemini\/analyze/);
  assert.match(app, /\$\{STORAGE_KEY\}_user_\$\{activeAccountId\}/);
  assert.doesNotMatch(app, /x-goog-api-key|unlockedGeminiApiKey/);
  assert.doesNotMatch(html, /gemini-api-key-input/);
});

test('recommendation chat handlers attach during app startup, not after food logging', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const init = app.slice(app.indexOf("document.addEventListener('DOMContentLoaded'"));
  const foodLog = init.indexOf("document.getElementById('ai-food-form')");
  const recommendationInit = init.indexOf('attachRecommendationChatListeners();');
  const navigationInit = init.indexOf('// Main View Navigation');

  assert.ok(recommendationInit > foodLog);
  assert.ok(recommendationInit < navigationInit);
  assert.equal((init.match(/getElementById\('recommendation-chat-form'\)/g) || []).length, 0);

  const env = setup();
  env.context.attachRecommendationChatListeners();
  assert.equal(env.element('recommendation-chat-form').listeners.has('submit'), true);
  assert.equal(env.element('recommendation-new-chat').listeners.has('click'), true);
});

test('recommendation budget rendering tolerates cached pages without recommendation markup', () => {
  const env = setup();
  env.run(`
    state = {goals: {calories: 2000}, days: {}, customFoods: [], weights: []};
    const originalGetElementById = document.getElementById;
    document.getElementById = (id) => id.startsWith('recommendation-budget-')
      ? null : originalGetElementById(id);
    renderRecommendationBudget();
  `);
});

test('recommendation card spans the dashboard columns on narrow layouts', () => {
  const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  assert.match(css, /#view-dashboard \.ai-recommendation-card\s*\{\s*grid-column:\s*1\s*\/\s*-1;/);
});

test('Gemini schema covers dates for food, water and exercise', () => {
  const { context } = setup();
  const schema = context.buildAiFoodSchema();
  for (const key of ['items', 'activities', 'water']) {
    assert.ok(schema.required.includes(key));
    assert.ok(schema.properties[key].items.required.includes('date'));
  }
});

test('desktop dashboard and microphone styles are not inside a mobile media query', () => {
  const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const selector of ['#view-dashboard.active {', '.voice-dock {', '.body-card {']) {
    const preceding = css.slice(0, css.indexOf(selector));
    assert.equal((preceding.match(/\{/g) || []).length - (preceding.match(/\}/g) || []).length, 0, selector);
  }
});

test('mixed records retain separate dates, and missing dates use the captured day', () => {
  const { context } = setup();
  const result = context.validateAiLog({
    items: [food(), { ...food(), date: undefined }], activities: [], water: [{ date: '2026-10-15', amountMl: 500 }], note: ''
  }, '2026-10-14');
  assert.equal(result.foods[0].date, '2026-10-16');
  assert.equal(result.foods[1].date, '2026-10-14');
  assert.equal(result.water[0].date, '2026-10-15');
  assert.equal(context.validateAiLogDate(undefined, '2026-10-14'), '2026-10-14');
});

test('invalid and impossible dates are rejected before saving', () => {
  const { context } = setup();
  for (const date of ['2026-02-30', '2026-13-01', '2026-2-01', '', 0, null]) {
    assert.throws(() => context.validateAiLogDate(date, '2026-10-17'));
  }
  assert.equal(context.validateAiLogDate('2028-02-29'), '2028-02-29');
});

test('water-only logs work; invalid water quantities fail explicitly', () => {
  const { context } = setup();
  const base = { items: [], activities: [], note: '' };
  assert.equal(context.validateAiLog({ ...base, water: [{ amountMl: 330 }] }, '2026-10-17').water[0].amountMl, 330);
  for (const entry of [null, { amountMl: -1 }, { amountMl: 0 }, { amountMl: 0.5 }, { amountMl: 10001 }]) {
    assert.throws(() => context.validateAiLog({ ...base, water: [entry] }, '2026-10-17'));
  }
});

test('basketball still uses hours, weight and activity date', () => {
  const env = setup();
  env.element('calc-weight').value = '75';
  const { prepared } = env.context.prepareAiActivities([{
    name: 'basketball', date: '2026-10-16', kind: 'basketball_3v3',
    startTime: '15:00', endTime: '17:00', durationMinutes: 0, calories: 0
  }]);
  assert.equal(prepared[0].cal, 1200);
  assert.equal(prepared[0].durationMinutes, 120);
  assert.equal(prepared[0].date, '2026-10-16');
});

test('avatar shows selected-day nutrition, water, exercise and capped fills', () => {
  const env = setup();
  env.context.renderBodyAvatar();
  assert.equal(env.element('body-food-fill').getAttribute('height'), '0');
  env.run(`
    ensureDay(currentDate).meals.breakfast.push({ cal: 1200 });
    ensureDay(currentDate).water = 5;
    ensureDay(currentDate).exercises.push({ cal: 400 });
    renderBodyAvatar();
  `);
  assert.equal(env.element('body-food-percent').textContent, '50%');
  assert.equal(env.element('body-water-percent').textContent, '50%');
  assert.equal(env.element('body-food-fill').getAttribute('height'), '139');
  assert.ok(env.element('body-figure').classList.contains('is-active'));
  env.run('ensureDay(currentDate).water = 15; renderBodyAvatar();');
  assert.equal(env.element('body-water-fill').getAttribute('height'), '278');
  assert.equal(env.element('body-water-percent').textContent, '150%');
  env.run("currentDate = '2026-10-16'; renderBodyAvatar();");
  assert.equal(env.element('body-food-percent').textContent, '0%');
  assert.equal(env.element('body-water-percent').textContent, '0%');
  assert.equal(env.element('body-figure').classList.contains('is-active'), false);
});

test('microphone is red while recording; second tap submits final transcript once', () => {
  const env = setup({ voice: true });
  env.element('voice-toggle').click();
  const recognition = env.recognizers[0];
  assert.equal(recognition.lang, 'he-IL');
  assert.ok(env.element('voice-toggle').classList.contains('is-recording'));
  recognition.result('אכלתי ביצה');
  env.element('voice-toggle').click();
  assert.equal(recognition.stops, 1);
  recognition.end();
  recognition.end();
  assert.equal(env.submissions.length, 1);
  assert.equal(env.submissions[0].text, 'אכלתי ביצה');
  assert.equal(env.element('voice-toggle').classList.contains('is-recording'), false);
});

test('silence stops after 2500ms and initial silence stops after 7000ms', () => {
  const env = setup({ voice: true });
  env.element('voice-toggle').click();
  const recognition = env.recognizers[0];
  recognition.result('שתיתי כוס מים');
  env.advance(2499);
  assert.equal(recognition.stops, 0);
  env.advance(1);
  assert.equal(recognition.stops, 1);
  recognition.end();
  assert.equal(env.submissions.length, 1);

  env.element('voice-toggle').click();
  env.advance(6999);
  assert.equal(env.recognizers[1].stops, 0);
  env.advance(1);
  assert.equal(env.recognizers[1].stops, 1);
  env.recognizers[1].end();
  assert.equal(env.submissions.length, 1);
});

test('draft is preserved and date is captured when recording starts', () => {
  const env = setup({ voice: true });
  env.element('ai-food-description').value = 'אכלתי תפוח';
  env.element('voice-toggle').click();
  env.run("currentDate = '2026-10-16';");
  env.recognizers[0].result('ושתיתי מים');
  env.recognizers[0].end();
  assert.deepEqual(env.submissions[0], { text: 'אכלתי תפוח\nושתיתי מים', date: '2026-10-17' });
});

test('permission errors preserve partial text without submitting', () => {
  const env = setup({ voice: true });
  env.element('voice-toggle').click();
  env.recognizers[0].result('אכלתי', false);
  env.recognizers[0].onerror({ error: 'not-allowed' });
  env.recognizers[0].end();
  assert.equal(env.submissions.length, 0);
  assert.equal(env.element('ai-food-description').value, 'אכלתי');
  assert.ok(env.element('voice-panel').classList.contains('is-error'));
  assert.equal(env.element('ai-food-description').readOnly, false);
});

test('interim-only and overlong text are retained but never auto-sent', () => {
  for (const [text, final] of [['אכלתי', false], ['א'.repeat(1201), true]]) {
    const env = setup({ voice: true });
    env.element('voice-toggle').click();
    env.recognizers[0].result(text, final);
    env.recognizers[0].end();
    assert.equal(env.submissions.length, 0);
    assert.equal(env.element('ai-food-description').value, text);
  }
});

test('unsupported, locked and busy states do not open microphone', () => {
  for (const options of [{ supported: false }, { locked: true }, { busy: true }]) {
    const env = setup({ voice: true, ...options });
    if (options.busy) env.run('isAiAnalysisBusy = true;');
    env.element('voice-toggle').click();
    assert.equal(env.recognizers.length, 0);
    assert.ok(env.element('voice-panel').classList.contains('is-error'));
  }
});

test('background cancels recording without sending or losing original draft', () => {
  const env = setup({ voice: true });
  env.element('ai-food-description').value = 'טיוטה';
  env.element('voice-toggle').click();
  env.recognizers[0].result('טקסט מוקלט');
  env.document.hidden = true;
  env.emit('document:visibilitychange');
  assert.equal(env.recognizers[0].aborts, 1);
  assert.equal(env.submissions.length, 0);
  assert.equal(env.element('ai-food-description').value, 'טיוטה');
});

test('native voice commands and results share the same once-only submission flow', () => {
  const env = setup({ voice: true, native: true, supported: false });
  env.element('voice-toggle').click();
  assert.equal(env.window.location.href, 'caloritrack://voice/start?session=1');
  env.emit('window:caloritrack-voice', { session: 1, type: 'start' });
  assert.ok(env.element('voice-toggle').classList.contains('is-recording'));
  env.emit('window:caloritrack-voice', { session: 9, type: 'result', text: 'ignored' });
  assert.equal(env.submissions.length, 0);
  env.element('voice-toggle').click();
  assert.equal(env.window.location.href, 'caloritrack://voice/stop?session=1');
  env.emit('window:caloritrack-voice', { session: 1, type: 'result', text: 'שיחקתי כדורסל' });
  env.emit('window:caloritrack-voice', { session: 1, type: 'result', text: 'duplicate' });
  assert.equal(env.submissions.length, 1);
});

test('microphone can be cancelled while native permission is pending', () => {
  const env = setup({ voice: true, native: true });
  env.element('voice-toggle').click();
  env.element('voice-toggle').click();
  assert.equal(env.window.location.href, 'caloritrack://voice/cancel?session=1');
  env.emit('window:caloritrack-voice', { session: 1, type: 'start' });
  assert.equal(env.submissions.length, 0);
  assert.equal(env.element('voice-toggle').classList.contains('is-recording'), false);
});
