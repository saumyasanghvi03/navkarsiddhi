import type { CapacitorConfig } from '@capacitor/cli';

// This app has dynamic, server-rendered routes (AI endpoints, the cron job,
// the resources submission API) that cannot be statically exported, so the
// native shell loads the real production deployment instead of a bundled
// static build. This is the standard Capacitor pattern for wrapping a
// server-backed web app rather than a purely static site.
const PRODUCTION_URL = 'https://navkarsiddhi.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.navkarsiddhi.app',
  appName: 'Navkar Siddhi',
  webDir: 'public',
  server: {
    url: PRODUCTION_URL,
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
