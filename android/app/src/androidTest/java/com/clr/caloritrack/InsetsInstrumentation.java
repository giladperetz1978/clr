package com.clr.caloritrack;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.Intent;
import android.graphics.Insets;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;

public final class InsetsInstrumentation extends Instrumentation {
    @Override
    public void onCreate(Bundle arguments) {
        super.onCreate(arguments);
        start();
    }

    @Override
    public void onStart() {
        Bundle result = new Bundle();
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            result.putString("stream", "Insets tests require Android 11 or newer.");
            finish(Activity.RESULT_CANCELED, result);
            return;
        }
        Intent intent = new Intent().setClassName(
                getTargetContext().getPackageName(), "com.clr.caloritrack.MainActivity"
        ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        Activity activity = startActivitySync(intent);
        Bundle testStatus = new Bundle();
        testStatus.putString("id", "InstrumentationTestRunner");
        testStatus.putInt("numtests", 1);
        testStatus.putInt("current", 1);
        testStatus.putString("class", getClass().getName());
        testStatus.putString("test", "safeAreaBounds");
        sendStatus(1, testStatus);
        final AssertionError[] failure = new AssertionError[1];
        runOnMainSync(() -> {
            try {
                ViewGroup decorContent = activity.findViewById(android.R.id.content);
                ViewGroup content = (ViewGroup) decorContent.getChildAt(0);
                checkBounds(content, Insets.of(0, 72, 0, 48), Insets.of(24, 96, 0, 0),
                        Insets.NONE, 24, 96, 0, 48);
                checkBounds(content, Insets.of(0, 72, 0, 48), Insets.of(24, 96, 0, 0),
                        Insets.NONE, 24, 96, 0, 48);
                checkBounds(content, Insets.of(0, 72, 0, 48), Insets.of(24, 96, 0, 0),
                        Insets.of(0, 0, 0, 360), 24, 96, 0, 360);
                checkBounds(content, Insets.of(0, 0, 48, 0), Insets.of(96, 0, 0, 0),
                        Insets.NONE, 96, 0, 48, 0);
                checkBounds(content, Insets.NONE, Insets.NONE, Insets.NONE, 0, 0, 0, 0);
            } catch (AssertionError error) {
                failure[0] = error;
            } finally {
                activity.finish();
            }
        });
        result.putString("stream", failure[0] == null
                ? "PASS: 5 safe-area scenarios; WebView bounds and consumed insets verified."
                : "FAIL: " + failure[0].getMessage());
        if (failure[0] != null) testStatus.putString("stack", failure[0].toString());
        sendStatus(failure[0] == null ? 0 : -2, testStatus);
        finish(failure[0] == null ? Activity.RESULT_OK : Activity.RESULT_CANCELED, result);
    }

    @android.annotation.TargetApi(30)
    private void checkBounds(ViewGroup content, Insets bars, Insets cutout, Insets keyboard,
                             int left, int top, int right, int bottom) {
        WindowInsets insets = new WindowInsets.Builder()
                .setInsets(WindowInsets.Type.systemBars(), bars)
                .setInsets(WindowInsets.Type.displayCutout(), cutout)
                .setInsets(WindowInsets.Type.ime(), keyboard)
                .setVisible(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout()
                        | WindowInsets.Type.ime(), true)
                .build();
        WindowInsets remaining = content.dispatchApplyWindowInsets(insets);
        if (!remaining.isConsumed()) throw new AssertionError("Insets must not reach WebView twice");
        content.measure(View.MeasureSpec.makeMeasureSpec(1080, View.MeasureSpec.EXACTLY),
                View.MeasureSpec.makeMeasureSpec(1920, View.MeasureSpec.EXACTLY));
        content.layout(0, 0, 1080, 1920);
        View webView = content.getChildAt(0);
        if (webView.getLeft() != left || webView.getTop() != top
                || webView.getRight() != 1080 - right || webView.getBottom() != 1920 - bottom) {
            throw new AssertionError("Incorrect WebView bounds: "
                    + webView.getLeft() + "," + webView.getTop() + ","
                    + webView.getRight() + "," + webView.getBottom());
        }
    }
}
