// Chovihar reminder (sunset food/water cutoff) — real background push via
// Firebase Cloud Messaging. Android only: iOS Safari's push support is
// limited to PWAs added to the home screen and was explicitly scoped out.
//
// The service worker (public/sw.js) owns actual notification display via a
// plain `push` event listener — no firebase-messaging service worker needed,
// so this reuses the app's existing SW registration instead of registering
// a second one at a conflicting scope.

import { getMessaging, getToken, deleteToken, isSupported } from 'firebase/messaging';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const SUBSCRIPTIONS_COLLECTION = 'push_subscriptions';
const ENABLED_KEY = 'navkar_meal_reminders_enabled';
const TOKEN_KEY = 'navkar_fcm_token';

export const isAndroidDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
};

// Synchronous only — safe to call directly inside a click handler with no
// `await` before it. Deliberately excludes firebase/messaging's isSupported(),
// which does a real async IndexedDB open/close round-trip internally; awaiting
// that before Notification.requestPermission() introduces a gap between the
// user's tap and the permission request that some browsers (Chrome on Android
// included) treat as no longer "a direct result of user activation" and
// silently refuse to prompt for, or auto-deny.
const isBasicPlatformSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (!isAndroidDevice()) return false;
  if (!isFirebaseConfigured) return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

// Full check, including firebase/messaging's async isSupported(). Fine to
// call on its own (e.g. to decide whether to render the toggle at all) —
// just never award it before Notification.requestPermission() in the same
// user gesture; see isBasicPlatformSupported above.
export const isMealReminderSupported = async (): Promise<boolean> => {
  if (!isBasicPlatformSupported()) return false;
  try {
    return await isSupported();
  } catch (_) {
    return false;
  }
};

export const getMealReminderPref = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ENABLED_KEY) === 'true';
  } catch (_) {
    return false;
  }
};

export const enableMealReminders = async (): Promise<{ ok: boolean; error?: string }> => {
  if (!isBasicPlatformSupported()) {
    return { ok: false, error: 'Meal-timing reminders currently need Android with push notifications supported.' };
  }

  // A prior explicit "Block" means the browser will resolve this to 'denied'
  // immediately with no prompt shown at all — code cannot re-trigger that
  // prompt once denied, only the user can, from the browser's site settings.
  const alreadyDenied = Notification.permission === 'denied';

  // Requested first, with nothing async before it, so it stays tied to this
  // click (see isBasicPlatformSupported's comment for why that matters).
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return {
      ok: false,
      error: alreadyDenied
        ? 'Notifications are blocked for this site. Open your browser’s site settings for navkarsiddhi.vercel.app, set Notifications to Allow, then try again.'
        : 'Notification permission was not granted.',
    };
  }

  const fullySupported = await isMealReminderSupported();
  if (!fullySupported) {
    return { ok: false, error: 'This browser doesn’t fully support push notifications.' };
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    return { ok: false, error: 'Push notifications are not configured yet.' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const messaging = getMessaging();
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    if (!token) {
      return { ok: false, error: 'Could not get a notification token. Please try again.' };
    }

    if (db) {
      await setDoc(
        doc(db, SUBSCRIPTIONS_COLLECTION, token),
        {
          token,
          platform: 'android',
          enabled: true,
          createdAt: serverTimestamp(),
          lastSentDate: null,
        },
        { merge: true }
      );
    }

    localStorage.setItem(ENABLED_KEY, 'true');
    localStorage.setItem(TOKEN_KEY, token);
    return { ok: true };
  } catch (_) {
    return { ok: false, error: 'Could not enable reminders. Please try again.' };
  }
};

export const disableMealReminders = async (): Promise<void> => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && db) {
      await deleteDoc(doc(db, SUBSCRIPTIONS_COLLECTION, token));
    }
    if (await isMealReminderSupported()) {
      const messaging = getMessaging();
      await deleteToken(messaging).catch(() => {});
    }
  } catch (_) { /* ignore */ }

  try {
    localStorage.setItem(ENABLED_KEY, 'false');
    localStorage.removeItem(TOKEN_KEY);
  } catch (_) { /* ignore */ }
};
