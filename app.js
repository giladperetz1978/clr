const STORAGE_KEY = 'caloritrack_state_v2';
const AI_KEY_STORAGE_KEY = 'caloritrack_gemini_key_v1';
const GEMINI_MODEL = 'gemini-3.8-flash';
const ENCRYPTION_ITERATIONS = 310000;
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
let unlockedGeminiApiKey = null;
let isAiAnalysisBusy = false;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Failed saving state:', err);
    return false;
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
            ${ex.durationMinutes ? `<span class="log-item-meta">${ex.startTime && ex.endTime ? `${escapeHtml(ex.startTime)}–${escapeHtml(ex.endTime)} • ` : ''}${ex.durationMinutes} דקות</span>` : ''}
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
  document.getElementById('water-ml-val').textContent = Math.round(day.water * 250);
  renderBodyAvatar();

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

function renderBodyAvatar() {
  const totals = computeDayTotals(currentDate);
  const day = ensureDay(currentDate);
  const foodRatio = totals.eaten / Math.max(state.goals.calories + totals.burned, 1);
  const waterRatio = day.water / Math.max(state.goals.water, 1);
  for (const [id, ratio] of [['body-food-fill', foodRatio], ['body-water-fill', waterRatio]]) {
    const height = Math.max(0, Math.min(ratio, 1)) * 278;
    const fill = document.getElementById(id);
    fill.setAttribute('height', String(height));
    fill.setAttribute('y', String(298 - height));
  }
  document.getElementById('body-food-percent').textContent = `${Math.round(foodRatio * 100)}%`;
  document.getElementById('body-water-percent').textContent = `${Math.round(waterRatio * 100)}%`;
  document.getElementById('body-figure').classList.toggle('is-active', day.exercises.length > 0);
  document.getElementById('body-activity-label').textContent = day.exercises.length
    ? `אימונים ביומן: ${day.exercises.length}`
    : 'מתקדמים בקצב שלך';
  document.getElementById('avatar-desc').textContent =
    `ביום הנבחר: ${totals.eaten} קק"ל נצרכו, ${Math.round(day.water * 250)} מ"ל מים ו-${totals.burned} קק"ל נשרפו.`;
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

function getStoredAiKeyRecord() {
  const raw = localStorage.getItem(AI_KEY_STORAGE_KEY);
  if (!raw) return null;
  const record = JSON.parse(raw);
  if (!record || typeof record.salt !== 'string' || typeof record.iv !== 'string' || typeof record.ciphertext !== 'string') {
    throw new Error('רשומת מפתח ה-AI השמורה אינה תקינה. מחק אותה והגדר מפתח חדש.');
  }
  return record;
}

function setAiKeyStatus(message, isError = false) {
  const status = document.getElementById('ai-key-status');
  status.textContent = message;
  status.classList.toggle('ai-error', isError);
}

function renderAiKeySettings() {
  const setupForm = document.getElementById('ai-key-setup-form');
  const unlockForm = document.getElementById('ai-key-unlock-form');
  const keyActions = document.getElementById('ai-key-actions');
  let storedRecord;

  try {
    storedRecord = getStoredAiKeyRecord();
  } catch (error) {
    setupForm.classList.remove('hidden');
    unlockForm.classList.add('hidden');
    keyActions.classList.add('hidden');
    setAiKeyStatus(error.message, true);
    return;
  }

  if (!window.isSecureContext || !window.crypto?.subtle) {
    setAiKeyStatus('אחסון מפתח מוצפן זמין רק בחיבור מאובטח (HTTPS או localhost).', true);
  } else if (unlockedGeminiApiKey) {
    setAiKeyStatus('מפתח ה-AI פתוח בזיכרון וזמין לשימוש. המפתח עצמו אינו מוצג או נשמר כטקסט גלוי.');
  } else if (storedRecord) {
    setAiKeyStatus('נמצא מפתח מוצפן במכשיר. הזן את סיסמת ההצפנה כדי להשתמש ב-AI.');
  } else {
    setAiKeyStatus('עדיין לא הוגדר מפתח Gemini במכשיר הזה.');
  }

  setupForm.classList.remove('hidden');
  unlockForm.classList.toggle('hidden', !storedRecord || Boolean(unlockedGeminiApiKey));
  keyActions.classList.toggle('hidden', !storedRecord || !unlockedGeminiApiKey);
}

function bytesToBase64(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function deriveEncryptionKey(password, salt) {
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ENCRYPTION_ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptApiKey(apiKey, password) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptionKey = await deriveEncryptionKey(password, salt);
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    new TextEncoder().encode(apiKey)
  );

  return {
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext))
  };
}

async function decryptApiKey(record, password) {
  const salt = base64ToBytes(record.salt);
  const iv = base64ToBytes(record.iv);
  const ciphertext = base64ToBytes(record.ciphertext);
  const encryptionKey = await deriveEncryptionKey(password, salt);
  const plaintext = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    ciphertext
  );
  return new TextDecoder().decode(plaintext);
}

function collectGroundingLinks(response) {
  const links = new Map();
  (response.steps || []).forEach((step) => {
    (step.content || []).forEach((content) => {
      (content.annotations || []).forEach((annotation) => {
        if (annotation.url && /^https:\/\//i.test(annotation.url)) {
          links.set(annotation.url, annotation.title || annotation.url);
        }
      });
    });
  });
  return [...links.entries()].map(([url, title]) => ({ url, title }));
}

function extractInteractionText(response) {
  if (typeof response.output_text === 'string') return response.output_text;

  const textParts = [];
  (response.steps || []).forEach((step) => {
    if (step.type !== 'model_output') return;
    (step.content || []).forEach((content) => {
      if (typeof content.text === 'string') textParts.push(content.text);
    });
  });
  return textParts.join('\n').trim();
}

function buildAiFoodSchema() {
  return {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'שם המאכל בעברית.' },
            date: { type: 'string', description: 'תאריך צריכת המאכל בפורמט YYYY-MM-DD.' },
            portion: { type: 'string', description: 'כמות שנאכלה ותיאור המנה.' },
            calories: { type: 'integer', description: 'סך הקלוריות בכמות שנאכלה.' },
            protein: { type: 'number', description: 'גרם חלבון בכמות שנאכלה.' },
            carbs: { type: 'number', description: 'גרם פחמימות בכמות שנאכלה.' },
            fat: { type: 'number', description: 'גרם שומן בכמות שנאכלה.' },
            meal: { type: 'string', enum: MEAL_KEYS, description: 'ארוחה: breakfast, lunch, dinner או snacks.' },
            category: { type: 'string', enum: FOOD_CATEGORIES, description: 'קטגוריית המאכל המתאימה במאגר.' },
            source: {
              type: 'string',
              enum: ['local_database', 'web_search', 'estimate'],
              description: 'השתמש ב-local_database לפריט מהמאגר; web_search למידע שנמצא בחיפוש; estimate להערכה.'
            }
          },
          required: ['name', 'date', 'portion', 'calories', 'protein', 'carbs', 'fat', 'meal', 'category', 'source']
        }
      },
      activities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'סוג הפעילות בעברית.' },
            date: { type: 'string', description: 'תאריך הפעילות בפורמט YYYY-MM-DD.' },
            kind: { type: 'string', enum: ['basketball_3v3', 'other'], description: 'basketball_3v3 רק למשחק 3 על 3 בכדורסל; אחרת other.' },
            durationMinutes: { type: 'integer', description: 'משך הפעילות בדקות. אין להמציא משך שלא תואר.' },
            startTime: { type: 'string', description: 'שעת התחלה בפורמט HH:MM; בכדורסל 3 על 3 נדרשת שעה שנאמרה במפורש, אחרת מחרוזת ריקה.' },
            endTime: { type: 'string', description: 'שעת סיום בפורמט HH:MM; בכדורסל 3 על 3 נדרשת שעה שנאמרה במפורש, אחרת מחרוזת ריקה.' },
            calories: { type: 'integer', description: 'קלוריות שנשרפו. בכדורסל 3 על 3 יש להחזיר 0; האפליקציה מחשבת לפי שעות הפעילות.' }
          },
          required: ['name', 'date', 'kind', 'durationMinutes', 'startTime', 'endTime', 'calories']
        }
      },
      water: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string', description: 'תאריך השתייה בפורמט YYYY-MM-DD.' },
            amountMl: { type: 'integer', description: 'כמות מים במיליליטרים. כוס רגילה = 250 מ"ל.' }
          },
          required: ['date', 'amountMl']
        }
      },
      note: { type: 'string', description: 'הערה קצרה בעברית על הערכה או על כמויות חסרות.' }
    },
    required: ['items', 'activities', 'water', 'note']
  };
  }

  function validateAiLogDate(value, fallbackDate) {
    if (value === undefined) return fallbackDate;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error('ה-AI החזיר תאריך לא תקין. נסה לציין יום או תאריך ברור יותר.');
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      throw new Error('ה-AI החזיר תאריך שאינו קיים. בדוק את התאריך ונסה שוב.');
    }
    return value;
  }

  function validateAiLog(result, fallbackDate) {
    if (
      !result ||
      !Array.isArray(result.items) ||
      !Array.isArray(result.activities) ||
      (result.water !== undefined && !Array.isArray(result.water)) ||
      result.items.length > 30 ||
      result.activities.length > 10 ||
      (result.water?.length || 0) > 30 ||
      (result.items.length === 0 && result.activities.length === 0 && !(result.water?.length) &&
        (typeof result.note !== 'string' || !result.note.trim()))
    ) {
      throw new Error('לא הצלחתי להבין מה לרשום. תאר אוכל או פעילות, ונסה לציין כמויות, משך או תאריך.');
    }

    const foods = result.items.map((item) => {
      const numbers = [item.calories, item.protein, item.carbs, item.fat].map(Number);
    if (
      typeof item.name !== 'string' || !item.name.trim() ||
      typeof item.portion !== 'string' || !item.portion.trim() ||
      !MEAL_KEYS.includes(item.meal) ||
      !FOOD_CATEGORIES.includes(item.category) ||
      !['local_database', 'web_search', 'estimate'].includes(item.source) ||
      numbers.some((value) => !Number.isFinite(value) || value < 0) ||
      numbers[0] > 10000 || numbers.slice(1).some((value) => value > 1000)
    ) {
      throw new Error('התקבלה תשובת מזון לא תקינה. נסה שוב או הוסף את המאכל ידנית.');
    }

    return {
      name: item.name.trim(),
      date: validateAiLogDate(item.date, fallbackDate),
      portion: item.portion.trim(),
      cal: Math.round(numbers[0]),
      p: Math.round(numbers[1] * 10) / 10,
      c: Math.round(numbers[2] * 10) / 10,
      f: Math.round(numbers[3] * 10) / 10,
      meal: item.meal,
      category: item.category,
      source: item.source
    };
  });

  const activities = result.activities.map((activity) => {
    const durationMinutes = Number(activity.durationMinutes);
    const calories = Number(activity.calories);
    if (
      typeof activity.name !== 'string' || !activity.name.trim() ||
      !['basketball_3v3', 'other'].includes(activity.kind) ||
      !Number.isInteger(durationMinutes) || durationMinutes < 0 || durationMinutes > 1440 ||
      !Number.isFinite(calories) || calories < 0 || calories > 10000 ||
      typeof activity.startTime !== 'string' || typeof activity.endTime !== 'string'
    ) {
      throw new Error('התקבלה תשובת פעילות לא תקינה. נסה שוב או תאר את הפעילות ידנית.');
    }
    return {
      name: activity.name.trim(),
      date: validateAiLogDate(activity.date, fallbackDate),
      kind: activity.kind,
      durationMinutes,
      startTime: activity.startTime.trim(),
      endTime: activity.endTime.trim(),
      calories: Math.round(calories)
    };
  });

  const water = (result.water || []).map((entry) => {
    if (!entry || !Number.isInteger(entry.amountMl) || entry.amountMl < 1 || entry.amountMl > 10000) {
      throw new Error('התקבלה כמות מים לא תקינה. ציין מספר כוסות או כמות במ"ל.');
    }
    return { date: validateAiLogDate(entry.date, fallbackDate), amountMl: entry.amountMl };
  });
  return { foods, activities, water };
}

function getAiMealLabel(mealKey) {
  return MEAL_DEFINITIONS.find((meal) => meal.key === mealKey)?.title || 'ארוחה';
}

function getActivityWeightKg() {
  const latestWeight = state.weights
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (latestWeight && Number.isFinite(Number(latestWeight.weight)) && Number(latestWeight.weight) > 0) {
    return Number(latestWeight.weight);
  }

  const calculatorWeight = Number(document.getElementById('calc-weight').value);
  return Number.isFinite(calculatorWeight) && calculatorWeight >= 30 && calculatorWeight <= 250
    ? calculatorWeight
    : 75;
}

function parseClockTime(value) {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return (Number(match[1]) * 60) + Number(match[2]);
}

function prepareAiActivities(activities) {
  const prepared = [];
  const skipped = [];
  const weightKg = getActivityWeightKg();

  activities.forEach((activity) => {
    let durationMinutes = activity.durationMinutes;
    let calories = activity.calories;
    let startTime = '';
    let endTime = '';
    let name = activity.name;

    if (activity.kind === 'basketball_3v3') {
      const start = parseClockTime(activity.startTime);
      const end = parseClockTime(activity.endTime);
      if (start === null || end === null) {
        skipped.push('כדורסל 3 על 3 לא נוסף: כדי לחשב קלוריות, ציין שעת התחלה וסיום (למשל 15:00–17:00).');
        return;
      }

      durationMinutes = end > start ? end - start : (24 * 60) - start + end;
      if (durationMinutes < 1 || durationMinutes > 360) {
        skipped.push('כדורסל 3 על 3 לא נוסף: משך המשחק שחושב אינו סביר, בדוק את שעות ההתחלה והסיום.');
        return;
      }
      startTime = activity.startTime;
      endTime = activity.endTime;
      name = 'כדורסל 3 על 3';
      calories = Math.round(8 * weightKg * (durationMinutes / 60));
    } else if (durationMinutes < 1 || calories < 1) {
      skipped.push(`${activity.name} לא נוסף: תאר את משך הפעילות כדי שה-AI יוכל להעריך קלוריות.`);
      return;
    }

    prepared.push({
      id: `ex_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      date: activity.date,
      cal: calories,
      durationMinutes,
      startTime,
      endTime,
      kind: activity.kind
    });
  });

  return { prepared, skipped };
}

function cacheAiFoods(items) {
  const cachedNames = new Set(getAllFoods().map((food) => food.name.trim().toLocaleLowerCase('he')));
  const newFoods = [];

  items.forEach((item) => {
    if (item.source === 'local_database') return;
    const normalizedName = item.name.trim().toLocaleLowerCase('he');
    if (cachedNames.has(normalizedName)) return;
    cachedNames.add(normalizedName);
    newFoods.push({
      id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: item.name,
      unit: item.portion,
      cal: item.cal,
      p: item.p,
      c: item.c,
      f: item.f,
      cat: item.category,
      emoji: '✨',
      quick: false,
      isCustom: true,
      aiSource: item.source
    });
  });

  if (newFoods.length) {
    state.customFoods.unshift(...newFoods);
  }
  return newFoods.length;
}

function renderAiResult(items, activities, note, citations, cachedCount, skipped, water) {
  const result = document.getElementById('ai-result');
  result.replaceChildren();

  if (items.length > 0) {
    const foodTitle = document.createElement('strong');
    foodTitle.textContent = 'מאכלים שנוספו ליומן:';
    result.appendChild(foodTitle);
    const foodList = document.createElement('ul');
    items.forEach((item) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${item.name} (${item.portion}) — ${item.cal} קק"ל, ${getAiMealLabel(item.meal)}, ${formatAiDate(item.date)}`;
      foodList.appendChild(listItem);
    });
    result.appendChild(foodList);
  }

  if (activities.length > 0) {
    const activityTitle = document.createElement('strong');
    activityTitle.textContent = 'פעילויות שנוספו ליומן:';
    result.appendChild(activityTitle);
    const activityList = document.createElement('ul');
    activities.forEach((activity) => {
      const listItem = document.createElement('li');
      const timeLabel = activity.startTime && activity.endTime
        ? ` (${activity.startTime}–${activity.endTime})`
        : '';
      listItem.textContent = `${activity.name}${timeLabel} — ${activity.durationMinutes} דקות, ${activity.cal} קק"ל שנשרפו, ${formatAiDate(activity.date)}`;
      activityList.appendChild(listItem);
    });
    result.appendChild(activityList);
  }

  if (water.length) {
    const waterTitle = document.createElement('strong');
    waterTitle.textContent = 'מים שנוספו ליומן:';
    result.appendChild(waterTitle);
    const waterList = document.createElement('ul');
    water.forEach((entry) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${entry.amountMl} מ"ל מים — ${formatAiDate(entry.date)}`;
      waterList.appendChild(listItem);
    });
    result.appendChild(waterList);
  }

  if (note) {
    const noteElement = document.createElement('p');
    noteElement.textContent = note;
    result.appendChild(noteElement);
  }

  skipped.forEach((message) => {
    const skippedMessage = document.createElement('p');
    skippedMessage.textContent = message;
    result.appendChild(skippedMessage);
  });

  if (cachedCount > 0) {
    const cacheMessage = document.createElement('p');
    cacheMessage.textContent = `${cachedCount} מאכלים חדשים נשמרו במאגר המקומי לשימוש עתידי.`;
    result.appendChild(cacheMessage);
  }

  if (citations.length > 0) {
    const sourceTitle = document.createElement('p');
    sourceTitle.textContent = 'מקורות לחיפוש ברשת:';
    result.appendChild(sourceTitle);
    const sourceList = document.createElement('ul');
    citations.slice(0, 5).forEach((citation) => {
      const sourceItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = citation.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = citation.title;
      sourceItem.appendChild(link);
      sourceList.appendChild(sourceItem);
    });
    result.appendChild(sourceList);
  }

  result.classList.remove('hidden');
}

function formatAiDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

async function analyzeMealWithGemini(description, selectedDate = currentDate) {
  const localFoods = getAllFoods().slice(0, 250).map((food) => ({
    name: food.name,
    portion: food.unit,
    calories: food.cal,
    protein: food.p,
    carbs: food.c,
    fat: food.f,
    category: food.cat
  }));
  const today = getTodayDateString();
  const prompt = [
    'אתה עוזר יומן אישי שמבין הודעות טבעיות בעברית. קרא את כל ההודעה בהקשר; חלץ כל מאכל שנאכל וכל פעילות גופנית שבוצעה, גם אם הם מתוארים בשיחה מעורבת או בסלנג. אל תמציא אירועים או כמויות.',
    `לכל מאכל, שתיית מים ופעילות קבע שדה date בפורמט YYYY-MM-DD. היום המקומי הוא ${today}; התאריך שנבחר כרגע ביומן הוא ${selectedDate}. אם ההודעה אומרת "אתמול", "שלשום", "מחר", יום בשבוע או תאריך מפורש, חשב את התאריך המדויק לכל אירוע ביחס להיום המקומי, גם כשמופיעים כמה תאריכים בהודעה. אם לא צוין תאריך כלל, השתמש בתאריך שנבחר ביומן (${selectedDate}).`,
    'חלץ שתיית מים למערך water, עם date ו-amountMl. ליטר = 1000 מ"ל; כוס מים ללא גודל מפורש = 250 מ"ל וציין את ההנחה ב-note. בלי כמות, בקש הבהרה ואל תרשום מים. משקאות עם קלוריות שייכים למזון בלבד. אם לא תוארו מים, החזר מערך water ריק.',
    'החזר ערכים תזונתיים לכל הכמות שנאכלה, לא ל-100 גרם אלא אם המשתמש אמר 100 גרם. אם הכמות אינה ברורה, הערך מנה סבירה וציין זאת ב-note.',
    'השתמש במאגר המקומי המצורף לפני כל חיפוש. פריט תואם למאגר יקבל source=local_database, והערכים במאגר גוברים על הערכה.',
    'השתמש ב-Google Search רק לפריט שלא נמצא במאגר, במיוחד מוצר ממותג, מסעדה או פריט ספציפי; אל תחפש פריטים רגילים שאפשר להעריך באופן סביר. כשנעשה חיפוש, קבע source=web_search; אחרת לפריט חדש קבע source=estimate.',
    'שייך כל פריט לארוחה לפי מילות המשתמש (בוקר/breakfast, צהריים/lunch, ערב/dinner, נשנוש/snacks). אם לא צוין זמן או ארוחה, שייך לפי השעה המקומית כעת.',
    'בחר לכל פריט category אחת מהקטגוריות המותרות בסכמה. פלט בעברית. אל תכלול פעילות גופנית או שתייה ללא קלוריות כפריטי מזון.',
    'חלץ פעילויות גופניות למערך activities. משחק כדורסל 3 על 3 תמיד יקבל kind=basketball_3v3, calories=0, ושעות התחלה וסיום רק אם נאמרו במפורש. המר שעות כמו "משעה 15 עד 17" לפורמט 15:00 ו-17:00; אל תחשב קלוריות לכדורסל, האפליקציה תחשב אותן מהשעות. אם לא נאמרו שעות, השאר את startTime ו-endTime ריקים וציין ב-note שנדרשות שעות.',
    'כל פעילות אחרת תקבל kind=other. חשב את משכה רק אם המשתמש ציין משך או מרחק שניתן להמיר למשך באופן סביר; אם יש משך, הערך קלוריות שנשרפו. אם אין משך ואין דרך סבירה להסיק אותו, השאר durationMinutes=0 ו-calories=0 וציין ב-note שחסר משך. אם אין מאכלים, החזר items כמערך ריק; אם אין פעילויות, החזר activities כמערך ריק.',
    'אם המשתמש שואל שאלה כללית או שההודעה אינה מתארת אכילה/פעילות לרישום, אל תוסיף רשומות; החזר מערכים ריקים וענה בקצרה ב-note. אם חסר פרט הכרחי לרישום, בקש אותו ב-note במקום לנחש.',
    `השעה המקומית כעת: ${new Date().toLocaleString('he-IL')}.`,
    `מאגר מזונות מקומי (מקור לשימוש חוזר, אל תחפש פריטים אלה): ${JSON.stringify(localFoods)}`,
    `תיאור המשתמש: ${description}`
  ].join('\n\n');

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': unlockedGeminiApiKey
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      input: prompt,
      tools: [{ type: 'google_search' }],
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: buildAiFoodSchema()
      }
    })
  });

  const responseText = await response.text();
  let responseBody;
  try {
    responseBody = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error('Gemini החזיר תשובה לא תקינה. בדוק שהמודל והמפתח מוגדרים כראוי.');
  }
  if (!response.ok) {
    const apiMessage = responseBody.error?.message;
    if (response.status === 401 || response.status === 403) {
      throw new Error('Gemini דחה את מפתח ה-API. בדוק את המפתח ואת ההרשאות שלו בהגדרות.');
    }
    throw new Error(apiMessage || `בקשת Gemini נכשלה (HTTP ${response.status}).`);
  }

  const text = extractInteractionText(responseBody);
  if (!text) throw new Error('Gemini לא החזיר תוצאות לניתוח הארוחה.');
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('לא ניתן לפענח את תוצאות ניתוח הארוחה. נסה שוב.');
  }

  return {
    ...validateAiLog(parsed, selectedDate),
    note: typeof parsed.note === 'string' ? parsed.note.trim() : '',
    citations: collectGroundingLinks(responseBody)
  };
}

function setAiAnalysisBusy(isBusy, message = '') {
  isAiAnalysisBusy = isBusy;
  const button = document.getElementById('ai-food-submit-btn');
  button.disabled = isBusy;
  button.textContent = isBusy ? '⏳ מעדכן את היומן...' : '✨ הבן והוסף ליומן';
  const progress = document.getElementById('ai-progress');
  progress.textContent = message;
  progress.classList.toggle('hidden', !message);
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
  renderAiKeySettings();
}

/* ================= EVENT LISTENERS ================= */
document.addEventListener('DOMContentLoaded', () => {
  renderAll();

  // Gemini key encryption and unlock
  document.getElementById('ai-key-setup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!window.isSecureContext || !window.crypto?.subtle) {
      setAiKeyStatus('הצפנת מפתח דורשת HTTPS או localhost ודפדפן התומך ב-Web Crypto.', true);
      return;
    }

    const apiKey = document.getElementById('gemini-api-key-input').value.trim();
    const password = document.getElementById('ai-encryption-password').value;
    const confirmation = document.getElementById('ai-encryption-password-confirm').value;
    if (!apiKey || password.length < 12) {
      setAiKeyStatus('יש להזין מפתח API וסיסמת הצפנה באורך 12 תווים לפחות.', true);
      return;
    }
    if (password !== confirmation) {
      setAiKeyStatus('סיסמאות ההצפנה אינן תואמות.', true);
      return;
    }

    const submitButton = document.getElementById('save-ai-key-btn');
    submitButton.disabled = true;
    try {
      const record = await encryptApiKey(apiKey, password);
      localStorage.setItem(AI_KEY_STORAGE_KEY, JSON.stringify(record));
      unlockedGeminiApiKey = apiKey;
      e.target.reset();
      renderAiKeySettings();
      showToast('מפתח Gemini הוצפן ונשמר במכשיר');
    } catch (error) {
      console.error('Failed to encrypt or save Gemini API key:', error);
      setAiKeyStatus('לא ניתן להצפין או לשמור את המפתח בדפדפן. בדוק את הגדרות האחסון ונסה שוב.', true);
    } finally {
      submitButton.disabled = false;
    }
  });

  document.getElementById('ai-key-unlock-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('ai-unlock-password').value;
    try {
      const record = getStoredAiKeyRecord();
      if (!record) throw new Error('לא נמצא מפתח Gemini מוצפן במכשיר.');
      const apiKey = await decryptApiKey(record, password);
      if (!apiKey) throw new Error('מפתח Gemini המפוענח ריק.');
      unlockedGeminiApiKey = apiKey;
      e.target.reset();
      renderAiKeySettings();
      showToast('מפתח Gemini נפתח בזיכרון וזמין לשימוש');
    } catch (error) {
      console.error('Failed to unlock Gemini API key:', error);
      setAiKeyStatus(
        error.message === 'לא נמצא מפתח Gemini מוצפן במכשיר.'
          ? error.message
          : 'לא ניתן לפתוח את המפתח. ייתכן שסיסמת ההצפנה שגויה או שהנתונים נפגמו.',
        true
      );
    }
  });

  document.getElementById('lock-ai-key-btn').addEventListener('click', () => {
    unlockedGeminiApiKey = null;
    renderAiKeySettings();
    showToast('מפתח Gemini ננעל והוסר מהזיכרון');
  });

  document.getElementById('remove-ai-key-btn').addEventListener('click', () => {
    if (!window.confirm('למחוק את מפתח Gemini המוצפן מהמכשיר?')) return;
    try {
      localStorage.removeItem(AI_KEY_STORAGE_KEY);
      unlockedGeminiApiKey = null;
      renderAiKeySettings();
      showToast('מפתח Gemini המוצפן נמחק מהמכשיר');
    } catch (error) {
      console.error('Failed to remove encrypted Gemini API key:', error);
      setAiKeyStatus('לא ניתן למחוק את המפתח מהאחסון המקומי.', true);
    }
  });

  document.getElementById('ai-food-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isAiAnalysisBusy) return;
    const selectedDate = e.currentTarget.dataset.voiceDate || currentDate;
    delete e.currentTarget.dataset.voiceDate;
    const description = document.getElementById('ai-food-description').value.trim();
    const resultElement = document.getElementById('ai-result');
    if (!description) return;
    if (!unlockedGeminiApiKey) {
      resultElement.textContent = 'כדי להשתמש ברישום AI, הגדר או פתח את מפתח Gemini בהגדרות AI ואבטחה.';
      resultElement.classList.remove('hidden');
      return;
    }

    resultElement.classList.add('hidden');
    setAiAnalysisBusy(true, 'מנתח מאכלים ופעילויות, ומשתמש במאגר המקומי; חיפוש Google יופעל רק כשיידרש.');
    try {
      const analysis = await analyzeMealWithGemini(description, selectedDate);
      const activityResult = prepareAiActivities(analysis.activities);
      const previousDays = JSON.parse(JSON.stringify(state.days));
      const previousFoods = state.customFoods.slice();
      analysis.foods.forEach((item) => {
        ensureDay(item.date).meals[item.meal].push({
          id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: item.name,
          portion: item.portion,
          cal: item.cal,
          p: item.p,
          c: item.c,
          f: item.f
        });
      });
      activityResult.prepared.forEach((activity) => {
        ensureDay(activity.date).exercises.push(activity);
      });
      analysis.water.forEach((entry) => {
        const day = ensureDay(entry.date);
        day.water = Math.round((day.water + entry.amountMl / 250) * 1000) / 1000;
      });
      const cachedCount = cacheAiFoods(analysis.foods);
      const loggedCount = analysis.foods.length + activityResult.prepared.length + analysis.water.length;
      if ((loggedCount > 0 || cachedCount > 0) && !saveState()) {
        state.days = previousDays;
        state.customFoods = previousFoods;
        throw new Error('לא ניתן לשמור את הרישום במכשיר. בדוק את שטח האחסון של הדפדפן ונסה שוב.');
      }
      if (loggedCount > 0) {
        document.getElementById('ai-food-description').value = '';
      }
      const loggedDates = [...new Set([
        ...analysis.foods.map((item) => item.date),
        ...activityResult.prepared.map((activity) => activity.date),
        ...analysis.water.map((entry) => entry.date)
      ])];
      if (loggedDates.length === 1) {
        currentDate = loggedDates[0];
      }
      renderAll();
      renderAiResult(
        analysis.foods,
        activityResult.prepared,
        analysis.note,
        analysis.citations,
        cachedCount,
        activityResult.skipped,
        analysis.water
      );
      if (loggedCount > 0) {
        showToast(`נוספו ליומן ${loggedCount} פריטים`);
      }
    } catch (error) {
      console.error('AI food logging failed:', error);
      resultElement.textContent = error.message || 'ניתוח הארוחה נכשל. בדוק את החיבור ואת הגדרות Gemini ונסה שוב.';
      resultElement.classList.remove('hidden');
    } finally {
      setAiAnalysisBusy(false);
    }
  });

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
      day.water = Math.max(0, day.water - 1);
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
