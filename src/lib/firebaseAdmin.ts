// Server-only Firebase Admin init, for sending targeted FCM pushes (the
// client SDK cannot send to a specific token — only Admin SDK / FCM REST
// API can). Guarded the same way as firebase.ts's isFirebaseConfigured: if
// the service account isn't set, features that need it no-op with a clear
// warning instead of crashing the build/dev server.

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

let adminApp: App | null = null;

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (serviceAccountJson) {
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    adminApp = getApps().length ? getApps()[0]! : initializeApp({ credential: cert(serviceAccount) });
  } catch (err) {
    console.error('[firebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err);
  }
} else if (process.env.NODE_ENV !== 'production') {
  console.warn('[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT_JSON is not set. Meal-timing reminders will not be sent.');
}

export const isFirebaseAdminConfigured = !!adminApp;

export const getAdminDb = (): Firestore => {
  if (!adminApp) throw new Error('Firebase Admin is not configured.');
  return getFirestore(adminApp);
};

export const getAdminMessaging = (): Messaging => {
  if (!adminApp) throw new Error('Firebase Admin is not configured.');
  return getMessaging(adminApp);
};
