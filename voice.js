(() => {
  const button = document.getElementById('voice-toggle');
  const label = document.getElementById('voice-button-label');
  const panel = document.getElementById('voice-panel');
  const status = document.getElementById('voice-status');
  const transcript = document.getElementById('voice-transcript');
  const dismiss = document.getElementById('voice-dismiss');
  const input = document.getElementById('ai-food-description');
  const form = document.getElementById('ai-food-form');
  const submit = document.getElementById('ai-food-submit-btn');
  let session = null;
  let sequence = 0;
  let hideTimer;

  function message(text, isError = false) {
    clearTimeout(hideTimer);
    panel.classList.remove('hidden');
    panel.classList.toggle('is-error', isError);
    status.textContent = text;
  }

  function showDashboard() {
    document.querySelectorAll('.modal-backdrop').forEach((modal) => modal.classList.add('hidden'));
    document.querySelector('[data-view="dashboard"]').click();
  }

  function nativeCommand(command, current) {
    window.location.href = `caloritrack://voice/${command}?session=${current.id}`;
  }

  function displayPhase(phase) {
    dismiss.disabled = phase !== 'idle';
    const recording = phase === 'recording';
    button.classList.toggle('is-recording', recording);
    button.setAttribute('aria-pressed', String(recording));
    button.setAttribute('aria-label', phase === 'idle' ? 'התחל הקלטה ושלח ל-Gemini' : 'סיים הקלטה');
    label.textContent = {
      idle: 'דברו עם Gemini',
      starting: 'פותח מיקרופון...',
      recording: 'מקליט · לחצו לסיום',
      stopping: 'מסיים תמלול...'
    }[phase];
  }

  function finish(current, error = '') {
    if (session !== current) return;
    clearTimeout(current.silenceTimer);
    clearTimeout(current.limitTimer);
    clearTimeout(current.finishTimer);
    session = null;
    displayPhase('idle');
    input.readOnly = false;
    submit.disabled = isAiAnalysisBusy;

    if (current.cancelled) {
      input.value = current.draft;
      message(error || 'ההקלטה בוטלה. לא נשלח דבר.');
      return;
    }

    const text = current.finalText.trim();
    const recovered = [text, current.interimText.trim()].filter(Boolean).join(' ');
    if (recovered) input.value = [current.draft, error || !text ? recovered : text].filter(Boolean).join('\n');
    if (error) {
      console.error('Speech input failed:', error);
      message(`${error}${recovered ? ' התמלול נשמר בשדה; בדוק ושלח ידנית.' : ''}`, true);
      if (recovered) showDashboard();
      return;
    }
    if (!text) {
      message(recovered
        ? 'התמלול לא הושלם. הטקסט נשמר לבדיקה ושליחה ידנית.'
        : 'לא זוהה דיבור. לחץ על המיקרופון ונסה שוב.', true);
      if (recovered) showDashboard();
      return;
    }

    showDashboard();
    if (input.value.length > input.maxLength) {
      message(`התמלול ארוך מדי. קצר את הטקסט ל-${input.maxLength} תווים ושלח ידנית.`, true);
      return;
    }
    if (!unlockedGeminiApiKey || isAiAnalysisBusy) {
      message('הטקסט נשמר. פתח את מפתח Gemini או המתן לסיום הבקשה הנוכחית, ושלח ידנית.', true);
      return;
    }
    form.dataset.voiceDate = current.date;
    message('התמלול נשלח ל-Gemini. התוצאה תופיע בצ׳אט.');
    hideTimer = setTimeout(() => panel.classList.add('hidden'), 3500);
    form.requestSubmit();
  }

  function fail(current, text) {
    if (session !== current) return;
    if (current.native) nativeCommand('cancel', current);
    else abortRecognition(current);
    finish(current, text);
  }

  function abortRecognition(current) {
    if (!current.recognition) return;
    current.recognition.onerror = null;
    current.recognition.onend = null;
    current.recognition.abort();
  }

  function stop(current) {
    if (session !== current || current.phase === 'stopping') return;
    if (current.phase === 'starting') {
      current.cancelled = true;
      if (current.native) nativeCommand('cancel', current);
      else abortRecognition(current);
      finish(current);
      return;
    }
    current.phase = 'stopping';
    displayPhase('stopping');
    clearTimeout(current.silenceTimer);
    message('ההקלטה הסתיימה, ממתין לתמלול הסופי...');
    current.finishTimer = setTimeout(() => fail(current, 'שירות הדיבור לא סיים בזמן.'), 6000);
    if (current.native) nativeCommand('stop', current);
    else current.recognition.stop();
  }

  function armSilenceTimer(current, duration = 2500) {
    clearTimeout(current.silenceTimer);
    if (session === current && current.phase === 'recording') {
      current.silenceTimer = setTimeout(() => stop(current), duration);
    }
  }

  function started(current) {
    if (session !== current || current.phase !== 'starting') return;
    clearTimeout(current.finishTimer);
    current.phase = 'recording';
    displayPhase('recording');
    message('מקליט בעברית. לחיצה נוספת או שקט מסיימים ושולחים ל-Gemini.');
    armSilenceTimer(current, 7000);
    current.limitTimer = setTimeout(() => stop(current), 60000);
  }

  const errors = {
    'not-allowed': 'אין הרשאה למיקרופון. אפשר גישה למיקרופון בהגדרות הדפדפן או המכשיר.',
    'service-not-allowed': 'שירות זיהוי הדיבור אינו מורשה במכשיר.',
    'audio-capture': 'לא ניתן לגשת למיקרופון. בדוק שאינו תפוס באפליקציה אחרת.',
    network: 'שירות הדיבור לא זמין ברשת. בדוק חיבור לאינטרנט.',
    'no-speech': 'לא זוהה דיבור. נסה לדבר קרוב יותר למיקרופון.',
    'language-not-supported': 'שירות הדיבור במכשיר אינו תומך בעברית.',
    aborted: 'ההקלטה הופסקה.',
    unavailable: 'זיהוי דיבור אינו זמין. השתמש ב-Chrome או התקן/הפעל שירות זיהוי דיבור ב-Android.',
    busy: 'שירות הדיבור תפוס. נסה שוב בעוד רגע.'
  };

  dismiss.addEventListener('click', () => panel.classList.add('hidden'));

  button.addEventListener('click', async () => {
    if (aiKeyLoading) {
      message('טוען את מפתח Gemini השמור. לחץ שוב בעוד רגע.');
      return;
    }
    if (session) {
      stop(session);
      return;
    }
    transcript.textContent = '';
    if (isAiAnalysisBusy) {
      message('Gemini עדיין מעבד את ההודעה הקודמת. המתן לסיום.', true);
      return;
    }
    if (!unlockedGeminiApiKey) {
      document.querySelector('[data-view="settings"]').click();
      message('לפני ההקלטה יש להגדיר או לפתוח את מפתח Gemini בהגדרות.', true);
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const native = window.caloriTrackNativeVoice === true;
    if (!native && (!Recognition || !window.isSecureContext)) {
      message(errors.unavailable, true);
      return;
    }
    const current = {
      id: ++sequence, native, phase: 'starting', draft: input.value.trim(),
      date: currentDate, finalText: '', interimText: '', cancelled: false
    };
    session = current;
    input.readOnly = true;
    submit.disabled = true;
    displayPhase('starting');
    message('מאפשרים גישה למיקרופון. התמלול עשוי להיעשות בשירות הדיבור של המכשיר או הדפדפן.');
    current.finishTimer = setTimeout(() => fail(current, 'פתיחת המיקרופון ארכה זמן רב מדי. נסה שוב.'), 30000);
    if (native) {
      nativeCommand('start', current);
      return;
    }
    try {
      const recognition = new Recognition();
      current.recognition = recognition;
      recognition.lang = 'he-IL';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => started(current);
      recognition.onspeechstart = () => {
        if (session === current) clearTimeout(current.silenceTimer);
      };
      recognition.onspeechend = () => armSilenceTimer(current);
      recognition.onresult = (event) => {
        if (session !== current) return;
        let finalText = '';
        let interimText = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) finalText += `${result[0].transcript} `;
          else interimText += `${result[0].transcript} `;
        }
        current.finalText = finalText;
        current.interimText = interimText;
        transcript.textContent = `${finalText}${interimText}`;
        armSilenceTimer(current);
      };
      recognition.onerror = (event) => fail(current, errors[event.error] || `זיהוי הדיבור נכשל (${event.error}).`);
      recognition.onend = () => finish(current);
      recognition.start();
    } catch (error) {
      console.error('Could not start speech recognition:', error);
      fail(current, errors.unavailable);
    }
  });

  window.addEventListener('caloritrack-voice', (event) => {
    const current = session;
    const detail = event.detail;
    if (!current?.native || !detail || detail.session !== current.id) return;
    if (detail.type === 'start') started(current);
    if (detail.type === 'speech') clearTimeout(current.silenceTimer);
    if (detail.type === 'speech-end') armSilenceTimer(current);
    if (detail.type === 'partial') {
      current.interimText = typeof detail.text === 'string' ? detail.text : '';
      transcript.textContent = current.interimText;
      armSilenceTimer(current);
    }
    if (detail.type === 'result') {
      current.finalText = typeof detail.text === 'string' ? detail.text : '';
      finish(current);
    }
    if (detail.type === 'error') fail(current, errors[detail.text] || 'זיהוי הדיבור נכשל. נסה שוב.');
  });

  function cancelInBackground() {
    if (!session) return;
    const current = session;
    current.cancelled = true;
    if (current.native) nativeCommand('cancel', current);
    else abortRecognition(current);
    finish(current, 'ההקלטה בוטלה במעבר לרקע. לא נשלח דבר.');
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelInBackground();
  });
  window.addEventListener('pagehide', cancelInBackground);
})();
