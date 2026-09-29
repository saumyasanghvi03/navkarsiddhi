// The Capacitor APK bundles a static export of this app (see capacitor.config.ts
// and scripts/build-capacitor-export.mjs) rather than loading the live site, so
// its relative /api/* fetches would otherwise resolve against `https://localhost`
// inside the WebView instead of the real backend. Route them to the deployed
// API when running natively; the web app keeps using same-origin relative paths.
import { isNativeShell } from './nativeWidgetBridge';

// Must match PRODUCTION_URL in capacitor.config.ts.
const PRODUCTION_URL = 'https://navkarsiddhi.vercel.app';

export const apiUrl = (path: string): string => (isNativeShell() ? `${PRODUCTION_URL}${path}` : path);
