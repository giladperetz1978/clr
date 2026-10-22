# קלוריטראק

אפליקציית מעקב קלוריות בעברית: https://caloritrack.144.91.96.77.sslip.io/

[הורדת APK ל-Android](https://caloritrack.144.91.96.77.sslip.io/CaloriTrack-debug.apk)

## חשבונות ופרטיות

- התחברות באמצעות שם משתמש וסיסמה שמנהל יוצר. אין הרשמה ציבורית.
- יומן, יעדים, מאגר אישי ומשקל נשמרים מקומית במכשיר ומופרדים לפי מזהה החשבון.
- שום נתוני יומן אינם מועלים אוטומטית. אפשר לבקש גיבוי או שחזור אישי מוצפן דרך מסך ההגדרות.
- Gemini נקרא דרך השרת בלבד. מפתח ה-API אינו נשלח לדפדפן ומאוחסן מוצפן באמצעות systemd.
- הגישה מוצפנת ב-HTTPS; סיסמאות נשמרות כ-hash, וה-session הוא cookie מסוג HttpOnly/Secure.

## תכונות

- מסך ראשי עם דמות SVG מונפשת, סיכום קלוריות ומאקרו, מים וצ'אט Gemini.
- הדמות שומרת על אנימציות האכילה, השתייה, הריצה, המשקולות, הכדורסל, הכדורגל והטניס. המילוי מציג את נתוני היום הנבחר.
- טאבים ליומן, מאגר מזונות, סטטיסטיקה, יעדים והגדרות; בחירת תאריך קבועה בראש.
- Gemini מבין תיאור חופשי, ארוחות, תאריכים, מים ופעילות גופנית; הוא מחפש ברשת לפי הצורך ושומר פריטים חדשים במאגר המקומי.
- צ׳אט המלצות נפרד מציע אוכל וחישוב כמויות לפי יתרת הקלוריות של היום הנבחר, מתאים העדפות כגון חלבי/צמחי/טבעוני, ואינו מוסיף דבר ליומן. אפשר לברר עד שלוש שאלות לכל מאכל; שיחה חדשה מתחילה נושא חדש. כל הצעה נבדקת מול התקציב גם בצד השרת.
- מיקרופון צף עם Speech-to-Text בעברית. לחיצה נוספת או שקט מסיימים ושולחים את התמלול. אין שמירת קובצי קול.
- APK Android משתמש באתר החי וב-SpeechRecognizer של Android. שינוי בכתובת השרת מחייב APK חדש.

## פיתוח ובדיקות

- Node.js 22.13+ (SQLite המובנה) ו-Nginx בשרת; אין תלויות npm חיצוניות.
- בדיקות: `node --test`.
- בדיקת תחביר: `node --check app.js`, `node --check auth.js`, `node --check voice.js`, `node --check server/server.js`.
- Android: JDK, Android SDK 35 ו-Gradle התואם ל-Android Gradle Plugin 8.9.1; בונים עם `gradle -p android assembleDebug`.
- בדיקת גבולות Android: `gradle -p android connectedDebugAndroidTest` עם מכשיר או אמולטור Android 11+.
- פלט APK: `android/app/build/outputs/apk/debug/app-debug.apk`.

## פריסה ב-Contabo

הפריסה מתבצעת מהמחשב המורשה באמצעות SSH alias `ozerishi-contabo`. GitHub Actions מריץ בדיקות ושומר את כתובת GitHub Pages הישנה כהפניה לאתר החדש בלבד. פריסת השרת מתבצעת דרך SSH; אין להעלות את מפתח ה-SSH ל-GitHub.

1. הרץ `powershell -ExecutionPolicy Bypass -File ops\deploy.ps1`. הסקריפט בודק את הקוד, מעלה release חדש, מתקין את שרת Node ואת תצורת Nginx, ומבקש תעודת HTTPS לכתובת `caloritrack.144.91.96.77.sslip.io`.
2. לאחר אימות HTTPS, הגדר את מפתח Gemini בטרמינל אינטראקטיבי: `ssh -t ozerishi-contabo /usr/local/sbin/caloritrack-set-gemini-key`. המפתח מוקלד בלי להציגו ומוצפן בשרת עם מפתח המארח של systemd. אין לשלוח אותו בצ'אט, לשמור אותו בקובץ או לכלול אותו בארגומנט פקודה.
3. צור מנהל ראשוני: `ssh -t ozerishi-contabo 'sudo -u caloritrack /usr/bin/node /var/www/caloritrack/current/server/cli.js init-admin'`. הפקודה מבקשת שם משתמש וסיסמה באופן אינטראקטיבי.
4. צור משתמשים נוספים דרך מסך ניהול המשתמשים. מסור את פרטי ההתחברות מחוץ לצ'אט ובערוץ מאובטח.

ה-service פועל כמשתמש מערכת נפרד, מאזין רק ל-`127.0.0.1`, קורא סודות דרך systemd credentials וכותב נתונים רק תחת `/var/lib/caloritrack`. תיקיית הפריסה: `/var/www/caloritrack`. מפתח ההצפנה לגיבויים נוצר אוטומטית בזמן התקנת השרת; לכל משתמש מפתח גיבוי נגזר בנפרד.

## נקודת שחזור

המצב מלפני המעבר ל-Contabo נשמר בתג `pre-contabo-2026-10-17`. פרטים והוראות שחזור: [SAVEPOINT-PRE-CONTABO-2026-10-17.md](./SAVEPOINT-PRE-CONTABO-2026-10-17.md).
