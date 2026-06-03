/**
 * CaloriComedy (קלורי-קומדי) - Application Logic
 * Built with vanilla JavaScript, modern Web APIs, and Chart.js
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- STATE ---
  const state = {
    activeTab: 'scanner-tab',
    aiPersona: 'passive-aggressive', // passive-aggressive, grandma, existential, coach
    dailyTarget: 2000,
    colorTheme: 'acid-cyber',
    meals: [],
    currentScanResult: null,
    isCameraActive: false,
    cameraStream: null
  };

  // --- CONFIG & DATASETS ---
  const PRESET_QUOTES = [
    `"חסה זה לא אוכל, חסה זה מצע לפחמימות."`,
    `"קלוריות הן יצורים קטנים שגרים בארון ומצרים לך את הבגדים בלילה."`,
    `"סלט בלי שמן זית זה כמו כנרת בלי מים, אבל סלט עם שמן זית זה לפעמים ג'חנון מחופש."`,
    `"ביום שבו המציאו את הקלוריות הריקות, שכחו להמציא את השובע המלא."`,
    `"הפחמימות שלך שלחו לי הודעה: 'אנחנו מגיעות, תכין את המכנסיים עם הגומי'."`,
    `"אם אף אחד לא ראה אותך אוכל את השוקולד, הוא מכיל 0 קלוריות. מדע מוכח."`,
    `"המים ששתית היום גאים בך מאוד. הקרואסון קצת פחות."`
  ];

  const PRESET_DISHES = {
    salad: {
      name: "סלט ירקות של אנשים עצובים",
      category: "ירקות ובריאות (כאילו)",
      weight: 380,
      calories: 240,
      protein: 8,
      carbs: 22,
      fat: 14,
      comments: {
        'passive-aggressive': "סלט? יפה מאוד. נראה שאתה מנסה להרשים את רופא השיניים שלך. חבל שהרוטב שהוספת מכיל שומנים שמספיקים להניע משאית.",
        'grandma': "אוי ואבוי, מה זה העשבים האלה? אתה ארנב? הוספתי לך פולקע עסיסי וירטואלי של 350 קלוריות, תאכל משהו חם יא שילד!",
        'existential': "עגבנייה שנרקבה בשדה ואז נחתכה לחתיכות קטנות. כל זה כדי להעניק לך עוד חצי שעה של תודעה על כוכב לכת גווע. 240 קלוריות של ריקנות קיומית.",
        'coach': "רק 240 קלוריות?! איפה החלבון אחי?! אתה מפרק שריר ברגע זה! תדחוף 4 ביצים קשות ועוף מיד!"
      }
    },
    burger: {
      name: "קציצת שחיתות עם לחמנייה וצ'יפס",
      category: "פחמימה מושחתת",
      weight: 420,
      calories: 890,
      protein: 38,
      carbs: 95,
      fat: 40,
      comments: {
        'passive-aggressive': "המבורגר וצ'יפס... נו טוב, העיקר שאתה נהנה. אני כבר אשב לי פה לבד בחושך ואשמע את העורקים שלך מתחננים לרחמים.",
        'grandma': "כל הכבוד! ילד בריא צריך לאכול בשר! אבל מה זה הלחם הקנוי הזה? סבתא הייתה מכינה לך המבורגר ביתי אמיתי עם שלוש קערות מרק בצד.",
        'existential': "בשר מן החי, פחמימה מעובדת ושומנים מזוקקים. כולנו נסיים כמזון לתולעים בסוף. תאכל ותשמין, הכל במילא אבק כוכבים זמני.",
        'coach': "890 קלוריות?! 40 גרם שומן רווי?! מחר ב-5 בבוקר אתה מתייצב ל-15 קילומטר ריצה בעלייה עם שקי חול! אין תירוצים!"
      }
    },
    shakshuka: {
      name: "שקשוקת שישי חריפה עם חצי חלה",
      category: "בישול ביתי",
      weight: 450,
      calories: 630,
      protein: 24,
      carbs: 68,
      fat: 30,
      comments: {
        'passive-aggressive': "חצי חלה? למה לא חלה שלמה וזהו? השכנים בטח מדברים על כמה שאתה אוכל יפה, שיהיו בריאים.",
        'grandma': "שקשוקה פיקנטית! חריף זה מצוין למחזור הדם! קח עוד פיסת חלה ותנגב את כל הרוטב, חבל שייזרק לזבל.",
        'existential': "ביצים מבושלות ברסק עגבניות מבעבע. המנה הזו חמה, בניגוד לקור המוחלט של החלל הבין-גלקטי. נצל את החום הזמני לפני שהכל יקפא.",
        'coach': "השקשוקה בסדר גמור בגלל הביצים, אבל החלה הזאת היא פצצת פחמימות מתוזמנת ישירות לבטן התחתונה! 120 סקוואטים מיד!"
      }
    },
    coffee_croissant: {
      name: "קפה הפוך גדול ומאפה שוקולד צרפתי",
      category: "פחמימות ומנחמים",
      weight: 230,
      calories: 520,
      protein: 8,
      carbs: 62,
      fat: 26,
      comments: {
        'passive-aggressive': "קפה ומאפה. מאוד פריזאי. חבל שבצרפת לא משלמים על המלתחה החדשה שתצטרך לקנות בשבוע הבא.",
        'grandma': "זה ארוחת בוקר זה? זה סוכר ומים! איפה הגבינות? איפה הביצה קשה? ככה לא בונים עצמות לדור הבא!",
        'existential': "קפאין כדי להעיר תודעה שלא ביקשה להיווצר, וסוכר שיספק נחמה רגעית מהריקנות האקזנסטנציאליסטית. תהנה מהאשליה.",
        'coach': "סוכר פשוט מוקף בשומן טראנס ישר לתוך מחזור הדם שלך! האינסולין שלך צורח! רד ל-50 שילוט מרפקים עכשיו!"
      }
    }
  };

  const RANDOM_FOOD_PRESETS = [
    { name: "פלאפל כפול בלאפה עם צ'יפס מוגזם", calories: 950, weight: 500, protein: 22, carbs: 120, fat: 42, category: "פצצת שמן זרחנית" },
    { name: "מרק עדשים ביתי שמריח כמו חורף", calories: 310, weight: 400, protein: 18, carbs: 45, fat: 6, category: "בישול ביתי מחמם" },
    { name: "צלחת פסטה שמנת פטריות של מסעדות", calories: 780, weight: 350, protein: 15, carbs: 90, fat: 38, category: "פחמימות מנחמות" },
    { name: "שניצל מטוגן שנשאר מאתמול בערב", calories: 420, weight: 180, protein: 28, carbs: 32, fat: 20, category: "חטאים ביתיים" },
    { name: "שייק ירוק בריאותי בטעם של דשא קצוץ", calories: 180, weight: 300, protein: 4, carbs: 35, fat: 2, category: "נוזלים ירוקים" },
    { name: "פרוסת עוגת גבינה פירורים שאי אפשר לסרב לה", calories: 480, weight: 150, protein: 10, carbs: 42, fat: 30, category: "מתוקים וחרטות" },
    { name: "סושי קומבינציה זוגית (שאכלת לבד)", calories: 650, weight: 320, protein: 20, carbs: 110, fat: 12, category: "פחמימה אסייתית" },
    { name: "קערת קורנפלקס עם חלב ואשליות", calories: 340, weight: 250, protein: 9, carbs: 55, fat: 8, category: "ארוחת בוקר מהירה" }
  ];

  const RANDOM_PHASES = [
    "מנסה להתחבר ללוויין הקלוריות הבינלאומי... 🛰️",
    "מודד את זווית השתקפות השמן על הלחם... 📐",
    "מחשב את עובי הטיגון ומעריך את גיל השמן... 🧪",
    "מנתח את רמות העצב הטמונות במלפפון... 🥗",
    "מחפש רסיסי מיונז חבויים מתחת לעלים... 🕵️‍♂️",
    "מתייעץ עם אורקל הקלוריות השופט... 🔮",
    "מחשב אחוזי רגשות אשם במשתמש על פי דופק משוער... 😈",
    "מנסח עלבון איכותי המבוסס על בחירת המנה... 📝"
  ];

  // --- ELEMENT REFERENCING ---
  const el = {
    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    
    // Header
    dailyQuote: document.getElementById('daily-quote'),
    
    // Scanner UI
    webcam: document.getElementById('webcam'),
    photoCanvas: document.getElementById('photo-canvas'),
    viewportPlaceholder: document.getElementById('viewport-placeholder'),
    btnToggleCamera: document.getElementById('btn-toggle-camera'),
    btnCapture: document.getElementById('btn-capture'),
    fileInput: document.getElementById('file-input'),
    uploadLabel: document.getElementById('upload-label'),
    demoButtons: document.querySelectorAll('.btn-demo-item'),
    scannerLine: document.getElementById('scanner-line'),
    viewportWrapper: document.querySelector('.camera-viewport-wrapper'),
    
    // Results UI
    resultsPanel: document.getElementById('results-panel'),
    stateIdle: document.getElementById('result-state-idle'),
    stateScanning: document.getElementById('result-state-scanning'),
    stateSuccess: document.getElementById('result-state-success'),
    scanPhaseText: document.getElementById('scan-phase-text'),
    scanProgressBar: document.getElementById('scan-progress-bar'),
    
    // Success Results Fields
    resCategoryBadge: document.getElementById('success-category-badge'),
    detectedFoodTitle: document.getElementById('detected-food-title'),
    resCalories: document.getElementById('res-calories'),
    resWeight: document.getElementById('res-weight'),
    resProtein: document.getElementById('res-protein'),
    resCarbs: document.getElementById('res-carbs'),
    resFat: document.getElementById('res-fat'),
    resComment: document.getElementById('res-comment'),
    aiAvatarDisplay: document.getElementById('ai-avatar-display'),
    aiNameDisplay: document.getElementById('ai-name-display'),
    
    // Adjustments Form
    btnToggleAdjust: document.getElementById('btn-toggle-adjust'),
    adjustmentFields: document.getElementById('adjustment-fields'),
    editFoodName: document.getElementById('edit-food-name'),
    editCalories: document.getElementById('edit-calories'),
    editWeight: document.getElementById('edit-weight'),
    editProtein: document.getElementById('edit-protein'),
    editCarbs: document.getElementById('edit-carbs'),
    editFat: document.getElementById('edit-fat'),
    btnSaveLog: document.getElementById('btn-save-log'),
    btnReestimate: document.getElementById('btn-reestimate'),
    
    // Stats UI
    todayTotalCalories: document.getElementById('today-total-calories'),
    todayTargetComparison: document.getElementById('today-target-comparison'),
    weeklyAvgCalories: document.getElementById('weekly-avg-calories'),
    statusVerdict: document.getElementById('status-verdict'),
    statusSubtext: document.getElementById('status-subtext'),
    chartRangeBtns: document.querySelectorAll('.btn-chart-range'),
    mealsLogBody: document.getElementById('meals-log-body'),
    btnExportData: document.getElementById('btn-export-data'),
    
    // Settings UI
    personaRadios: document.querySelectorAll('input[name="ai-persona"]'),
    inputDailyTarget: document.getElementById('input-daily-target'),
    themeBtns: document.querySelectorAll('.btn-color-theme'),
    btnClearDatabase: document.getElementById('btn-clear-database'),
    
    // Toast Alert
    toast: document.getElementById('toast')
  };

  // --- INITIALIZATION ---
  function init() {
    loadSettings();
    loadMealsDatabase();
    setupEventListeners();
    updateDailyQuote();
    updateDashboardMetrics();
    renderMealsTable();
    initChart();
    
    // Pre-populate data if database is empty to make charts look awesome
    if (state.meals.length === 0) {
      prepopulateHistoryData();
    }
    
    // Register PWA Service Worker
    registerServiceWorker();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => console.log('[Service Worker] Registered successfully with scope:', reg.scope))
          .catch((err) => console.error('[Service Worker] Registration failed:', err));
      });
    }
  }

  // --- SETTINGS MANAGEMENT ---
  function loadSettings() {
    const savedTarget = localStorage.getItem('cc_daily_target');
    if (savedTarget) {
      state.dailyTarget = parseInt(savedTarget, 10);
      el.inputDailyTarget.value = state.dailyTarget;
    }

    const savedPersona = localStorage.getItem('cc_ai_persona');
    if (savedPersona) {
      state.aiPersona = savedPersona;
      el.personaRadios.forEach(radio => {
        if (radio.value === savedPersona) {
          radio.checked = true;
          radio.closest('.persona-option-card').classList.add('active');
        } else {
          radio.closest('.persona-option-card').classList.remove('active');
        }
      });
    }

    const savedTheme = localStorage.getItem('cc_color_theme');
    if (savedTheme) {
      state.colorTheme = savedTheme;
      document.body.setAttribute('data-theme', savedTheme);
      el.themeBtns.forEach(btn => {
        if (btn.getAttribute('data-theme') === savedTheme) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  function saveSetting(key, value) {
    localStorage.setItem(key, value);
    showToast("ההגדרה נשמרה בהצלחה! ⚙️");
  }

  // --- MEALS DATABASE MANAGEMENT (LOCALSTORAGE) ---
  function loadMealsDatabase() {
    const savedMeals = localStorage.getItem('cc_meals');
    if (savedMeals) {
      state.meals = JSON.parse(savedMeals);
    } else {
      state.meals = [];
    }
  }

  function saveMealsDatabase() {
    localStorage.setItem('cc_meals', JSON.stringify(state.meals));
    updateDashboardMetrics();
    renderMealsTable();
    updateChartData(document.querySelector('.btn-chart-range.active').getAttribute('data-range'));
  }

  function prepopulateHistoryData() {
    const mockMeals = [];
    const now = new Date();
    
    // We will generate mock foods for the past 15 days
    const mockFoodPool = [
      { name: "סלט בריאות עם גבינה", calories: 340, weight: 320, protein: 12, carbs: 28, fat: 18, category: "בריאות" },
      { name: "פסטה בולונז של בית", calories: 650, weight: 350, protein: 28, carbs: 80, fat: 22, category: "בישול ביתי" },
      { name: "פיצה מרגריטה (2 משולשים)", calories: 580, weight: 240, protein: 20, carbs: 65, fat: 25, category: "פחמימה מושחתת" },
      { name: "שקשוקה וחצי לחמניה", calories: 520, weight: 380, protein: 18, carbs: 50, fat: 26, category: "בישול ביתי" },
      { name: "פלאפל בתוך פיתה", calories: 680, weight: 350, protein: 16, carbs: 85, fat: 28, category: "אוכל רחוב" },
      { name: "קפה הפוך קטן ומאפין", calories: 430, weight: 180, protein: 6, carbs: 52, fat: 20, category: "פחמימות ומנחמים" },
      { name: "עוף בתנור עם תפוחי אדמה", calories: 580, weight: 400, protein: 35, carbs: 48, fat: 18, category: "בישול ביתי" }
    ];

    for (let i = 15; i >= 0; i--) {
      // For each day, randomize number of meals (1 to 3 meals)
      const dayDate = new Date(now);
      dayDate.setDate(now.getDate() - i);
      
      // Let's make sure we don't put too much on today so they can test scanning
      const maxMeals = (i === 0) ? 1 : Math.floor(Math.random() * 3) + 1; 
      
      for (let m = 0; m < maxMeals; m++) {
        const food = mockFoodPool[Math.floor(Math.random() * mockFoodPool.length)];
        const hoursOffset = 8 + (m * 4) + Math.floor(Math.random() * 2); // 8:00, 12:00, 16:00
        const mealTime = `${String(hoursOffset).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
        
        // Add variations to values
        const varianceFactor = 0.85 + (Math.random() * 0.3); // +/- 15%
        const calories = Math.round(food.calories * varianceFactor);
        const weight = Math.round(food.weight * varianceFactor);
        const protein = Math.round(food.protein * varianceFactor);
        const carbs = Math.round(food.carbs * varianceFactor);
        const fat = Math.round(food.fat * varianceFactor);
        
        const dateStr = dayDate.toISOString().split('T')[0];
        
        mockMeals.push({
          id: 'mock_' + dateStr + '_' + m + '_' + Math.random().toString(36).substr(2, 4),
          date: dateStr,
          time: mealTime,
          name: food.name,
          category: food.category,
          calories: calories,
          weight: weight,
          protein: protein,
          carbs: carbs,
          fat: fat,
          personaUsed: 'passive-aggressive',
          comment: "נתונים מסומלצים לצורך הדגמה מרהיבה."
        });
      }
    }

    state.meals = mockMeals;
    saveMealsDatabase();
    showToast("היסטוריית בדיקה נטענה בהצלחה לגרפים! 📊");
  }

  // --- ROUTING / TABS SYSTEM ---
  function setupEventListeners() {
    
    // Tab Switching
    el.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        // Update active tab buttons
        el.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab panels
        el.tabPanels.forEach(panel => {
          if (panel.id === targetTab) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });

        // Trigger chart resize if entering stats tab
        if (targetTab === 'stats-tab' && window.myChart) {
          setTimeout(() => {
            window.myChart.resize();
            updateChartData(document.querySelector('.btn-chart-range.active').getAttribute('data-range'));
          }, 100);
        }

        // Deactivate camera if leaving scanner tab
        if (targetTab !== 'scanner-tab' && state.isCameraActive) {
          stopCamera();
        }

        state.activeTab = targetTab;
      });
    });

    // Camera control buttons
    el.btnToggleCamera.addEventListener('click', toggleCamera);
    el.btnCapture.addEventListener('click', capturePhoto);

    // File Upload handling
    el.fileInput.addEventListener('change', handleFileUpload);
    
    // Drag & Drop functionality on viewport
    const viewport = el.viewportWrapper;
    viewport.addEventListener('dragover', (e) => {
      e.preventDefault();
      viewport.style.borderColor = 'var(--accent-pink)';
      viewport.style.boxShadow = 'var(--shadow-neon-pink)';
    });
    viewport.addEventListener('dragleave', () => {
      viewport.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      viewport.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.9)';
    });
    viewport.addEventListener('drop', (e) => {
      e.preventDefault();
      viewport.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      viewport.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.9)';
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processUploadedFile(e.dataTransfer.files[0]);
      }
    });

    // Preset Demo Buttons click
    el.demoButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const foodKey = btn.getAttribute('data-food');
        if (PRESET_DISHES[foodKey]) {
          // If camera is running, stop it
          if (state.isCameraActive) stopCamera();
          
          simulateScanning(PRESET_DISHES[foodKey]);
        }
      });
    });

    // Toggle manual adjustments form
    el.btnToggleAdjust.addEventListener('click', () => {
      el.adjustmentFields.classList.toggle('hidden');
    });

    // Save Log item from Result success panel
    el.btnSaveLog.addEventListener('click', saveCurrentScanToLog);
    el.btnReestimate.addEventListener('click', handleManualReestimate);

    // Stats Chart selectors
    el.chartRangeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.chartRangeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateChartData(btn.getAttribute('data-range'));
      });
    });

    // Delete Log Item Event Delegation
    el.mealsLogBody.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.btn-delete-log');
      if (deleteBtn) {
        const mealId = deleteBtn.getAttribute('data-id');
        deleteMeal(mealId);
      }
    });

    // Export Data Button
    el.btnExportData.addEventListener('click', exportDataAsJson);

    // AI Persona Change handler
    el.personaRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.aiPersona = e.target.value;
        
        // Remove active class from all persona labels
        document.querySelectorAll('.persona-option-card').forEach(card => {
          card.classList.remove('active');
        });
        
        // Add active class to selected label
        e.target.closest('.persona-option-card').classList.add('active');
        
        saveSetting('cc_ai_persona', state.aiPersona);
        updateDailyQuote();
        
        // If there's an active success result screen, update the commentary real-time!
        if (state.currentScanResult) {
          updateCommentaryForCurrentResult();
        }
      });
    });

    // Daily Goal Change Handler
    el.inputDailyTarget.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 500 && val <= 10000) {
        state.dailyTarget = val;
        localStorage.setItem('cc_daily_target', val);
        updateDashboardMetrics();
        
        // Humor based on target size
        const helperText = state.dailyTarget < 1000 ? "מה אתה, נמלה בחיטוב? 🐜" 
                         : state.dailyTarget > 3800 ? "יעד גדילה של דוב גריזלי! 🐻" 
                         : "שינוי היעד יעדכן את הגרפים מיידית.";
        document.getElementById('target-helper').innerText = helperText;
      }
    });

    // Color Theme Picker
    el.themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const theme = btn.getAttribute('data-theme');
        state.colorTheme = theme;
        document.body.setAttribute('data-theme', theme);
        saveSetting('cc_color_theme', theme);
        
        // Redraw chart to apply new theme colors
        if (window.myChart) {
          setTimeout(() => {
            updateChartData(document.querySelector('.btn-chart-range.active').getAttribute('data-range'));
          }, 100);
        }
      });
    });

    // Clear Database Button
    el.btnClearDatabase.addEventListener('click', () => {
      if (confirm("האם אתה בטוח שברצונך למחוק את כל ההיסטוריה ורגשות האשמה לצמיתות? פעולה זו אינה ניתנת לביטול!")) {
        state.meals = [];
        saveMealsDatabase();
        showToast("ההיסטוריה אופסה לגמרי. נקי כמו תינוק שנולד! 🧼");
      }
    });

    // Quote bubble click triggers a new quote
    document.querySelector('.quota-bubble').addEventListener('click', updateDailyQuote);
  }

  // --- CAMERA CONTROL LOGIC ---
  async function toggleCamera() {
    if (state.isCameraActive) {
      stopCamera();
    } else {
      try {
        state.cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        
        el.webcam.srcObject = state.cameraStream;
        el.webcam.classList.remove('hidden');
        el.viewportPlaceholder.classList.add('hidden');
        el.photoCanvas.classList.add('hidden');
        
        el.btnToggleCamera.querySelector('span').innerText = 'סגור מצלמה';
        el.btnToggleCamera.classList.remove('btn-secondary');
        el.btnToggleCamera.classList.add('btn-danger');
        el.btnCapture.classList.remove('hidden');
        
        el.viewportWrapper.classList.add('active-scanning');
        state.isCameraActive = true;
      } catch (err) {
        console.error("Camera error: ", err);
        showToast("אופס! לא הצלחנו לקבל גישה למצלמה. נסה להעלות קובץ או השתמש במאכלי הדגמה. 🚫");
      }
    }
  }

  function stopCamera() {
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(track => track.stop());
    }
    el.webcam.srcObject = null;
    el.webcam.classList.add('hidden');
    el.viewportPlaceholder.classList.remove('hidden');
    el.btnToggleCamera.querySelector('span').innerText = 'פתח מצלמה';
    el.btnToggleCamera.classList.remove('btn-danger');
    el.btnToggleCamera.classList.add('btn-secondary');
    el.btnCapture.classList.add('hidden');
    
    el.viewportWrapper.classList.remove('active-scanning');
    state.isCameraActive = false;
  }

  function capturePhoto() {
    if (!state.isCameraActive) return;

    const width = el.webcam.videoWidth;
    const height = el.webcam.videoHeight;
    
    el.photoCanvas.width = width;
    el.photoCanvas.height = height;
    
    const context = el.photoCanvas.getContext('2d');
    // Mirror drawing to match preview
    context.translate(width, 0);
    context.scale(-1, 1);
    context.drawImage(el.webcam, 0, 0, width, height);
    
    // Stop camera feed and freeze canvas view
    stopCamera();
    el.photoCanvas.classList.remove('hidden');
    el.viewportPlaceholder.classList.add('hidden');

    // Run humorous analysis on the snapped picture
    generateRandomScanResult("צילום מצלמה חי");
  }

  // --- UPLOAD FILE LOGIC ---
  function handleFileUpload(e) {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  }

  function processUploadedFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        el.photoCanvas.width = 400;
        el.photoCanvas.height = 300;
        const context = el.photoCanvas.getContext('2d');
        context.drawImage(img, 0, 0, 400, 300);
        
        if (state.isCameraActive) stopCamera();
        
        el.photoCanvas.classList.remove('hidden');
        el.viewportPlaceholder.classList.add('hidden');
        
        // Analyze file and look at filename for mock matching, otherwise do random
        analyzeFilenameAndProcess(file.name);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function analyzeFilenameAndProcess(filename) {
    const lowerName = filename.toLowerCase();
    
    // Look for keywords in file name to show relevant matching dish
    if (lowerName.includes('salad') || lowerName.includes('סלט') || lowerName.includes('ירקות')) {
      simulateScanning(PRESET_DISHES.salad);
    } else if (lowerName.includes('burger') || lowerName.includes('המבורגר') || lowerName.includes('meat') || lowerName.includes('בשר')) {
      simulateScanning(PRESET_DISHES.burger);
    } else if (lowerName.includes('shakshuka') || lowerName.includes('שקשוקה') || lowerName.includes('egg') || lowerName.includes('ביצה')) {
      simulateScanning(PRESET_DISHES.shakshuka);
    } else if (lowerName.includes('coffee') || lowerName.includes('קפה') || lowerName.includes('croissant') || lowerName.includes('מאפה')) {
      simulateScanning(PRESET_DISHES.coffee_croissant);
    } else {
      // Fallback: Generate a funny random result with the file name
      const cleanName = filename.split('.')[0].replace(/[-_]/g, ' ');
      generateRandomScanResult(cleanName);
    }
  }

  // --- SCANNING SIMULATION ENGINE ---
  function simulateScanning(foodData) {
    // Show scanning state
    el.stateIdle.classList.add('hidden');
    el.stateSuccess.classList.add('hidden');
    el.stateScanning.classList.remove('hidden');
    
    // Activate laser line on viewport during scanning simulation
    el.viewportWrapper.classList.add('active-scanning');
    
    let progress = 0;
    let phaseIndex = 0;
    
    el.scanProgressBar.style.width = '0%';
    el.scanPhaseText.innerText = RANDOM_PHASES[0];

    const interval = setInterval(() => {
      progress += 5;
      el.scanProgressBar.style.width = `${progress}%`;
      
      // Update phases dynamically
      if (progress % 25 === 0 && phaseIndex < 3) {
        phaseIndex++;
        el.scanPhaseText.innerText = RANDOM_PHASES[phaseIndex + Math.floor(Math.random() * 2)];
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          displayScanResult(foodData);
          el.viewportWrapper.classList.remove('active-scanning');
        }, 300);
      }
    }, 120);
  }

  function generateRandomScanResult(sourceName) {
    // Select a random template dish
    const template = RANDOM_FOOD_PRESETS[Math.floor(Math.random() * RANDOM_FOOD_PRESETS.length)];
    
    // Build comments on the fly for this random dish
    const comments = {
      'passive-aggressive': `סרקת את זה כ'${sourceName}'. בוא נקרא לזה בשמו האמיתי: ${template.name}. יום אחד אתה תתעורר ותגלה שהקיבה שלך פתחה נגדך תיק בהוצאה לפועל.`,
      'grandma': `אה, '${sourceName}'! זה נשמע כמו תעלומה אופנתית! הנה ${template.name} משודרג. אתה נראה קצת חוור, תיקח עוד מנה שיהיה לך כוח בברכיים!`,
      'existential': `בין אם קראת לזה '${sourceName}' או ${template.name}, התוצאה הסופית היא עיכול חסר תכלית על סלע שמרחף בתוך יקום אדיש וקפוא. 5 מתוך 10 בסולם הייאוש.`,
      'coach': `סרוק: '${sourceName}' -> מפרש כ: ${template.name}! פחמימות ריקות! שומן מיותר! תפסיק לכרסם שטויות ותתחיל לעשות שכיבות סמיכה בזה הרגע! 💪`
    };

    const finalDish = {
      name: template.name,
      category: template.category,
      weight: template.weight + Math.floor(Math.random() * 60) - 30, // add randomness
      calories: template.calories + Math.floor(Math.random() * 80) - 40,
      protein: template.protein + Math.floor(Math.random() * 6) - 3,
      carbs: template.carbs + Math.floor(Math.random() * 12) - 6,
      fat: template.fat + Math.floor(Math.random() * 8) - 4,
      comments: comments
    };

    // Prevent negative numbers from randomness
    if (finalDish.protein < 0) finalDish.protein = 0;
    if (finalDish.carbs < 0) finalDish.carbs = 0;
    if (finalDish.fat < 0) finalDish.fat = 0;

    simulateScanning(finalDish);
  }

  // --- DISPLAY RESULTS SCREEN ---
  function displayScanResult(foodData) {
    state.currentScanResult = foodData;
    
    el.stateScanning.classList.add('hidden');
    el.stateSuccess.classList.remove('hidden');
    
    // Set text values
    el.resCategoryBadge.innerText = foodData.category || "מאכל לא מוגדר";
    el.detectedFoodTitle.innerText = foodData.name;
    
    // Calorie count animation counter
    animateNumber(el.resCalories, 0, foodData.calories, 800);
    animateNumber(el.resWeight, 0, foodData.weight, 800);
    
    el.resProtein.innerText = `${foodData.protein}g`;
    el.resCarbs.innerText = `${foodData.carbs}g`;
    el.resFat.innerText = `${foodData.fat}g`;
    
    // Set edit inputs to allow corrections
    el.editFoodName.value = foodData.name;
    el.editCalories.value = foodData.calories;
    el.editWeight.value = foodData.weight;
    el.editProtein.value = foodData.protein;
    el.editCarbs.value = foodData.carbs;
    el.editFat.value = foodData.fat;
    
    // Update Commentary and Avatar based on Selected Voice
    updateCommentaryForCurrentResult();
    
    // Close adjustment inputs in case they were open
    el.adjustmentFields.classList.add('hidden');
  }

  function updateCommentaryForCurrentResult() {
    if (!state.currentScanResult) return;
    
    const persona = state.aiPersona;
    const foodData = state.currentScanResult;
    
    let comment = "";
    if (foodData.comments && foodData.comments[persona]) {
      comment = foodData.comments[persona];
    } else {
      comment = `ביקורת קלוריות כללית ברוח ${persona} על ${foodData.name}.`;
    }

    el.resComment.innerText = comment;
    
    // Avatar and name updates
    let avatar = "🤖";
    let name = "הבינה המפענחת";
    
    if (persona === 'passive-aggressive') {
      avatar = "😒";
      name = "הבינה השופטת (פולנייה כעוסה)";
    } else if (persona === 'grandma') {
      avatar = "👵";
      name = "סבתא מודאגת (אוכל זה שמחה)";
    } else if (persona === 'existential') {
      avatar = "🌌";
      name = "פילוסוף קיומי (ריקנות מעוצבת)";
    } else if (persona === 'coach') {
      avatar = "💪";
      name = "מאמן כושר אכזר (זיעה ודמעות)";
    }
    
    el.aiAvatarDisplay.innerText = avatar;
    el.aiNameDisplay.innerText = name;
  }

  function animateNumber(targetEl, start, end, duration) {
    let startTime = null;
    
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      targetEl.innerText = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }
    
    window.requestAnimationFrame(step);
  }

  // --- SAVE SCANNED MEAL TO LOCALSTORAGE ---
  function saveCurrentScanToLog() {
    if (!state.currentScanResult) return;

    // Grab values from inputs in case user edited them
    const finalName = el.editFoodName.value || state.currentScanResult.name;
    const finalCalories = parseInt(el.editCalories.value, 10) || 0;
    const finalWeight = parseInt(el.editWeight.value, 10) || 0;
    const finalProtein = parseInt(el.editProtein.value, 10) || 0;
    const finalCarbs = parseInt(el.editCarbs.value, 10) || 0;
    const finalFat = parseInt(el.editFat.value, 10) || 0;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMeal = {
      id: 'meal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      date: dateStr,
      time: timeStr,
      name: finalName,
      category: el.resCategoryBadge.innerText,
      calories: finalCalories,
      weight: finalWeight,
      protein: finalProtein,
      carbs: finalCarbs,
      fat: finalFat,
      personaUsed: state.aiPersona,
      comment: el.resComment.innerText
    };

    state.meals.push(newMeal);
    saveMealsDatabase();
    
    showToast(`המנה '${finalName}' נוספה בהצלחה ליומן האשמה! 📝`);

    // Reset results and UI back to idle view
    state.currentScanResult = null;
    el.stateSuccess.classList.add('hidden');
    el.stateIdle.classList.remove('hidden');
    
    // Clear canvas
    el.photoCanvas.classList.add('hidden');
    el.viewportPlaceholder.classList.remove('hidden');
  }

  function handleManualReestimate() {
    const foodName = el.editFoodName.value.trim();
    if (!foodName) {
      showToast("אנא הקלד שם מאכל כלשהו תחילה! ✍️");
      return;
    }

    const lowerName = foodName.toLowerCase();
    
    // Hebrew search database for common foods and their average stats
    const dictionary = [
      { key: "פוקצ", name: "פוקצ'ה טרייה עם שמן זית", category: "פחמימה אפויה", weight: 240, calories: 650, protein: 12, carbs: 80, fat: 16 },
      { key: "פיצה", name: "משולש פיצה עם גבינה", category: "פחמימה מושחתת", weight: 120, calories: 290, protein: 12, carbs: 32, fat: 12 },
      { key: "סלט", name: "סלט ירקות ישראלי קצוץ", category: "ירקות ובריאות", weight: 350, calories: 180, protein: 4, carbs: 15, fat: 12 },
      { key: "שניצל", name: "שניצל עוף ביתי מטוגן", category: "בישול ביתי", weight: 150, calories: 350, protein: 24, carbs: 20, fat: 18 },
      { key: "פלאפל", name: "מנת פלאפל בפיתה עם סלטים", category: "פחמימה מטוגנת", weight: 350, calories: 680, protein: 16, carbs: 85, fat: 28 },
      { key: "לאפה", name: "לאפה עיראקית גדולה ריקה", category: "פחמימה ריקה", weight: 160, calories: 480, protein: 10, carbs: 90, fat: 2 },
      { key: "בורקס", name: "בורקס תפוח אדמה פריך", category: "שומן ופחמימות", weight: 100, calories: 360, protein: 6, carbs: 38, fat: 22 },
      { key: "אורז", name: "אורז לבן מבושל", category: "פחמימות", weight: 200, calories: 260, protein: 5, carbs: 56, fat: 1 },
      { key: "המבורגר", name: "המבורגר בלחמניה עם רטבים", category: "פחמימה מושחתת", weight: 350, calories: 750, protein: 32, carbs: 65, fat: 32 },
      { key: "חלה", name: "פרוסת חלת שבת מתוקה", category: "פחמימות", weight: 60, calories: 170, protein: 5, carbs: 32, fat: 2 },
      { key: "עוגה", name: "פרוסת עוגה מתוקה", category: "מתוקים וחרטות", weight: 80, calories: 320, protein: 4, carbs: 45, fat: 16 },
      { key: "עוגיי", name: "עוגייה גדולה", category: "מתוקים וחרטות", weight: 40, calories: 180, protein: 2, carbs: 25, fat: 8 },
      { key: "פסטה", name: "צלחת פסטה ברוטב עגבניות", category: "פחמימות", weight: 280, calories: 420, protein: 12, carbs: 75, fat: 10 },
      { key: "עוף", name: "נתח חזה עוף / פרגית בגריל", category: "חלבונים", weight: 180, calories: 280, protein: 35, carbs: 0, fat: 14 },
      { key: "פרג", name: "נתחי פרגית צלויה", category: "חלבונים", weight: 180, calories: 320, protein: 32, carbs: 0, fat: 18 },
      { key: "שווארמה", name: "שווארמה בצלחת עם טחינה", category: "חלבונים ושומן", weight: 250, calories: 540, protein: 35, carbs: 12, fat: 38 },
      { key: "לחם", name: "פרוסת לחם מלא", category: "פחמימות", weight: 40, calories: 95, protein: 3.5, carbs: 18, fat: 1 },
      { key: "תפוח", name: "תפוח עץ טרי קטן", category: "פירות", weight: 150, calories: 80, protein: 0.5, carbs: 20, fat: 0.2 },
      { key: "בננה", name: "בננה בשלה בינונית", category: "פירות", weight: 120, calories: 105, protein: 1.2, carbs: 27, fat: 0.3 },
      { key: "קפה", name: "קפה הפוך קפוצ'ינו גדול", category: "משקאות", weight: 300, calories: 120, protein: 6, carbs: 10, fat: 6 },
      { key: "שוקולד", name: "חפיסת שוקולד חלב (חלקית)", category: "מתוקים וחרטות", weight: 50, calories: 270, protein: 3, carbs: 30, fat: 15 }
    ];

    // Try to find a match
    let match = null;
    for (const entry of dictionary) {
      if (lowerName.includes(entry.key)) {
        match = entry;
        break;
      }
    }

    let finalDish = null;
    if (match) {
      // Create copy of matching entry
      finalDish = {
        name: foodName, // keep user's exact typed name
        category: match.category,
        weight: match.weight,
        calories: match.calories,
        protein: match.protein,
        carbs: match.carbs,
        fat: match.fat
      };
    } else {
      // Fallback pseudo-random calculation based on text features
      const nameLength = foodName.length;
      const computedCalories = 200 + ((nameLength * 17) % 400); // 200 to 600
      const computedWeight = 150 + ((nameLength * 23) % 250); // 150 to 400
      const computedProtein = 5 + ((nameLength * 7) % 25);
      const computedCarbs = 15 + ((nameLength * 11) % 60);
      const computedFat = 5 + ((nameLength * 3) % 20);

      finalDish = {
        name: foodName,
        category: "סריקה ידנית",
        weight: computedWeight,
        calories: computedCalories,
        protein: computedProtein,
        carbs: computedCarbs,
        fat: computedFat
      };
      
      showToast("שם המאכל לא זוהה במאגר. ביצענו הערכה משוערת! 🪄");
    }

    // Build comments on the fly for the new dish depending on selected persona
    const comments = {
      'passive-aggressive': `חשבת מחדש כ'${finalDish.name}'. בסדר. העיקר שאתה שלם עם עצמך. המאזן השנתי של קופת החולים פחות שלם עם זה.`,
      'grandma': `אה, '${finalDish.name}'! עכשיו זה נשמע לי כמו אוכל! הוספתי לך עוד טיפה רוטב וירטואלי של סבתא, שלא תרזה לי חלילה.`,
      'existential': `'${finalDish.name}' הוא בסך הכל פחמימה או חלבון שתאכל ותעכל. מה המשמעות של ספירת אחוזים כשהזמן עצמו נוזל בין אצבעותינו?`,
      'coach': `'${finalDish.name}' נכנס לזירה! ${finalDish.calories} קלוריות! תתחיל לפמפם שרירי חזה, שום מאכל לא מגיע בחינם! 💪`
    };

    finalDish.comments = comments;

    // Trigger update of display with final estimates
    displayScanResult(finalDish);
    
    // Re-open adjustment inputs since displayScanResult closes it by default
    el.adjustmentFields.classList.remove('hidden');

    if (match) {
      showToast(`הערכים עודכנו בהצלחה לפי המאכל '${finalDish.name}'! 🪄`);
    }
  }

  function deleteMeal(mealId) {
    state.meals = state.meals.filter(meal => meal.id !== mealId);
    saveMealsDatabase();
    showToast("העברה התזונתית נמחקה מהתיק האישי שלך... 🤫");
  }

  // --- STATS & METRICS COMPILING ---
  function updateDashboardMetrics() {
    const nowStr = new Date().toISOString().split('T')[0];
    
    // Calorie Sums
    const todayCalories = state.meals
      .filter(m => m.date === nowStr)
      .reduce((sum, m) => sum + m.calories, 0);

    el.todayTotalCalories.innerText = todayCalories;
    el.todayTargetComparison.innerText = `מתוך יעד של ${state.dailyTarget} קלוריות`;
    
    if (todayCalories > state.dailyTarget) {
      el.todayTotalCalories.style.color = 'var(--accent-pink)';
    } else {
      el.todayTotalCalories.style.color = 'var(--accent-green)';
    }

    // Weekly Average (last 7 days including today)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyMeals = state.meals.filter(m => new Date(m.date) >= sevenDaysAgo);
    
    // Group weekly meals by day
    const weeklyDays = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      weeklyDays[d.toISOString().split('T')[0]] = 0;
    }
    weeklyMeals.forEach(m => {
      if (weeklyDays[m.date] !== undefined) {
        weeklyDays[m.date] += m.calories;
      }
    });

    const weeklySum = Object.values(weeklyDays).reduce((s, v) => s + v, 0);
    const weeklyAvg = Math.round(weeklySum / 7);
    el.weeklyAvgCalories.innerText = weeklyAvg;

    // Compile humorous verdict based on today's intake
    let verdict = "";
    let sub = "";
    const pct = (todayCalories / state.dailyTarget) * 100;

    if (todayCalories === 0) {
      verdict = "קדוש מעונה";
      sub = "עדיין לא תועדו עבירות קלוריות להיום.";
    } else if (pct < 40) {
      verdict = "שד רעב 🥗";
      sub = "הבטן שלך משמיעה קולות של מחאה פוליטית.";
    } else if (pct >= 40 && pct < 85) {
      verdict = "מאוזן (וחשוד) ⚖️";
      sub = "הכל תחת שליטה, אלא אם כן שכחת לסרוק את הרוטב.";
    } else if (pct >= 85 && pct <= 100) {
      verdict = "גבולי ביותר ⚠️";
      sub = "אתה מהלך על חבל דק מאוד מעל פיר סופגניות.";
    } else {
      verdict = "פיצוץ גרעיני 💥";
      sub = "עברת את היעד. ה-AI הכריז על כוננות עורקים מפותלים.";
    }

    el.statusVerdict.innerText = verdict;
    el.statusSubtext.innerText = sub;
  }

  // --- HISTORY TABLE RENDER ---
  function renderMealsTable() {
    const tableBody = el.mealsLogBody;
    tableBody.innerHTML = '';
    
    if (state.meals.length === 0) {
      tableBody.innerHTML = `
        <tr class="empty-row-placeholder">
          <td colspan="5">היומן ריק. אין עדיין תיעוד לעברות תזונתיות כלשהן...</td>
        </tr>`;
      return;
    }

    // Sort meals by date & time descending (newest first)
    const sortedMeals = [...state.meals].sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.time.localeCompare(a.time);
    });

    sortedMeals.forEach(meal => {
      const row = document.createElement('tr');
      
      // Formatting date nice for Hebrew
      const dateParts = meal.date.split('-');
      const formattedDate = `${dateParts[2]}/${dateParts[1]}`;
      
      row.innerHTML = `
        <td>${formattedDate} | ${meal.time}</td>
        <td><strong>${meal.name}</strong> <span style="font-size: 10px; color: var(--text-muted);">(${meal.category})</span></td>
        <td>${meal.weight} גרם</td>
        <td><span style="color: ${meal.calories > 500 ? 'var(--accent-pink)' : 'var(--accent-green)'}">${meal.calories} kcal</span></td>
        <td>
          <button class="btn-delete-log" data-id="${meal.id}" title="מחק רשומה">
            🗑️
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // --- EXPORT JSON LOG ---
  function exportDataAsJson() {
    if (state.meals.length === 0) {
      showToast("אין נתונים לייצוא עדיין! 📭");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.meals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `caloricomed_meals_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("הקובץ הורד למחשבך! 💾");
  }

  // --- DAILY QUOTE SYSTEM ---
  function updateDailyQuote() {
    const quotesForPersona = {
      'passive-aggressive': [
        `"שתהיה לי בריא, העיקר שיש לך תיאבון."`,
        `"אני בטוחה שהסלט הזה ממש מוריד את הקלוריות של הבורקס."`,
        `"יופי, תאכל. הבגדים ממילא מתכווצים בכביסה, נכון?"`,
        `"אמא שלך יודעת שאתה קורא לזה ארוחה?"`
      ],
      'grandma': [
        `"אתה נראה רזה מדי! קח עוד פרוסת עוגה!"`,
        `"קצת שמן בסיר עוד לא הרג אף אחד. זה בריא לעור הפנים."`,
        `"אוי ואבוי, רק ירקות? ככה לא תמצא כלה/חתן!"`,
        `"תאכל, תאכל! סבתא הכינה במיוחד!"`
      ],
      'existential': [
        `"סלט או שווארמה, השמש ממילא תהפוך לענק אדום ותבלע את כולנו."`,
        `"האם הקרואסון מרגיש את הריקנות שאנחנו מנסים למלא בו?"`,
        `"גרביטציה וקלוריות - שני כוחות בלתי נראים שמושכים אותנו למטה."`,
        `"מדוע אנו סופרים קלוריות כשהזמן עצמו אוזל?"`
      ],
      'coach': [
        `"סוכר זה רעל! פחמימה זה האויב! קדימה, 40 שכיבות סמיכה!"`,
        `"כאב זה רק חולשה שעוזבת את הגוף! המבורגר זה שומן שנכנס לגוף!"`,
        `"אם זה טעים - תירק את זה!"`,
        `"אל תפסיק כשקשה, תפסיק כשאתה מקיא!"`
      ]
    };

    const currentList = quotesForPersona[state.aiPersona] || PRESET_QUOTES;
    const randomQuote = currentList[Math.floor(Math.random() * currentList.length)];
    el.dailyQuote.innerText = randomQuote;
  }

  // --- CHART.JS INTERACTION ---
  function initChart() {
    const ctx = document.getElementById('caloriesChart').getContext('2d');
    
    // We'll create custom neon gradients
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(255, 0, 127, 0.4)');
    gradient.addColorStop(1, 'rgba(157, 78, 221, 0.02)');

    window.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'קלוריות שנצרכו',
          data: [],
          backgroundColor: gradient,
          borderColor: '#ff007f', // Accent pink default
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#00e5ff',
          pointBorderColor: '#fff',
          pointHoverRadius: 7,
          pointRadius: 4
        }, {
          label: 'יעד יומי',
          data: [],
          borderColor: 'rgba(57, 255, 20, 0.5)', // Neon green target line
          borderWidth: 2,
          borderDash: [6, 6],
          fill: false,
          pointRadius: 0,
          tension: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#a8a2b5',
              font: { family: 'Rubik', size: 12 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(10, 5, 18, 0.95)',
            titleFont: { family: 'Rubik' },
            bodyFont: { family: 'Rubik' },
            borderColor: '#ff007f',
            borderWidth: 1,
            rtl: true,
            textDirection: 'rtl'
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#a8a2b5',
              font: { family: 'Outfit', size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#a8a2b5',
              font: { family: 'Rubik', size: 11 }
            }
          }
        }
      }
    });

    updateChartData('daily');
  }

  function updateChartData(range) {
    if (!window.myChart) return;
    
    // Adjust colors according to theme selected in state
    let primaryColor = '#ff007f'; // Acid cyber pink
    let targetColor = 'rgba(57, 255, 20, 0.5)'; // Green target
    let pointColor = '#00e5ff'; // Blue points
    
    if (state.colorTheme === 'sunset-pink') {
      primaryColor = '#ff0055';
      targetColor = 'rgba(0, 245, 212, 0.5)';
      pointColor = '#00bbf9';
    } else if (state.colorTheme === 'deep-space') {
      primaryColor = '#00ffff';
      targetColor = 'rgba(57, 255, 20, 0.5)';
      pointColor = '#7209b7';
    }

    const labels = [];
    const calorieData = [];
    const targetData = [];

    const now = new Date();

    if (range === 'daily') {
      // Group today's meals by hours or item names
      const todayStr = now.toISOString().split('T')[0];
      const todayMeals = state.meals
        .filter(m => m.date === todayStr)
        .sort((a, b) => a.time.localeCompare(b.time));

      if (todayMeals.length === 0) {
        labels.push("אין ארוחות היום");
        calorieData.push(0);
        targetData.push(state.dailyTarget);
      } else {
        todayMeals.forEach(meal => {
          labels.push(`${meal.name} (${meal.time})`);
          calorieData.push(meal.calories);
          targetData.push(state.dailyTarget);
        });
      }
    } 
    else if (range === 'weekly') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        
        // Formatted Hebrew day representation
        const dayNames = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];
        labels.push(dayNames[d.getDay()]);
        
        // Sum calories for this day
        const dayCalories = state.meals
          .filter(m => m.date === dStr)
          .reduce((sum, m) => sum + m.calories, 0);
          
        calorieData.push(dayCalories);
        targetData.push(state.dailyTarget);
      }
    } 
    else if (range === 'monthly') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        
        // Display only key dates on axis to avoid clutter
        if (i % 5 === 0) {
          labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
        } else {
          labels.push("");
        }

        const dayCalories = state.meals
          .filter(m => m.date === dStr)
          .reduce((sum, m) => sum + m.calories, 0);
          
        calorieData.push(dayCalories);
        targetData.push(state.dailyTarget);
      }
    }

    // Apply color modifications to datasets
    const chart = window.myChart;
    chart.data.labels = labels;
    chart.data.datasets[0].data = calorieData;
    chart.data.datasets[0].borderColor = primaryColor;
    chart.data.datasets[0].pointBackgroundColor = pointColor;
    chart.data.datasets[1].data = targetData;
    chart.data.datasets[1].borderColor = targetColor;

    // Recreate the gradient background based on theme colors
    const ctx = document.getElementById('caloriesChart').getContext('2d');
    const newGradient = ctx.createLinearGradient(0, 0, 0, 280);
    newGradient.addColorStop(0, convertHexToRgba(primaryColor, 0.45));
    newGradient.addColorStop(1, convertHexToRgba(primaryColor, 0.01));
    chart.data.datasets[0].backgroundColor = newGradient;

    chart.update();
  }

  // Helper function to handle hex to rgba conversion for graph styling
  function convertHexToRgba(hex, alpha) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    }
    return 'rgba(255, 0, 127, ' + alpha + ')'; // fallback
  }

  // --- GENERAL NOTIFICATION SYSTEM (TOAST) ---
  let toastTimeout;
  function showToast(message) {
    clearTimeout(toastTimeout);
    el.toast.innerText = message;
    el.toast.classList.remove('hidden');
    
    // Micro-delay for transition trigger
    setTimeout(() => {
      el.toast.classList.add('show');
    }, 10);

    toastTimeout = setTimeout(() => {
      el.toast.classList.remove('show');
      setTimeout(() => {
        el.toast.classList.add('hidden');
      }, 400);
    }, 3000);
  }

  // RUN MAIN INITIALIZER
  init();
});
