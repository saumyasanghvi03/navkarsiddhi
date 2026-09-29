import type { CapacitorConfig } from '@capacitor/cli';

// The APK bundles its own static build (run `npm run build:capacitor` before
// `cap sync` — see scripts/build-capacitor-export.mjs, which produces the
// `out/` directory below) instead of loading the live site. The app's
// dynamic/server routes (AI endpoints, the cron job, resource submissions)
// aren't part of that bundle; the bundled pages call them over HTTPS against
// the real deployment instead (see src/lib/apiBase.ts — its PRODUCTION_URL
// must match the domain below).
const config: CapacitorConfig = {
  appId: 'com.navkarsiddhi.app',
  appName: 'Navkar Siddhi',
  webDir: 'out',
  android: {
    allowMixedContent: false,
  },
};

export default config;
