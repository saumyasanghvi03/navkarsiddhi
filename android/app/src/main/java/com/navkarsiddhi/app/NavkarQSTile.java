package com.navkarsiddhi.app;

import android.annotation.TargetApi;
import android.content.Intent;
import android.os.Build;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;

/**
 * Quick Settings tile — swipe down the notification shade, add the Navkar
 * Siddhi tile, then tap it to open the app straight to Jaap mode.
 * Requires Android 7+ (API 24); the manifest only declares it for 24+.
 */
@TargetApi(Build.VERSION_CODES.N)
public class NavkarQSTile extends TileService {

    @Override
    public void onStartListening() {
        super.onStartListening();
        Tile tile = getQsTile();
        if (tile != null) {
            tile.setState(Tile.STATE_INACTIVE);
            tile.setLabel("Navkar Siddhi");
            tile.updateTile();
        }
    }

    @Override
    public void onClick() {
        super.onClick();
        // startActivityAndCollapse collapses the shade and opens the app.
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivityAndCollapse(intent);
    }
}
