package com.clr.caloritrack;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Bundle;
import android.os.Build;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.widget.FrameLayout;
import org.json.JSONObject;
import java.util.ArrayList;

public final class MainActivity extends Activity {
    private static final String APP_HOST = "caloritrack.144.91.96.77.sslip.io";
    private static final String APP_URL = "https://caloritrack.144.91.96.77.sslip.io/";
    private static final int FILE_CHOOSER_REQUEST = 501;
    private static final int MICROPHONE_REQUEST = 502;

    private WebView webView;
    private ValueCallback<Uri[]> fileChooserCallback;
    private SpeechRecognizer speechRecognizer;
    private int voiceSession;
    private boolean waitingForPermission;
    private boolean voiceStopping;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                cancelVoice();
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (isAppUrl(url)) {
                    view.evaluateJavascript("window.caloriTrackNativeVoice = true;", null);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("caloritrack".equals(uri.getScheme())) {
                    if (request.isForMainFrame() && isAppUrl(view.getUrl())
                            && "voice".equals(uri.getHost())) {
                        handleVoiceCommand(uri);
                    }
                    return true;
                }
                if (isAppUrl(uri.toString())) {
                    return false;
                }

                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (ActivityNotFoundException exception) {
                    Toast.makeText(MainActivity.this, R.string.no_app_for_link, Toast.LENGTH_SHORT)
                            .show();
                }
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(
                    WebView view,
                    ValueCallback<Uri[]> callback,
                    FileChooserParams fileChooserParams
            ) {
                if (fileChooserCallback != null) {
                    fileChooserCallback.onReceiveValue(null);
                }
                fileChooserCallback = callback;
                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (ActivityNotFoundException exception) {
                    fileChooserCallback = null;
                    callback.onReceiveValue(null);
                    Toast.makeText(MainActivity.this, R.string.no_file_picker, Toast.LENGTH_SHORT)
                            .show();
                    return false;
                }
            }
        });

        FrameLayout content = new FrameLayout(this);
        content.setBackgroundColor(Color.rgb(15, 23, 42));
        content.addView(webView);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
            content.setOnApplyWindowInsetsListener((view, insets) -> {
                Insets safeArea = insets.getInsets(
                        WindowInsets.Type.systemBars()
                                | WindowInsets.Type.displayCutout()
                                | WindowInsets.Type.ime()
                );
                view.setPadding(safeArea.left, safeArea.top, safeArea.right, safeArea.bottom);
                // The native container owns the safe area; do not apply it again inside WebView.
                return WindowInsets.CONSUMED;
            });
        }
        setContentView(content);
        content.requestApplyInsets();
        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(APP_URL);
        }
    }

    private boolean isAppUrl(String url) {
        if (url == null) return false;
        Uri uri = Uri.parse(url);
        String path = uri.getPath();
        return "https".equals(uri.getScheme()) && APP_HOST.equals(uri.getHost())
                && (uri.getPort() == -1 || uri.getPort() == 443)
                && path != null && path.startsWith("/");
    }

    private void handleVoiceCommand(Uri uri) {
        String sessionValue = uri.getQueryParameter("session");
        if (sessionValue == null || !sessionValue.matches("[1-9][0-9]{0,8}")) return;
        int sessionId = Integer.parseInt(sessionValue);
        if ("/start".equals(uri.getPath())) {
            cancelVoice();
            voiceSession = sessionId;
            if (!SpeechRecognizer.isRecognitionAvailable(this)) {
                emitVoice(sessionId, "error", "unavailable");
                cancelVoice();
            } else if (checkSelfPermission(Manifest.permission.RECORD_AUDIO)
                    != PackageManager.PERMISSION_GRANTED) {
                waitingForPermission = true;
                requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, MICROPHONE_REQUEST);
            } else {
                startVoice(sessionId);
            }
        } else if (sessionId == voiceSession && "/stop".equals(uri.getPath())) {
            if (speechRecognizer != null && !voiceStopping) {
                voiceStopping = true;
                speechRecognizer.stopListening();
            }
        } else if (sessionId == voiceSession && "/cancel".equals(uri.getPath())) {
            cancelVoice();
        }
    }

    private void emitVoice(int sessionId, String type, String text) {
        if (webView == null || !isAppUrl(webView.getUrl())) return;
        String detail = "{session:" + sessionId + ",type:" + JSONObject.quote(type)
                + ",text:" + JSONObject.quote(text) + "}";
        webView.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('caloritrack-voice',{detail:" + detail + "}));",
                null
        );
    }

    private void startVoice(final int sessionId) {
        if (voiceSession != sessionId || !isAppUrl(webView.getUrl())) return;
        try {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override
                public void onReadyForSpeech(Bundle params) {
                    if (voiceSession == sessionId) emitVoice(sessionId, "start", "");
                }

                @Override
                public void onBeginningOfSpeech() {
                    if (voiceSession == sessionId) emitVoice(sessionId, "speech", "");
                }

                @Override
                public void onEndOfSpeech() {
                    if (voiceSession == sessionId) emitVoice(sessionId, "speech-end", "");
                }

                @Override
                public void onPartialResults(Bundle results) {
                    if (voiceSession == sessionId) emitVoice(sessionId, "partial", getSpeechText(results));
                }

                @Override
                public void onResults(Bundle results) {
                    if (voiceSession != sessionId) return;
                    emitVoice(sessionId, "result", getSpeechText(results));
                    cancelVoice();
                }

                @Override
                public void onError(int error) {
                    if (voiceSession != sessionId) return;
                    String code;
                    switch (error) {
                        case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: code = "not-allowed"; break;
                        case SpeechRecognizer.ERROR_NETWORK:
                        case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: code = "network"; break;
                        case SpeechRecognizer.ERROR_AUDIO: code = "audio-capture"; break;
                        case SpeechRecognizer.ERROR_NO_MATCH:
                        case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: code = "no-speech"; break;
                        case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: code = "busy"; break;
                        case SpeechRecognizer.ERROR_LANGUAGE_NOT_SUPPORTED:
                        case SpeechRecognizer.ERROR_LANGUAGE_UNAVAILABLE: code = "language-not-supported"; break;
                        default: code = "unavailable";
                    }
                    emitVoice(sessionId, "error", code);
                    cancelVoice();
                }

                @Override public void onRmsChanged(float rmsdB) { }
                @Override public void onBufferReceived(byte[] buffer) { }
                @Override public void onEvent(int eventType, Bundle params) { }
            });
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "he-IL");
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
            speechRecognizer.startListening(intent);
        } catch (SecurityException | IllegalArgumentException exception) {
            android.util.Log.e("CaloriTrack", "Could not start speech recognition", exception);
            emitVoice(sessionId, "error", "unavailable");
            cancelVoice();
        }
    }

    private String getSpeechText(Bundle results) {
        ArrayList<String> matches = results == null
                ? null : results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        return matches == null || matches.isEmpty() ? "" : matches.get(0);
    }

    private void cancelVoice() {
        voiceSession = 0;
        voiceStopping = false;
        if (speechRecognizer != null) {
            speechRecognizer.cancel();
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != MICROPHONE_REQUEST) return;
        waitingForPermission = false;
        if (voiceSession == 0) return;
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startVoice(voiceSession);
        } else {
            emitVoice(voiceSession, "error", "not-allowed");
            cancelVoice();
        }
    }

    @Override
    protected void onPause() {
        if (!waitingForPermission && voiceSession != 0) {
            emitVoice(voiceSession, "error", "aborted");
            cancelVoice();
        }
        super.onPause();
    }

    @Override
    @SuppressWarnings("deprecation")
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER_REQUEST || fileChooserCallback == null) {
            return;
        }

        Uri[] result = resultCode == RESULT_OK
                ? WebChromeClient.FileChooserParams.parseResult(resultCode, data)
                : null;
        fileChooserCallback.onReceiveValue(result);
        fileChooserCallback = null;
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) {
            webView.saveState(outState);
        }
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onDestroy() {
        cancelVoice();
        if (fileChooserCallback != null) {
            fileChooserCallback.onReceiveValue(null);
            fileChooserCallback = null;
        }
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
