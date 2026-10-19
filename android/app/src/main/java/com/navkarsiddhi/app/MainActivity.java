package com.navkarsiddhi.app;

import android.os.Bundle;
import android.view.KeyEvent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        registerPlugin(SoulMateAIPlugin.class);
        super.onCreate(savedInstanceState);
        // Schedule background re-engagement worker (idempotent — KEEP policy)
        ReEngagementWorker.schedule(this);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        // Route volume-down press to JS so the user can count Navkars with the
        // physical button — useful during puja with eyes closed or phone pocketed.
        if (event.getKeyCode() == KeyEvent.KEYCODE_VOLUME_DOWN
                && event.getAction() == KeyEvent.ACTION_DOWN) {
            getBridge().getWebView().post(() ->
                getBridge().getWebView().evaluateJavascript(
                    "document.dispatchEvent(new CustomEvent('navkar-volume-down'))", null));
            return true; // consume the event so volume doesn't actually change
        }
        return super.dispatchKeyEvent(event);
    }
}
