import type { CapacitorConfig } from '@capacitor/cli';

// ADAPTIVE MODE: The APK loads the live Vercel deployment instead of a
// bundled static build. This means ALL updates (bug fixes, new features,
// content) deploy instantly to existing APKs without requiring a new release.
// The `out/` directory (from `npm run build:capacitor`) is kept as a
// fallback in webDir but the server.url takes precedence when online.
// For local development without internet, comment out the server block.
const config: CapacitorConfig = {
  appId: 'com.navkarsiddhi.app',
  appName: 'Navkar Siddhi',
  webDir: 'out',
  android: {
    allowMixedContent: false,
  },
};

export default config;
