// Wrist companion notifications — "Companion" feature for smartwatches like
// the NoiseFit Halo Plus. Noise (and most Android wearables) ship a generic
// notification-mirroring companion app: whatever ongoing Android system
// notification is showing on the phone gets mirrored to the watch face in
// real time. There is no NoiseFit-specific API to target — posting a plain
// Capacitor LocalNotification is enough, and it works identically for every
// brand of watch that mirrors Android notifications (Noise, boAt, Fire-Boltt,
// Amazfit, Galaxy Watch, …), not just NoiseFit.
//
// `window.Capacitor` only exists inside the native Android shell (see
// nativeWidgetBridge.ts for the same pattern) — everywhere else (the plain
// PWA/browser) every export here is a no-op.

import { isNativeShell } from './nativeWidgetBridge';

const ENABLED_KEY = 'navkar_wrist_notif_enabled';
const NOTIFICATION_ID = 90210; // ongoing, silently-updated progress notification
const MALA_MILESTONE_ID = 90211; // one-off, buzzes the watch on mala completion
const TARGET_MILESTONE_ID = 90212; // one-off, buzzes the watch on daily-target completion

interface LocalNotificationsPlugin {
  requestPermissions: () => Promise<{ display: 'granted' | 'denied' | 'prompt' }>;
  checkPermissions: () => Promise<{ display: 'granted' | 'denied' | 'prompt' }>;
  schedule: (options: { notifications: Array<Record<string, unknown>> }) => Promise<void>;
  cancel: (options: { notifications: Array<{ id: number }> }) => Promise<void>;
}

const getPlugin = (): LocalNotificationsPlugin | undefined => {
  if (typeof window === 'undefined') return undefined;
  const capacitor = (window as unknown as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor;
  return capacitor?.Plugins?.LocalNotifications as LocalNotificationsPlugin | undefined;
};

export const isWristNotifSupported = (): boolean => isNativeShell() && !!getPlugin();

export const getWristNotifPref = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ENABLED_KEY) === 'true';
  } catch (_) {
    return false;
  }
};

export const enableWristNotifications = async (): Promise<{ ok: boolean; error?: string }> => {
  const plugin = getPlugin();
  if (!plugin) {
    return { ok: false, error: 'Wrist notifications currently need the Navkar Siddhi Android app.' };
  }

  try {
    const result = await plugin.requestPermissions();
    if (result.display !== 'granted') {
      return { ok: false, error: 'Notification permission was not granted.' };
    }
  } catch (_) {
    return { ok: false, error: 'Could not request notification permission.' };
  }

  try {
    localStorage.setItem(ENABLED_KEY, 'true');
  } catch (_) { /* ignore */ }
  return { ok: true };
};

export const disableWristNotifications = async (): Promise<void> => {
  try {
    localStorage.setItem(ENABLED_KEY, 'false');
  } catch (_) { /* ignore */ }
  await clearWristNotification();
};

// Posts (or silently updates in place) a single ongoing notification showing
// today's live Jaap/mala progress. Any watch mirroring Android notifications
// — NoiseFit Halo Plus included — picks this up with no watch-specific code.
export const updateWristNotification = (data: {
  todayNavkars: number;
  malaSize: number;
  streak: number;
}): void => {
  if (!getWristNotifPref()) return;
  const plugin = getPlugin();
  if (!plugin) return;

  const malaNumber = Math.floor(data.todayNavkars / data.malaSize) + 1;
  const inMala = data.todayNavkars % data.malaSize;
  const streakText = data.streak > 0 ? ` · 🔥${data.streak}d` : '';
  try {
    plugin
      .schedule({
        notifications: [
          {
            id: NOTIFICATION_ID,
            title: 'Navkar Siddhi',
            body: `Mala ${malaNumber} · ${inMala}/${data.malaSize} · ${data.todayNavkars} today${streakText}`,
            ongoing: true,
            autoCancel: false,
            silent: true, // updates in place without re-alerting on every tap
          },
        ],
      })
      .catch(() => { /* ignore — notification just stays on its last value */ });
  } catch (_) {
    /* ignore */
  }
};

export const clearWristNotification = async (): Promise<void> => {
  const plugin = getPlugin();
  if (!plugin) return;
  try {
    await plugin.cancel({
      notifications: [{ id: NOTIFICATION_ID }, { id: MALA_MILESTONE_ID }, { id: TARGET_MILESTONE_ID }],
    });
  } catch (_) { /* ignore */ }
};

// Fires a real (non-silent) notification so watches mirroring Android
// notifications actually buzz the wrist on a milestone — unlike the ongoing
// progress notification above, which updates silently on every tap so normal
// use doesn't spam the watch. autoCancel means it clears itself once opened
// (or on the next milestone of the same kind, since it reuses one fixed id).
const postMilestone = (id: number, title: string, body: string): void => {
  if (!getWristNotifPref()) return;
  const plugin = getPlugin();
  if (!plugin) return;
  try {
    plugin
      .schedule({
        notifications: [
          {
            id,
            title,
            body,
            autoCancel: true,
            silent: false,
          },
        ],
      })
      .catch(() => { /* ignore */ });
  } catch (_) {
    /* ignore */
  }
};

export const postMalaCompleteMilestone = (malasCompleted: number): void => {
  postMilestone(MALA_MILESTONE_ID, '🪔 Mala complete', `${malasCompleted} mala${malasCompleted === 1 ? '' : 's'} done — Jai Jinendra`);
};

export const postDailyTargetMilestone = (dailyTarget: number): void => {
  postMilestone(TARGET_MILESTONE_ID, '🎯 Daily target reached', `${dailyTarget} Navkars done for today — keep going!`);
};
