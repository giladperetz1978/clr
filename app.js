const STORAGE_KEY = 'caloritrack_state_v2';

const DEFAULT_FOODS = [
  // חלבונים ובשר
  { id: 'f1', name: 'חזה עוף על האש / מחבת', unit: '150 גרם (מנה)', cal: 248, p: 46, c: 0, f: 5.4, cat: 'חלבונים ובשר', emoji: '🍗', quick: true },
  { id: 'f2', name: 'שניצל עוף ביתי מטוגן', unit: 'יחידה בינונית (130 גר\')', cal: 310, p: 26, c: 18, f: 14, cat: 'חלבונים ובשר', emoji: '🥩', quick: false },
  { id: 'f3', name: 'פילה סלמון אפוי', unit: '150 גרם', cal: 312, p: 30, c: 0, f: 20, cat: 'חלבונים ובשר', emoji: '🐟', quick: false },
  { id: 'f4', name: 'טונה בשמן (מסוננת)', unit: 'קופסה (110 גר\')', cal: 195, p: 28, c: 0, f: 9, cat: 'חלבונים ובשר', emoji: '🥫', quick: true },
  { id: 'f5', name: 'טונה במים', unit: 'קופסה (110 גר\')', cal: 118, p: 26, c: 0, f: 1, cat: 'חלבונים ובשר', emoji: '🥫', quick: false },
  { id: 'f6', name: 'קציצות בקר ברוטב עגבניות', unit: '3 קציצות (150 גר\')', cal: 320, p: 24, c: 10, f: 20, cat: 'חלבונים ובשר', emoji: '🍖', quick: false },
  { id: 'f7', name: 'סטייק אנטריקוט', unit: '200 גרם', cal: 540, p: 48, c: 0, f: 38, cat: 'חלבונים ובשר', emoji: '🥩', quick: false },
  { id: 'f8', name: 'טופו מוקפץ / אפוי', unit: '150 גרם', cal: 180, p: 18, c: 4, f: 10, cat: 'חלבונים ובשר', emoji: '🍲', quick: false },

  // מוצרי חלב וביצים
  { id: 'f9', name: 'ביצה קשה / חביתה', unit: 'יחידה L', cal: 78, p: 6.5, c: 0.6, f: 5.5, cat: 'מוצרי חלב וביצים', emoji: '🥚', quick: true },
  { id: 'f10', name: 'חביתה מ-2 ביצים עם מעט שמן', unit: 'מנה (2 ביצים)', cal: 195, p: 13, c: 1.2, f: 15, cat: 'מוצרי חלב וביצים', emoji: '🍳', quick: true },
  { id: 'f11', name: 'קוטג\' 5% שומן', unit: 'חצי גביע (125 גר\')', cal: 118, p: 13.5, c: 2, f: 6.2, cat: 'מוצרי חלב וביצים', emoji: '🥣', quick: true },
  { id: 'f12', name: 'גבינה לבנה 5%', unit: '2 כפות גדושות (60 גר\')', cal: 58, p: 5.7, c: 2.4, f: 3, cat: 'מוצרי חלב וביצים', emoji: '🧀', quick: false },
  { id: 'f13', name: 'יוגורט פרו 20 גרם חלבון', unit: 'גביע (200 גר\')', cal: 145, p: 20, c: 11, f: 2, cat: 'מוצרי חלב וביצים', emoji: '🥛', quick: true },
  { id: 'f14', name: 'גבינה צהובה 28%', unit: 'פרוסה (25 גר\')', cal: 88, p: 6.2, c: 0.2, f: 7, cat: 'מוצרי חלב וביצים', emoji: '🧀', quick: false },
  { id: 'f15', name: 'גבינה בולגרית 5%', unit: '50 גרם', cal: 55, p: 8, c: 1, f: 2.5, cat: 'מוצרי חלב וביצים', emoji: '🧀', quick: false },

  // לחם, דגנים ופחמימות
  { id: 'f16', name: 'פרוסת לחם מחמצת / מלא', unit: 'פרוסה (35 גר\')', cal: 85, p: 3.5, c: 15, f: 1, cat: 'לחם, דגנים ופחמימות', emoji: '🍞', quick: true },
  { id: 'f17', name: 'לחם קל', unit: '2 פרוסות', cal: 78, p: 4.5, c: 13, f: 0.8, cat: 'לחם, דגנים ופחמימות', emoji: '🍞', quick: false },
  { id: 'f18', name: 'פיתה רגילה', unit: 'יחידה (100 גר\')', cal: 265, p: 9, c: 54, f: 1.2, cat: 'לחם, דגנים ופחמימות', emoji: '🫓', quick: false },
  { id: 'f19', name: 'אורז לבן / בסמטי מבושל', unit: 'כוס מבושלת (160 גר\')', cal: 205, p: 4.3, c: 45, f: 0.4, cat: 'לחם, דגנים ופחמימות', emoji: '🍚', quick: true },
  { id: 'f20', name: 'פסטה מבושלת', unit: 'כוס מבושלת (160 גר\')', cal: 220, p: 8, c: 43, f: 1.3, cat: 'לחם, דגנים ופחמימות', emoji: '🍝', quick: false },
  { id: 'f21', name: 'קינואה מבושלת', unit: 'כוס (185 גר\')', cal: 222, p: 8, c: 39, f: 3.6, cat: 'לחם, דגנים ופחמימות', emoji: '🌾', quick: false },
  { id: 'f22', name: 'תפוח אדמה אפוי בתנור', unit: 'יחידה בינונית (170 גר\')', cal: 160, p: 4, c: 36, f: 0.2, cat: 'לחם, דגנים ופחמימות', emoji: '🥔', quick: false },
  { id: 'f23', name: 'בטטה אפויה', unit: 'יחידה בינונית (150 גר\')', cal: 135, p: 2.5, c: 31, f: 0.2, cat: 'לחם, דגנים ופחמימות', emoji: '🍠', quick: false },
  { id: 'f24', name: 'דייסת שיבולת שועל (קוואקר)', unit: 'קערה על בסיס מים/חלב', cal: 230, p: 9, c: 38, f: 4.5, cat: 'לחם, דגנים ופחמימות', emoji: '🥣', quick: false },
  { id: 'f25', name: 'פריכיות אורז', unit: '2 יחידות', cal: 70, p: 1.5, c: 15, f: 0.4, cat: 'לחם, דגנים ופחמימות', emoji: '🍘', quick: false },

  // ירקות ופירות
  { id: 'f26', name: 'סלט ירקות ישראלי קצוץ (עם כפית שמן זית)', unit: 'קערה בינונית', cal: 115, p: 2, c: 12, f: 7, cat: 'ירקות ופירות', emoji: '🥗', quick: true },
  { id: 'f27', name: 'בננה', unit: 'יחידה בינונית', cal: 105, p: 1.3, c: 27, f: 0.4, cat: 'ירקות ופירות', emoji: '🍌', quick: true },
  { id: 'f28', name: 'תפוח עץ', unit: 'יחידה בינונית', cal: 95, p: 0.5, c: 25, f: 0.3, cat: 'ירקות ופירות', emoji: '🍎', quick: true },
  { id: 'f29', name: 'תמר מג\'הול', unit: '2 יחידות', cal: 132, p: 0.8, c: 36, f: 0.1, cat: 'ירקות ופירות', emoji: '🌴', quick: false },
  { id: 'f30', name: 'אבוקדו', unit: 'חצי יחידה (80 גר\')', cal: 128, p: 1.6, c: 7, f: 12, cat: 'ירקות ופירות', emoji: '🥑', quick: false },

  // שומנים, אגוזים וממרחים
  { id: 'f31', name: 'טחינה מוכנה', unit: 'כף גדושה (25 גר\')', cal: 85, p: 2.8, c: 2, f: 7.5, cat: 'שומנים, אגוזים וממרחים', emoji: '🥣', quick: false },
  { id: 'f32', name: 'חומוס למריחה', unit: 'כף גדושה (30 גר\')', cal: 75, p: 2.2, c: 5, f: 5, cat: 'שומנים, אגוזים וממרחים', emoji: '🧆', quick: false },
  { id: 'f33', name: 'שמן זית', unit: 'כף (10 מ"ל)', cal: 90, p: 0, c: 0, f: 10, cat: 'שומנים, אגוזים וממרחים', emoji: '🫒', quick: false },
  { id: 'f34', name: 'שקדים / אגוזי מלך טבעיים', unit: 'חופן קטן (25 גר\')', cal: 155, p: 5, c: 4, f: 14, cat: 'שומנים, אגוזים וממרחים', emoji: '🥜', quick: false },
  { id: 'f35', name: 'חמאת בוטנים טבעית', unit: 'כף (20 גר\')', cal: 118, p: 5, c: 4, f: 10, cat: 'שומנים, אגוזים וממרחים', emoji: '🥜', quick: false },

  // מאכלים ישראליים ומהירים
  { id: 'f36', name: 'שקשוקה (2 ביצים ברוטב עגבניות)', unit: 'מנה אישית', cal: 280, p: 15, c: 14, f: 18, cat: 'מאכלים ישראליים ומהירים', emoji: '🍅', quick: false },
  { id: 'f37', name: 'מנת פלאפל בפיתה עם סלט וטחינה', unit: 'מנה שלמה', cal: 680, p: 21, c: 88, f: 26, cat: 'מאכלים ישראליים ומהירים', emoji: '🧆', quick: false },
  { id: 'f38', name: 'שווארמה הודו/פרגית בפיתה', unit: 'מנה', cal: 740, p: 42, c: 68, f: 32, cat: 'מאכלים ישראליים ומהירים', emoji: '🥙', quick: false },
  { id: 'f39', name: 'משולש פיצה', unit: 'משולש רגיל', cal: 285, p: 12, c: 34, f: 11, cat: 'מאכלים ישראליים ומהירים', emoji: '🍕', quick: false },
  { id: 'f40', name: 'כריך חביתה / גבינה בבית קפה', unit: 'כריך שלם', cal: 460, p: 20, c: 48, f: 21, cat: 'מאכלים ישראליים ומהירים', emoji: '🥪', quick: false },
  { id: 'f41', name: 'סושי מאקי / רול אינסייד אאוט (8 יח\')', unit: 'רול אחד (8 יח\')', cal: 330, p: 14, c: 52, f: 7, cat: 'מאכלים ישראליים ומהירים', emoji: '🍣', quick: false },

  // חטיפים, מתוקים ומשקאות
  { id: 'f42', name: 'קפה הפוך / נס קפה על חלב (ללא סוכר)', unit: 'כוס (240 מ"ל)', cal: 95, p: 5, c: 7.5, f: 5, cat: 'חטיפים, מתוקים ומשקאות', emoji: '☕', quick: true },
  { id: 'f43', name: 'שייק / אבקת חלבון (סקופ במים)', unit: 'מנה (30 גר\')', cal: 120, p: 24, c: 3, f: 1.5, cat: 'חטיפים, מתוקים ומשקאות', emoji: '🥤', quick: true },
  { id: 'f44', name: 'חטיף במבה קטן', unit: 'שקית אישית (25 גר\')', cal: 134, p: 4.3, c: 12.5, f: 8.8, cat: 'חטיפים, מתוקים ומשקאות', emoji: '🥨', quick: false },
  { id: 'f45', name: 'שוקולד מריר / חלב', unit: 'שורה (4 קוביות / 20 גר\')', cal: 110, p: 1.5, c: 11, f: 6.8, cat: 'חטיפים, מתוקים ומשקאות', emoji: '🍫', quick: false },
  { id: 'f46', name: 'חטיף חלבון', unit: 'יחידה (60 גר\')', cal: 210, p: 20, c: 20, f: 7, cat: 'חטיפים, מתוקים ומשקאות', emoji: '🍫', quick: false }
];

const MEAL_DEFINITIONS = [
  { key: 'breakfast', title: 'ארוחת בוקר', emoji: '🌅' },
  { key: 'lunch', title: 'ארוחת צהריים', emoji: '☀️' },
  { key: 'dinner', title: 'ארוחת ערב', emoji: '🌙' },
  { key: 'snacks', title: 'נשנושים וביניים', emoji: '🍎' }
];

function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDefaultDayLog() {
  return {
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    },
    exercises: [],
    water: 0
  };
}

function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        goals: {
          calories: parsed.goals?.calories || 2000,
          protein: parsed.goals?.protein || 135,
          carbs: parsed.goals?.carbs || 220,
          fat: parsed.goals?.fat || 65,
          water: parsed.goals?.water || 10
        },
        customFoods: Array.isArray(parsed.customFoods) ? parsed.customFoods : [],
        days: parsed.days && typeof parsed.days === 'object' ? parsed.days : {},
        weights: Array.isArray(parsed.weights) ? parsed.weights : []
      };
    }
  } catch (err) {
    console.error('Failed loading state:', err);
  }

  return {
    goals: {
      calories: 2000,
      protein: 135,
      carbs: 220,
      fat: 65,
      water: 10
    },
    customFoods: [],
    days: {},
    weights: []
  };
}

const state = loadAppState();
let currentDate = getTodayDateString();
let activeDbCategory = 'all';
let selectedModalFood = null;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed saving state:', err);
  }
}

function ensureDay(dateStr) {
  if (!state.days[dateStr]) {
    state.days[dateStr] = getDefaultDayLog();
  }
  const day = state.days[dateStr];
  if (!day.meals) day.meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
  if (!Array.isArray(day.exercises)) day.exercises = [];
  if (typeof day.water !== 'number') day.water = 0;
  return day;
}

function getAllFoods() {
  return [...state.customFoods, ...DEFAULT_FOODS];
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2700);
}

function formatHebrewDate(dateStr) {
  const today = getTodayDateString();
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const formatted = dt.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  if (dateStr === today) {
    return { main: 'היום', sub: formatted, isToday: true };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === yStr) {
    return { main: 'אתמול', sub: formatted, isToday: false };
  }

  return { main: formatted, sub: dateStr, isToday: false };
}

function computeDayTotals(dateStr) {
  const day = ensureDay(dateStr);
  let eaten = 0;
  let p = 0;
  let c = 0;
  let f = 0;

  Object.values(day.meals).forEach((mealList) => {
    mealList.forEach((item) => {
      eaten += Number(item.cal) || 0;
      p += Number(item.p) || 0;
      c += Number(item.c) || 0;
      f += Number(item.f) || 0;
    });
  });

  const burned = day.exercises.reduce((acc, ex) => acc + (Number(ex.cal) || 0), 0);

  return {
    eaten: Math.round(eaten),
    burned: Math.round(burned),
    p: Math.round(p * 10) / 10,
    c: Math.round(c * 10) / 10,
    f: Math.round(f * 10) / 10
  };
}

function getDefaultMealByHour() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 18 && hour < 23) return 'dinner';
  return 'snacks';
}

/* ================= RENDER DASHBOARD ================= */
function renderDateHeader() {
  const info = formatHebrewDate(currentDate);
  document.getElementById('current-date-label').textContent = info.main;
  document.getElementById('current-date-sub').textContent = info.sub;
  document.getElementById('date-picker-input').value = currentDate;
  const todayBtn = document.getElementById('jump-today-btn');
  todayBtn.classList.toggle('hidden', info.isToday);
}

function renderSummaryHero() {
  const totals = computeDayTotals(currentDate);
  const goal = state.goals.calories;
  const netBudget = goal + totals.burned;
  const remaining = netBudget - totals.eaten;

  document.getElementById('summary-goal').textContent = goal.toLocaleString();
  document.getElementById('summary-eaten').textContent = totals.eaten.toLocaleString();
  document.getElementById('summary-burned').textContent = totals.burned.toLocaleString();

  const remEl = document.getElementById('summary-remaining');
  const statusLabel = document.getElementById('ring-status-label');
  const ringFill = document.getElementById('calorie-ring-fill');

  if (remaining >= 0) {
    statusLabel.textContent = 'נותרו להיום';
    remEl.textContent = remaining.toLocaleString();
    remEl.classList.remove('over-limit');
    ringFill.classList.remove('over-limit');
  } else {
    statusLabel.textContent = 'חריגה מהיעד';
    remEl.textContent = `+${Math.abs(remaining).toLocaleString()}`;
    remEl.classList.add('over-limit');
    ringFill.classList.add('over-limit');
  }

  const circumference = 465;
  const ratio = Math.min(totals.eaten / Math.max(netBudget, 1), 1);
  const offset = circumference - ratio * circumference;
  ringFill.style.strokeDashoffset = String(offset);

  // Macros
  document.getElementById('macro-protein-val').textContent = Math.round(totals.p);
  document.getElementById('macro-protein-goal').textContent = state.goals.protein;
  document.getElementById('macro-protein-bar').style.width = `${Math.min((totals.p / Math.max(state.goals.protein, 1)) * 100, 100)}%`;

  document.getElementById('macro-carbs-val').textContent = Math.round(totals.c);
  document.getElementById('macro-carbs-goal').textContent = state.goals.carbs;
  document.getElementById('macro-carbs-bar').style.width = `${Math.min((totals.c / Math.max(state.goals.carbs, 1)) * 100, 100)}%`;

  document.getElementById('macro-fat-val').textContent = Math.round(totals.f);
  document.getElementById('macro-fat-goal').textContent = state.goals.fat;
  document.getElementById('macro-fat-bar').style.width = `${Math.min((totals.f / Math.max(state.goals.fat, 1)) * 100, 100)}%`;
}

function renderQuickChips() {
  const container = document.getElementById('quick-chips-container');
  container.innerHTML = '';
  const quickFoods = getAllFoods().filter((f) => f.quick).slice(0, 12);

  quickFoods.forEach((food) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'quick-chip';
    chip.innerHTML = `<span>${food.emoji || '🍽️'} ${food.name}</span> <small>${food.cal} קק"ל</small>`;
    chip.addEventListener('click', () => {
      const targetMeal = getDefaultMealByHour();
      addFoodEntryToDay(targetMeal, {
        id: 'entry_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: food.name,
        portion: food.unit,
        cal: food.cal,
        p: food.p,
        c: food.c,
        f: food.f
      });
      const mealObj = MEAL_DEFINITIONS.find((m) => m.key === targetMeal);
      showToast(`נוסף ל${mealObj ? mealObj.title : 'יומן'}: ${food.name}`);
    });
    container.appendChild(chip);
  });
}

function renderMealsCards() {
  const container = document.getElementById('meals-container');
  container.innerHTML = '';
  const day = ensureDay(currentDate);

  MEAL_DEFINITIONS.forEach((mealDef) => {
    const entries = day.meals[mealDef.key] || [];
    const mealTotalCal = entries.reduce((sum, item) => sum + (Number(item.cal) || 0), 0);

    const card = document.createElement('div');
    card.className = 'meal-card';

    const listHtml = entries.length === 0
      ? `<li class="meal-empty">טרם נרשמו מאכלים ב${mealDef.title}</li>`
      : entries.map((item) => `
          <li class="log-item">
            <div class="log-item-info">
              <span class="log-item-name">${escapeHtml(item.name)}</span>
              <span class="log-item-meta">${escapeHtml(item.portion || 'מנה')} • חלבון: ${Math.round(item.p || 0)}ג' | פחמ': ${Math.round(item.c || 0)}ג' | שומן: ${Math.round(item.f || 0)}ג'</span>
            </div>
            <div class="log-item-right">
              <span class="log-item-cal">${Math.round(item.cal)} קק"ל</span>
              <button type="button" class="delete-entry-btn" data-del-meal="${mealDef.key}" data-del-id="${item.id}" title="מחק פריט">🗑️</button>
            </div>
          </li>
        `).join('');

    card.innerHTML = `
      <div>
        <div class="meal-card-header">
          <div class="meal-title-wrap">
            <span class="meal-emoji">${mealDef.emoji}</span>
            <h3>${mealDef.title}</h3>
          </div>
          <span class="meal-cal-total">${Math.round(mealTotalCal)} קק"ל</span>
        </div>
        <ul class="meal-items-list">${listHtml}</ul>
      </div>
      <button type="button" class="meal-add-trigger" data-open-meal="${mealDef.key}">➕ הוסף ל${mealDef.title}</button>
    `;

    container.appendChild(card);
  });

  // Exercise Card
  const exercises = day.exercises || [];
  const totalBurned = exercises.reduce((s, e) => s + (Number(e.cal) || 0), 0);
  const exCard = document.createElement('div');
  exCard.className = 'meal-card exercise-card';

  const exListHtml = exercises.length === 0
    ? `<li class="meal-empty">לא נרשמה פעילות גופנית היום</li>`
    : exercises.map((ex) => `
        <li class="log-item">
          <div class="log-item-info">
            <span class="log-item-name">🏃 ${escapeHtml(ex.name)}</span>
          </div>
          <div class="log-item-right">
            <span class="log-item-cal burned-text">-${Math.round(ex.cal)} קק"ל</span>
            <button type="button" class="delete-entry-btn" data-del-ex="${ex.id}" title="מחק אימון">🗑️</button>
          </div>
        </li>
      `).join('');

  exCard.innerHTML = `
    <div>
      <div class="meal-card-header">
        <div class="meal-title-wrap">
          <span class="meal-emoji">🔥</span>
          <h3>פעילות גופנית ואימונים</h3>
        </div>
        <span class="meal-cal-total">${Math.round(totalBurned)} קק"ל נשרפו</span>
      </div>
      <ul class="meal-items-list">${exListHtml}</ul>
    </div>
    <button type="button" class="meal-add-trigger" id="inline-add-ex-btn">➕ הוסף אימון / פעילות גופנית</button>
  `;
  container.appendChild(exCard);

  // Bind events
  container.querySelectorAll('[data-open-meal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openAddFoodModal(btn.getAttribute('data-open-meal'));
    });
  });

  container.querySelectorAll('[data-del-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mealKey = btn.getAttribute('data-del-meal');
      const entryId = btn.getAttribute('data-del-id');
      day.meals[mealKey] = day.meals[mealKey].filter((item) => item.id !== entryId);
      saveState();
      renderAll();
      showToast('הפריט הוסר מהיומן');
    });
  });

  container.querySelectorAll('[data-del-ex]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const exId = btn.getAttribute('data-del-ex');
      day.exercises = day.exercises.filter((e) => e.id !== exId);
      saveState();
      renderAll();
      showToast('האימון הוסר');
    });
  });

  document.getElementById('inline-add-ex-btn')?.addEventListener('click', () => {
    document.getElementById('add-exercise-modal').classList.remove('hidden');
  });
}

function renderWaterTracker() {
  const day = ensureDay(currentDate);
  const waterGoal = state.goals.water || 10;
  document.getElementById('water-goal-text').textContent = waterGoal;
  document.getElementById('water-goal-val').textContent = waterGoal;
  document.getElementById('water-count-val').textContent = day.water;
  document.getElementById('water-ml-val').textContent = day.water * 250;

  const grid = document.getElementById('water-glasses-container');
  grid.innerHTML = '';
  const totalSlots = Math.max(waterGoal, day.water);

  for (let i = 1; i <= totalSlots; i++) {
    const glass = document.createElement('button');
    glass.type = 'button';
    glass.className = 'water-glass' + (i <= day.water ? ' filled' : '');
    glass.textContent = '🥤';
    glass.title = `כוס ${i} (${i * 250} מ"ל)`;
    glass.addEventListener('click', () => {
      day.water = day.water === i ? i - 1 : i;
      saveState();
      renderWaterTracker();
    });
    grid.appendChild(glass);
  }
}

/* ================= RENDER FOOD DATABASE VIEW ================= */
function renderFoodDatabaseView() {
  const query = (document.getElementById('db-search-input')?.value || '').trim().toLowerCase();
  const listEl = document.getElementById('food-db-list');
  if (!listEl) return;

  const allFoods = getAllFoods().filter((item) => {
    const matchesCat = activeDbCategory === 'all' || item.cat === activeDbCategory;
    const matchesSearch = !query || item.name.toLowerCase().includes(query) || (item.cat && item.cat.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  if (allFoods.length === 0) {
    listEl.innerHTML = `<p class="meal-empty" style="grid-column: 1 / -1;">לא נמצאו מאכלים התואמים לחיפוש. תוכל להוסיף מאכל אישי חדש!</p>`;
    return;
  }

  listEl.innerHTML = allFoods.map((food) => `
    <div class="food-db-card">
      <div>
        <div class="food-db-top">
          <div>
            <span class="food-db-title">${food.emoji || '🍽️'} ${escapeHtml(food.name)}</span>
            <span class="food-db-unit">${escapeHtml(food.unit)}</span>
          </div>
          <span class="food-db-cal-badge">${food.cal} קק"ל</span>
        </div>
        <div class="food-db-macros">
          <span>חלבון: <b>${food.p}ג'</b></span>
          <span>פחמ': <b>${food.c}ג'</b></span>
          <span>שומן: <b>${food.f}ג'</b></span>
        </div>
      </div>
      <div class="food-db-actions">
        <button type="button" class="primary-btn btn-sm full-width" data-db-add="${food.id}">➕ הוסף ליומן היומי</button>
        ${food.isCustom ? `<button type="button" class="danger-btn btn-sm" data-db-del="${food.id}" title="מחק מהמאגר">🗑️</button>` : ''}
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('[data-db-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fId = btn.getAttribute('data-db-add');
      const food = getAllFoods().find((x) => x.id === fId);
      if (!food) return;
      openAddFoodModal(getDefaultMealByHour(), food);
    });
  });

  listEl.querySelectorAll('[data-db-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fId = btn.getAttribute('data-db-del');
      state.customFoods = state.customFoods.filter((x) => x.id !== fId);
      saveState();
      renderAll();
      showToast('המאכל האישי נמחק מהמאגר');
    });
  });
}

/* ================= RENDER STATS VIEW ================= */
function renderStatsView() {
  const goal = state.goals.calories;
  document.getElementById('chart-goal-indicator').textContent = goal;

  const daysData = [];
  const baseDate = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const totals = computeDayTotals(dStr);
    const shortLabel = d.toLocaleDateString('he-IL', { weekday: 'short' });
    daysData.push({ dateStr: dStr, label: shortLabel, ...totals });
  }

  const activeDays = daysData.filter((d) => d.eaten > 0);
  const avgCal = activeDays.length > 0
    ? Math.round(activeDays.reduce((s, d) => s + d.eaten, 0) / activeDays.length)
    : 0;

  const onTargetCount = activeDays.filter((d) => d.eaten <= (goal + d.burned + 100)).length;
  const totalBurnedWeek = daysData.reduce((s, d) => s + d.burned, 0);

  // Calculate active streak
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const t = computeDayTotals(dStr);
    if (t.eaten > 0 || t.burned > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  document.getElementById('stat-avg-calories').textContent = avgCal.toLocaleString();
  document.getElementById('stat-days-on-target').textContent = `${onTargetCount} / ${activeDays.length || 7}`;
  document.getElementById('stat-weekly-burned').textContent = totalBurnedWeek.toLocaleString();
  document.getElementById('stat-streak').textContent = `${streak} 🔥`;

  // Weekly Bar Chart
  const chartContainer = document.getElementById('weekly-chart-bars');
  const maxCal = Math.max(goal * 1.25, ...daysData.map((d) => d.eaten), 1000);

  chartContainer.innerHTML = daysData.map((d) => {
    const pct = Math.min(Math.round((d.eaten / maxCal) * 100), 100);
    const isOver = d.eaten > (goal + d.burned);
    return `
      <div class="chart-col">
        <span class="chart-bar-val">${d.eaten > 0 ? d.eaten : '-'}</span>
        <div class="chart-bar-wrap">
          <div class="chart-bar-fill ${isOver ? 'over' : ''}" style="height: ${pct}%"></div>
        </div>
        <span class="chart-day-label">${d.label}</span>
      </div>
    `;
  }).join('');

  // Weight History
  const weightList = document.getElementById('weight-history-list');
  if (state.weights.length === 0) {
    weightList.innerHTML = `<span class="card-subtitle">טרם נרשמו שקילות. הזן משקל למעלה כדי להתחיל מעקב.</span>`;
  } else {
    weightList.innerHTML = state.weights
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 12)
      .map((w) => `
        <div class="weight-pill">
          <strong>${w.weight} ק"ג</strong>
          <small>${w.date}</small>
        </div>
      `).join('');
  }
}

/* ================= RENDER GOALS VIEW ================= */
function populateGoalsForm() {
  document.getElementById('goal-calories-input').value = state.goals.calories;
  document.getElementById('goal-protein-input').value = state.goals.protein;
  document.getElementById('goal-carbs-input').value = state.goals.carbs;
  document.getElementById('goal-fat-input').value = state.goals.fat;
  document.getElementById('goal-water-input').value = state.goals.water;
}

/* ================= ADD FOOD MODAL LOGIC ================= */
function openAddFoodModal(mealKey = 'breakfast', preselectedFood = null) {
  const modal = document.getElementById('add-food-modal');
  modal.classList.remove('hidden');
  document.getElementById('modal-meal-select').value = mealKey;

  const searchInput = document.getElementById('modal-food-search');
  searchInput.value = '';
  selectedModalFood = preselectedFood || getAllFoods()[0];
  document.getElementById('sel-food-qty').value = 1;

  renderModalFoodList('');
  updateSelectedFoodPreview();
}

function renderModalFoodList(query) {
  const container = document.getElementById('modal-food-results');
  const q = query.trim().toLowerCase();
  const matches = getAllFoods().filter((f) => !q || f.name.toLowerCase().includes(q) || (f.cat && f.cat.toLowerCase().includes(q)));

  container.innerHTML = matches.slice(0, 25).map((food) => {
    const isSel = selectedModalFood && selectedModalFood.id === food.id;
    return `
      <div class="modal-food-option ${isSel ? 'selected' : ''}" data-select-food="${food.id}">
        <div>
          <strong>${food.emoji || '🍽️'} ${escapeHtml(food.name)}</strong>
          <small style="display:block;color:#94a3b8;font-size:0.76rem;">${escapeHtml(food.unit)} • ח:${food.p}ג' פ:${food.c}ג' ש:${food.f}ג'</small>
        </div>
        <span class="food-db-cal-badge">${food.cal} קק"ל</span>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-select-food]').forEach((el) => {
    el.addEventListener('click', () => {
      const fId = el.getAttribute('data-select-food');
      selectedModalFood = getAllFoods().find((x) => x.id === fId);
      renderModalFoodList(document.getElementById('modal-food-search').value);
      updateSelectedFoodPreview();
    });
  });
}

function updateSelectedFoodPreview() {
  const box = document.getElementById('selected-food-config');
  if (!selectedModalFood) {
    box.classList.add('hidden');
    return;
  }
  box.classList.remove('hidden');
  const qty = Math.max(0.1, parseFloat(document.getElementById('sel-food-qty').value) || 1);

  document.getElementById('sel-food-name').textContent = `${selectedModalFood.emoji || '🍽️'} ${selectedModalFood.name}`;
  document.getElementById('sel-food-unit-label').textContent = selectedModalFood.unit;
  document.getElementById('sel-preview-cal').textContent = Math.round(selectedModalFood.cal * qty);
  document.getElementById('sel-preview-p').textContent = Math.round(selectedModalFood.p * qty * 10) / 10;
  document.getElementById('sel-preview-c').textContent = Math.round(selectedModalFood.c * qty * 10) / 10;
  document.getElementById('sel-preview-f').textContent = Math.round(selectedModalFood.f * qty * 10) / 10;
}

function addFoodEntryToDay(mealKey, entry) {
  const day = ensureDay(currentDate);
  if (!day.meals[mealKey]) day.meals[mealKey] = [];
  day.meals[mealKey].push(entry);
  saveState();
  renderAll();
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderAll() {
  renderDateHeader();
  renderSummaryHero();
  renderQuickChips();
  renderMealsCards();
  renderWaterTracker();
  renderFoodDatabaseView();
  renderStatsView();
  populateGoalsForm();
}

/* ================= EVENT LISTENERS ================= */
document.addEventListener('DOMContentLoaded', () => {
  renderAll();

  // Main View Navigation
  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.view-section').forEach((v) => v.classList.remove('active'));
      tab.classList.add('active');
      const targetView = tab.getAttribute('data-view');
      document.getElementById(`view-${targetView}`)?.classList.add('active');
      renderAll();
    });
  });

  // Date navigation
  document.getElementById('prev-day-btn').addEventListener('click', () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d - 1);
    currentDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    renderAll();
  });

  document.getElementById('next-day-btn').addEventListener('click', () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d + 1);
    currentDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    renderAll();
  });

  document.getElementById('date-picker-input').addEventListener('change', (e) => {
    if (e.target.value) {
      currentDate = e.target.value;
      renderAll();
    }
  });

  document.getElementById('jump-today-btn').addEventListener('click', () => {
    currentDate = getTodayDateString();
    renderAll();
  });

  // Water buttons
  document.getElementById('water-plus-btn').addEventListener('click', () => {
    const day = ensureDay(currentDate);
    day.water += 1;
    saveState();
    renderWaterTracker();
    showToast('נוספה כוס מים 💧');
  });

  document.getElementById('water-minus-btn').addEventListener('click', () => {
    const day = ensureDay(currentDate);
    if (day.water > 0) {
      day.water -= 1;
      saveState();
      renderWaterTracker();
    }
  });

  // Open Modals
  document.getElementById('open-add-food-btn').addEventListener('click', () => {
    openAddFoodModal(getDefaultMealByHour());
  });

  document.getElementById('open-add-exercise-btn').addEventListener('click', () => {
    document.getElementById('add-exercise-modal').classList.remove('hidden');
  });

  document.getElementById('open-custom-food-modal-btn').addEventListener('click', () => {
    document.getElementById('custom-food-modal').classList.remove('hidden');
  });

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close');
      document.getElementById(targetId)?.classList.add('hidden');
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.add('hidden');
    });
  });

  // Modal Tabs
  document.querySelectorAll('.modal-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.modal-tab-content').forEach((c) => c.classList.remove('active'));
      tab.classList.add('active');
      const mtab = tab.getAttribute('data-mtab');
      document.getElementById(`mtab-${mtab}`)?.classList.add('active');
    });
  });

  // Modal Food Search & Quantity
  document.getElementById('modal-food-search').addEventListener('input', (e) => {
    renderModalFoodList(e.target.value);
  });

  document.getElementById('sel-food-qty').addEventListener('input', updateSelectedFoodPreview);

  document.getElementById('qty-up-btn').addEventListener('click', () => {
    const input = document.getElementById('sel-food-qty');
    input.value = Math.round(((parseFloat(input.value) || 1) + 0.5) * 100) / 100;
    updateSelectedFoodPreview();
  });

  document.getElementById('qty-down-btn').addEventListener('click', () => {
    const input = document.getElementById('sel-food-qty');
    const next = Math.max(0.25, (parseFloat(input.value) || 1) - 0.5);
    input.value = Math.round(next * 100) / 100;
    updateSelectedFoodPreview();
  });

  document.getElementById('confirm-add-db-food-btn').addEventListener('click', () => {
    if (!selectedModalFood) return;
    const qty = Math.max(0.1, parseFloat(document.getElementById('sel-food-qty').value) || 1);
    const mealKey = document.getElementById('modal-meal-select').value;

    addFoodEntryToDay(mealKey, {
      id: 'entry_' + Date.now(),
      name: selectedModalFood.name,
      portion: qty === 1 ? selectedModalFood.unit : `${qty} × ${selectedModalFood.unit}`,
      cal: Math.round(selectedModalFood.cal * qty),
      p: Math.round(selectedModalFood.p * qty * 10) / 10,
      c: Math.round(selectedModalFood.c * qty * 10) / 10,
      f: Math.round(selectedModalFood.f * qty * 10) / 10
    });

    document.getElementById('add-food-modal').classList.add('hidden');
    showToast(`נוסף ליומן: ${selectedModalFood.name}`);
  });

  // Manual Entry Form
  document.getElementById('manual-food-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('manual-food-name').value.trim();
    const cal = Number(document.getElementById('manual-food-cal').value) || 0;
    const portion = document.getElementById('manual-food-portion').value.trim() || 'מנה אחת';
    const p = Number(document.getElementById('manual-food-p').value) || 0;
    const c = Number(document.getElementById('manual-food-c').value) || 0;
    const f = Number(document.getElementById('manual-food-f').value) || 0;
    const mealKey = document.getElementById('modal-meal-select').value;
    const saveToDb = document.getElementById('save-to-custom-db-check').checked;

    if (!name) return;

    if (saveToDb) {
      state.customFoods.unshift({
        id: 'custom_' + Date.now(),
        name,
        unit: portion,
        cal,
        p,
        c,
        f,
        cat: 'אישי',
        emoji: '⭐',
        quick: true,
        isCustom: true
      });
    }

    addFoodEntryToDay(mealKey, {
      id: 'entry_' + Date.now(),
      name,
      portion,
      cal,
      p,
      c,
      f
    });

    e.target.reset();
    document.getElementById('add-food-modal').classList.add('hidden');
    showToast(`נוסף ליומן: ${name}`);
  });

  // Exercise Presets & Form
  document.querySelectorAll('.ex-preset-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.getElementById('exercise-name-input').value = chip.getAttribute('data-name');
      document.getElementById('exercise-cal-input').value = chip.getAttribute('data-cal');
    });
  });

  document.getElementById('exercise-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('exercise-name-input').value.trim();
    const cal = Number(document.getElementById('exercise-cal-input').value) || 0;
    if (!name || cal <= 0) return;

    const day = ensureDay(currentDate);
    day.exercises.push({
      id: 'ex_' + Date.now(),
      name,
      cal
    });
    saveState();
    e.target.reset();
    document.getElementById('add-exercise-modal').classList.add('hidden');
    renderAll();
    showToast(`אימון נוסף: ${name} (${cal} קק"ל)`);
  });

  // Food DB Search & Category Filter
  document.getElementById('db-search-input').addEventListener('input', renderFoodDatabaseView);

  document.querySelectorAll('#db-category-pills .cat-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#db-category-pills .cat-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      activeDbCategory = pill.getAttribute('data-cat');
      renderFoodDatabaseView();
    });
  });

  // Custom Food Modal Form
  document.getElementById('custom-food-db-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const unit = document.getElementById('cf-unit').value.trim();
    const cal = Number(document.getElementById('cf-cal').value) || 0;
    const p = Number(document.getElementById('cf-p').value) || 0;
    const c = Number(document.getElementById('cf-c').value) || 0;
    const f = Number(document.getElementById('cf-f').value) || 0;

    state.customFoods.unshift({
      id: 'custom_' + Date.now(),
      name,
      unit,
      cal,
      p,
      c,
      f,
      cat: 'אישי',
      emoji: '⭐',
      quick: true,
      isCustom: true
    });
    saveState();
    e.target.reset();
    document.getElementById('custom-food-modal').classList.add('hidden');
    renderAll();
    showToast(`"${name}" נשמר במאגר האישי שלך`);
  });

  // Goals Form
  document.getElementById('goals-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.goals.calories = Number(document.getElementById('goal-calories-input').value) || 2000;
    state.goals.protein = Number(document.getElementById('goal-protein-input').value) || 135;
    state.goals.carbs = Number(document.getElementById('goal-carbs-input').value) || 220;
    state.goals.fat = Number(document.getElementById('goal-fat-input').value) || 65;
    state.goals.water = Number(document.getElementById('goal-water-input').value) || 10;
    saveState();
    renderAll();
    showToast('היעדים היומיים נשמרו בהצלחה 🎯');
  });

  // Smart TDEE Calculator
  document.getElementById('tdee-calc-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const gender = document.getElementById('calc-gender').value;
    const age = Number(document.getElementById('calc-age').value) || 30;
    const weight = Number(document.getElementById('calc-weight').value) || 75;
    const height = Number(document.getElementById('calc-height').value) || 175;
    const activity = parseFloat(document.getElementById('calc-activity').value) || 1.375;
    const delta = Number(document.getElementById('calc-target').value) || 0;

    // Mifflin-St Jeor Equation
    const bmr = gender === 'male'
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161;

    const tdee = Math.round(bmr * activity);
    const recommendedCal = Math.max(1200, Math.round((tdee + delta) / 10) * 10);
    const recProtein = Math.round(weight * 1.8);
    const recFat = Math.round((recommendedCal * 0.27) / 9);
    const recCarbs = Math.max(50, Math.round((recommendedCal - (recProtein * 4) - (recFat * 9)) / 4));

    state.goals.calories = recommendedCal;
    state.goals.protein = recProtein;
    state.goals.carbs = recCarbs;
    state.goals.fat = recFat;
    saveState();
    renderAll();

    const resBox = document.getElementById('calc-result-box');
    resBox.classList.remove('hidden');
    resBox.innerHTML = `
      <strong>תוצאות החישוב האישי שלך:</strong><br>
      • חילוף חומרים במנוחה (BMR): <b>${Math.round(bmr)} קק"ל</b><br>
      • הוצאה אנרגטית יומית (TDEE): <b>${tdee} קק"ל</b><br>
      • יעד מומלץ שהוחל: <b>${recommendedCal} קק"ל</b> (חלבון: ${recProtein}ג', פחמימות: ${recCarbs}ג', שומן: ${recFat}ג')
    `;
    showToast('היעדים חושבו והוחלו בהצלחה!');
  });

  // Weight Log
  document.getElementById('save-weight-btn').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('weight-input-val').value);
    if (!val || val < 20 || val > 350) {
      showToast('נא להזין משקל תקין בק"ג');
      return;
    }
    state.weights = state.weights.filter((w) => w.date !== currentDate);
    state.weights.push({ date: currentDate, weight: val });
    saveState();
    document.getElementById('weight-input-val').value = '';
    renderStatsView();
    showToast(`נשמרה שקילה (${val} ק"ג) לתאריך ${currentDate}`);
  });

  // Export / Import / Reset Day
  document.getElementById('export-data-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caloritrack-backup-${currentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('קובץ הגיבוי הורד בהצלחה');
  });

  document.getElementById('import-data-input').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (imported.goals && imported.days) {
          Object.assign(state, imported);
          saveState();
          renderAll();
          showToast('הנתונים יובאו בהצלחה!');
        }
      } catch {
        showToast('שגיאה בקריאת קובץ הגיבוי');
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('clear-day-btn').addEventListener('click', () => {
    state.days[currentDate] = getDefaultDayLog();
    saveState();
    renderAll();
    showToast('נתוני היום הנוכחי אופסו');
  });

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
