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

export const isMealReminderSupported = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (!isAndroidDevice()) return false;
  if (!isFirebaseConfigured) return false;
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return false;
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
  const supported = await isMealReminderSupported();
  if (!supported) {
    return { ok: false, error: 'Meal-timing reminders currently need Android with push notifications supported.' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { ok: false, error: 'Notification permission was not granted.' };
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
