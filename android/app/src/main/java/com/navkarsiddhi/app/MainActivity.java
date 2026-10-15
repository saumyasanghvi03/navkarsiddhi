package com.navkarsiddhi.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        super.onCreate(savedInstanceState);
        handleDeeplink(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeeplink(intent);
    }

    /**
     * Handles navkarsiddhi:// deeplinks from App Actions / Gemini voice commands.
     *   navkarsiddhi://add?count=108        → fire NavkarTapReceiver 108 times
     *   navkarsiddhi://add?malas=3          → fire NavkarTapReceiver malaSize*3 times
     *   navkarsiddhi://jaap                 → navigate web layer to jaap tab
     *   navkarsiddhi://progress             → navigate web layer to progress tab
     */
    private void handleDeeplink(Intent intent) {
        if (intent == null) return;
        Uri data = intent.getData();
        if (data == null || !"navkarsiddhi".equals(data.getScheme())) return;

        String host = data.getHost(); // "add", "jaap", "progress", etc.

        if ("add".equals(host)) {
            String countStr = data.getQueryParameter("count");
            String malasStr = data.getQueryParameter("malas");

            int taps = 0;
            if (countStr != null) {
                try { taps = Integer.parseInt(countStr); } catch (NumberFormatException ignored) {}
            } else if (malasStr != null) {
                try {
                    int malas = Integer.parseInt(malasStr);
                    android.content.SharedPreferences prefs = getSharedPreferences(
                        WidgetBridgePlugin.PREFS_NAME, MODE_PRIVATE);
                    int malaSize = prefs.getInt(WidgetBridgePlugin.KEY_MALA_SIZE, 108);
                    taps = malas * malaSize;
                } catch (NumberFormatException ignored) {}
            }

            if (taps > 0 && taps <= 10000) {
                Intent tap = new Intent(NavkarTapReceiver.ACTION_TAP_NAVKAR);
                tap.setClass(this, NavkarTapReceiver.class);
                tap.putExtra("batch_count", taps);
                sendBroadcast(tap);
            }

            // Tell the web layer to refresh its display (final copy required for lambda)
            final int finalTaps = Math.max(0, taps);
            getBridge().getWebView().post(() ->
                getBridge().getWebView().evaluateJavascript(
                    "document.dispatchEvent(new CustomEvent('navkar-voice-add', " +
                    "{ detail: { count: " + finalTaps + " } }))", null));

        } else if ("progress".equals(host)) {
            getBridge().getWebView().post(() ->
                getBridge().getWebView().evaluateJavascript(
                    "document.dispatchEvent(new CustomEvent('navkar-deeplink', " +
                    "{ detail: { page: 'progress' } }))", null));

        } else if ("jaap".equals(host)) {
            getBridge().getWebView().post(() ->
                getBridge().getWebView().evaluateJavascript(
                    "document.dispatchEvent(new CustomEvent('navkar-deeplink', " +
                    "{ detail: { page: 'jaap' } }))", null));
        }
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
