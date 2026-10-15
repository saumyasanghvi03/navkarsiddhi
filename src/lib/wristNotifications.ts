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
const ACTION_TYPE_ID = 'NAVKAR_PROGRESS';
const TAP_ACTION_ID = 'navkar_tap_one';

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

// Registers the "+1 Navkar" action type so the ongoing notification shows an
// interactive button that watch-mirroring apps can also surface on the wrist.
export const initWristNotificationActions = async (): Promise<void> => {
  const plugin = getPlugin() as unknown as LocalNotificationsPlugin & {
    registerActionTypes?: (opts: unknown) => Promise<void>;
    addListener?: (event: string, cb: (data: unknown) => void) => { remove: () => void };
  };
  if (!plugin?.registerActionTypes) return;
  try {
    await plugin.registerActionTypes({
      types: [{ id: ACTION_TYPE_ID, actions: [{ id: TAP_ACTION_ID, title: '+1 Navkar' }] }],
    });
  } catch (_) { /* ignore */ }
};

// Subscribes to notification action taps. Returns an unsubscribe function.
export const addWristTapListener = (callback: () => void): (() => void) => {
  const plugin = getPlugin() as unknown as LocalNotificationsPlugin & {
    addListener?: (event: string, cb: (data: unknown) => void) => { remove: () => void };
  };
  if (!plugin?.addListener) return () => {};
  try {
    const handle = plugin.addListener('localNotificationActionPerformed', (event: unknown) => {
      const e = event as { actionId?: string };
      if (e?.actionId === TAP_ACTION_ID) callback();
    });
    return () => { handle?.remove(); };
  } catch (_) {
    return () => {};
  }
};

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
  postMilestone(MALA_MILESTONE_ID, '🪔 Mala complete', `${malasCompleted} mala${malasCompleted === 1 ? '' : 's'} done — Jai Jinendra 🙏`);
};

export const postDailyTargetMilestone = (dailyTarget: number): void => {
  postMilestone(TARGET_MILESTONE_ID, '🎯 Daily target reached', `${dailyTarget} Navkars done for today — keep going!`);
};

type VibeData = { todayNavkars: number; malas: number; streak: number };

const VIBE_POOL: Array<(d: VibeData) => { title: string; body: string }> = [
  d => ({ title: '📿 Navkar Siddhi', body: `${d.todayNavkars} navkars logged. Your karma account just got a deposit 💸` }),
  d => ({ title: '🙏 Jai Jinendra', body: `Bro really said "I'll do navkar later" and then actually did it 👏 ${d.todayNavkars} done.` }),
  d => ({ title: '✨ Atma check', body: `${d.todayNavkars} navkars = ${d.todayNavkars} bad karmas neutralized (approximately) 😌` }),
  d => ({ title: '📿 Navkar Siddhi', body: `Log karte hai protein. Tu log kar navkar 💪 ${d.todayNavkars} today.` }),
  d => ({ title: '🪔 Jai Jinendra', body: `Mahavir Swami did 12 years of sadhana. You did ${d.todayNavkars} navkars. Humble but valid start 🙏` }),
  d => ({ title: '🔥 Streak check', body: `${d.streak} day streak and you're just gonna close the app like that? Bold. 👀` }),
  d => ({ title: '🌟 Atma glow', body: `Your atma is literally radiating rn ✨ ${d.todayNavkars} navkars. Come back tomorrow.` }),
  d => ({ title: '📿 Navkar Siddhi', body: `Less drama. More dharma. ${d.todayNavkars} navkars locked in today ✅` }),
  d => ({ title: '🧘 Monk mode', body: `Monk mode: activated 🧘 ${d.malas} mala${d.malas !== 1 ? 's' : ''} done. The samsara is long. Keep going.` }),
  d => ({ title: '🪔 Jain check', body: `Paryushan prep is real 😤 ${d.todayNavkars} navkars stored. The five parameshthis have been notified.` }),
  d => ({ title: '✨ Navkar Siddhi', body: `Chauvihar karo, navkar karo, repeat 🌙 That's the Jain grind. ${d.todayNavkars} today.` }),
  d => ({ title: '💛 Jai Jinendra', body: `Your ancestors are literally crying happy tears rn 😭 ${d.todayNavkars} navkars done.` }),
  d => ({ title: '📿 Navkar Siddhi', body: `Namo Arihantanam but make it consistent 📿 ${d.streak} day streak says you're doing it right.` }),
  d => ({ title: '🌿 Ahimsa mode', body: `Zero ahimsa violations. ${d.todayNavkars} navkars. Atma > algorithm 🙏` }),
  d => ({ title: '🔥 Navkar Siddhi', body: `Kevalgyan isn't built in a day, but ${d.todayNavkars} navkars is a solid start 🌟` }),
  d => ({ title: '📿 Sadhana sealed', body: `Said "just one mala" — ended up at ${d.malas} 😅 That's how sadhana works.` }),
  d => ({ title: '🪔 Jain vibes', body: `This > doomscrolling for 2 hours. ${d.todayNavkars} navkars. We love to see it 📱❌` }),
  d => ({ title: '✨ Atma update', body: `${d.todayNavkars} navkars today, ${d.streak} day streak 🔥 The soul is on its main character arc.` }),
];

const VIBE_ID = 90213;

export const postVibeCheck = (data: { todayNavkars: number; malas: number; streak: number }): void => {
  if (!getWristNotifPref()) return;
  const plugin = getPlugin();
  if (!plugin) return;

  const pick = VIBE_POOL[data.todayNavkars % VIBE_POOL.length](data);
  const { title, body } = pick;

  try {
    plugin.schedule({
      notifications: [{ id: VIBE_ID, title, body, autoCancel: true, silent: false }],
    }).catch(() => {});
  } catch (_) { /* ignore */ }
};
