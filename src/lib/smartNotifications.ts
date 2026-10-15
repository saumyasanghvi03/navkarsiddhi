// Smart daily notifications — morning, evening, before-sleep.
//
// Scheduling: uses Capacitor LocalNotifications `schedule` with a `schedule`
// field containing `at` (Date) and `repeats: true` (daily). Android schedules
// exact alarms via AlarmManager.
//
// Content: tailored to user's actual count / streak / mala data at schedule
// time. Uses usage-pattern data from usageTracker to pick the best hour for
// each slot; falls back to sensible defaults.
//
// No-op everywhere except inside the native Android shell.

import { isNativeShell } from './nativeWidgetBridge';
import { getUsagePattern } from './usageTracker';

const MORNING_ID  = 90220;
const EVENING_ID  = 90221;
const NIGHT_ID    = 90222;
const SCHED_KEY   = 'navkar_sched_notif_enabled';

// ── Default fallback times ────────────────────────────────────────────────────
const DEFAULT_MORNING_HOUR = 7;   // 7 am
const DEFAULT_EVENING_HOUR = 19;  // 7 pm
const DEFAULT_NIGHT_HOUR   = 22;  // 10 pm

export type VibeData = {
  todayNavkars: number;
  malas: number;
  streak: number;
  totalNavkars?: number;
};

// ── 50+ message pool split into time-of-day tiers ────────────────────────────
// Each entry: `(d: VibeData) => { title: string; body: string }`

type MsgFn = (d: VibeData) => { title: string; body: string };

const MORNING: MsgFn[] = [
  d => ({ title: '🌅 Subah ki Sadhana', body: `New day, new karma account. ${d.streak > 0 ? `${d.streak}-day streak on the line ⚡` : 'First navkar of the day is waiting 🙏'}` }),
  d => ({ title: '📿 Morning Jaap', body: `Mahavir Swami woke at Brahma Muhurta. You don't have to — but one mala before chai hits different. Open Navkar Siddhi.` }),
  d => ({ title: '🪔 Jai Jinendra', body: `${d.streak > 1 ? `${d.streak} days strong.` : 'Start your day with dharma.'} Panchparmeshthi suno — Namo Arihantanam 🙏` }),
  d => ({ title: '🌞 Atma se good morning', body: `The five supreme souls are already awake. Your atma is waiting for a morning check-in. Tap to begin jaap 📿` }),
  d => ({ title: '🧘 Brahma Muhurta vibes', body: `Best time to do navkar? Right now, ngl. ${d.streak > 0 ? `${d.streak}-day streak won't protect itself 🔥` : 'Fresh start. Let\'s go. 💪'}` }),
  d => ({ title: '📿 Navkar Siddhi', body: `Morning navkar > morning doomscroll. Easy math. ${d.malas > 0 ? `Yesterday you did ${d.malas} mala${d.malas === 1 ? '' : 's'} 💛` : 'Let\'s get today\'s count going.'}` }),
  d => ({ title: '🌄 Pratah Vandana', body: `Namo Siddhanam. Today's sadhana doesn't do itself. Start light — even 9 navkars is a win 🌸` }),
  d => ({ title: '⭐ Streak alert', body: d.streak >= 7 ? `${d.streak} days. That's actual monk energy 🧘 Don't break it today.` : `Each morning navkar is a brick in your sadhana wall 🏗️ Keep building.` }),
  d => ({ title: '🪔 Jain morning', body: `Chauvihar ho ya na ho — Navkar Siddhi is always open 🙏 One mala before the day pulls you in.` }),
  d => ({ title: '☀️ Rise and recite', body: `The mantra: Namo Arihantanam. The vibe: unmatched. The app: ready. Open and begin 📿` }),
  d => ({ title: '📿 Navkar Siddhi', body: `Shaant raho, navkar karo, repeat. Morning edition 🌅 ${d.streak > 0 ? `Streak: ${d.streak} 🔥` : 'Today is day 1. That\'s enough.'}` }),
  d => ({ title: '🌱 Dharma seed', body: `Plant one mala in the morning, harvest karma points all day. Jain version of compound interest 📈` }),
];

const EVENING: MsgFn[] = [
  d => ({ title: '🌆 Evening check-in', body: d.todayNavkars > 0 ? `${d.todayNavkars} navkars so far today. Evening mala to close the day strong? 📿` : `Day not done yet. Evening navkar hits the hardest — peace in, karma out 🙏` }),
  d => ({ title: '🪔 Sandhya Vandana', body: `Sunset is prime navkar time. ${d.streak > 0 ? `You're on a ${d.streak}-day streak` : 'Start your streak tonight'} — one mala before dark 🌇` }),
  d => ({ title: '📿 Evening Jaap', body: `The day threw a lot at you. Counter it: ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars in already —` : ''} one mala to reset the vibe 🧘` }),
  d => ({ title: '✨ Karma cleanse', body: `Today's karma log: unknown. Today's navkar count so far: ${d.todayNavkars}. The math is simple — open Navkar Siddhi and fix it 📿` }),
  d => ({ title: '🌇 Sanjh ki Sadhana', body: `Golden hour > golden karma. ${d.malas > 0 ? `${d.malas} mala${d.malas === 1 ? '' : 's'} done today 💛` : 'Evening is still on the table 🙏'}` }),
  d => ({ title: '📿 Navkar Siddhi', body: `Office band ho gaya. Commute pe navkar? Hands-free Volume ↓ button = +1 navkar, no screen needed 📱` }),
  d => ({ title: '🌙 Pre-dinner dharma', body: `5 minutes before dinner. One round of Navkar Mantra. Your ancestors will be proud 😌 ${d.streak > 0 ? `${d.streak}-day streak going 🔥` : ''}` }),
  d => ({ title: '⭐ Evening audit', body: `Daily karma audit time 📊 Navkars today: ${d.todayNavkars}. Target: ${d.malas + 1} mala${d.malas === 0 ? '' : 's'}. You can do it before sleep 💪` }),
  d => ({ title: '🏠 Grihastha duty', body: `Jain householder's evening checklist: ✅ work ✅ family ${d.todayNavkars > 0 ? '✅ navkar' : '⬜ navkar — one tap to close this'} 📿` }),
  d => ({ title: '🪔 Evening lamp', body: `Deevo jalavo, navkar karo. That's the Jain evening formula ✨ ${d.todayNavkars > 0 ? `${d.todayNavkars} done today 🙏` : 'Still time to start.'}` }),
  d => ({ title: '📿 Shaam ki yaad', body: `Lobh, krodh, maan, maya, moha — five karma factories running today. Navkar Siddhi is the off switch 🎯` }),
  d => ({ title: '🌆 Before you forget', body: `The day's almost done. Navkars: ${d.todayNavkars}. ${d.todayNavkars === 0 ? 'The evening session is right here — tap to begin 🙏' : `Nice work. Evening top-up? 📿`}` }),
];

const NIGHT: MsgFn[] = [
  d => ({ title: '🌙 Chauvihar reminder', body: `After chauvihar, only water. But navkar? Anytime. ${d.todayNavkars > 0 ? `${d.todayNavkars} done today — ` : ''}Close the day with one mala 🙏` }),
  d => ({ title: '😴 Pre-sleep mala', body: `Jain hack for deep sleep: do a mala lying down, eyes closed, Volume ↓ button counts. Try it tonight 📿` }),
  d => ({ title: '🌟 Raat ki Sadhana', body: `Everyone's asleep. Just you and the mantra. This is the real monk mode 🧘 ${d.streak > 0 ? `Streak: ${d.streak} days 🔥` : 'Start your streak tonight.'}` }),
  d => ({ title: '🪔 Good night, atma', body: `Today: ${d.todayNavkars} navkars${d.malas > 0 ? `, ${d.malas} mala${d.malas === 1 ? '' : 's'}` : ''}. Go to sleep with a clean karma slate — one last round 📿` }),
  d => ({ title: '📿 Bedtime jaap', body: `Ayushi karma starts now 🌙 Lie down, close eyes, Volume ↓ for each navkar. No screen, no effort, pure sadhana.` }),
  d => ({ title: '🌛 Ratri Pratikraman', body: `Mental Pratikraman time: what karma did I bind today? Counter it before sleep. ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars ✅` : 'App is open 🙏'}` }),
  d => ({ title: '💤 Almost midnight sadhana', body: `The universe is quiet. The mantra hits different at night. Namo Arihantanam — one mala to close ${d.streak > 0 ? `day ${d.streak} of your streak` : 'today'} 📿` }),
  d => ({ title: '🌙 Night owl dharma', body: `Late nights hit. But even 5 minutes of navkar before sleep rewires your atma slowly. ${d.todayNavkars > 0 ? `You've already done ${d.todayNavkars} today 💛` : 'Open Navkar Siddhi now 🙏'}` }),
  d => ({ title: '📿 Sleep well, Jain', body: `Sadhus chant through the night. You're a grihastha — one mala is enough to call today a win. ${d.malas > 0 ? `${d.malas} done 🙏` : 'Start now, finish before sleep.'}` }),
  d => ({ title: '🌌 Antaratma check', body: `Before sleep: are you at peace? ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars says yes` : 'Navkar Siddhi open, one mala, then peace 😌'} 🪔` }),
  d => ({ title: '🌙 Dopahar ka hisab', body: `Karma aaj kitna bandhaa? ${d.todayNavkars} navkars ki cheek kardi — par ek mala aur pe consider karo 📿 Jai Jinendra 🙏` }),
  d => ({ title: '✨ Last navkar of the day', body: `Make the last thing you do today a navkar. ${d.streak > 1 ? `${d.streak} days and counting 🔥` : 'A streak starts with one night. This one. 🙏'}` }),
];

const ANYTIME: MsgFn[] = [
  d => ({ title: '📿 Karma nudge', body: `${d.todayNavkars > 0 ? `${d.todayNavkars} navkars in today 💛 But you know one mala more won't hurt.` : 'The five supreme souls are waiting for your attention. Brief check-in? 🙏'}` }),
  d => ({ title: '🪔 Sadhana status', body: `Streak: ${d.streak > 0 ? `${d.streak} day${d.streak === 1 ? '' : 's'} 🔥` : 'not started — today is perfect for day 1'}. Navkars today: ${d.todayNavkars}. One mala: ${Math.ceil((108 - (d.todayNavkars % 108)) / 108 * 108)} to go 📿` }),
  d => ({ title: '✨ Mid-day reset', body: `Feeling scattered? 5 minutes of Navkar Mantra literally reorganises your thoughts. Science and dharma agree 🙏` }),
  d => ({ title: '🧘 Monk check', body: `You have: a phone. The app. ${d.streak > 0 ? `A ${d.streak}-day streak.` : '108 navkars waiting.'} The only thing missing is a tap 📿` }),
  d => ({ title: '📿 Navkar Siddhi', body: `${d.totalNavkars ? `${d.totalNavkars} total navkars on this journey. ` : ''}Every single one counted. Here's one more 🙏 Jai Jinendra.` }),
  d => ({ title: '🌸 Pause and recite', body: `The whole Navkar Mantra takes 30 seconds. One mala = 45 minutes. One navkar = now. Pick one 📿` }),
  d => ({ title: '🔥 Streak check', body: d.streak >= 21 ? `${d.streak} days. You're literally doing Paryushan prep without knowing it 🙏` : d.streak >= 7 ? `${d.streak} days — Mahavir is nodding 💛` : `Start a streak today. Every ${d.streak === 0 ? 'sadhu started at 0' : `streak started at day ${d.streak}`} 📿` }),
  d => ({ title: '🪔 Jai Jinendra', body: `Navkars completed this session: checking… you need to open the app first 😄 📿` }),
  d => ({ title: '💫 Quick sadhana', body: `Volume ↓ button = +1 navkar. Phone in pocket, eyes anywhere. 108 taps = 1 mala. Go. 🙏` }),
  d => ({ title: '📿 Log karte hai sab', body: `Log karte hai protein, calories, steps. Tu log kar navkar 💪 ${d.todayNavkars > 0 ? `${d.todayNavkars} today already.` : 'Start the count.'}` }),
  d => ({ title: '🌿 Ahimsa in action', body: `Zero ahimsa violations since you opened this notification 🌿 Keep it going with a navkar or ten 📿` }),
  d => ({ title: '✨ Karma compound interest', body: `Every navkar is a karma-credit that compounds across lifetimes 📈 Today's ROI: ${d.todayNavkars > 0 ? `${d.todayNavkars} credits logged.` : 'unlimited potential.'}` }),
  d => ({ title: '🎮 Karma Bubble mode', body: `Pop karma bubbles in the Game tab 🎮 Each pop = 1 navkar. Krodh, Lobh, Maya, Maan, Moha — time to clear the board 🧘` }),
  d => ({ title: '📿 The Panchparmeshthi call', body: `Arihant, Siddha, Acharya, Upadhyaya, Sadhu — five supreme souls. Namo all five of them. Right now. 🙏` }),
];

// ── Pick a message for a time slot ───────────────────────────────────────────

type Slot = 'morning' | 'evening' | 'night' | 'anytime';

const pickMsg = (slot: Slot, data: VibeData): { title: string; body: string } => {
  const pool: MsgFn[] = slot === 'morning' ? MORNING
    : slot === 'evening' ? EVENING
    : slot === 'night' ? NIGHT
    : ANYTIME;
  const idx = (data.todayNavkars + data.streak + (data.malas || 0)) % pool.length;
  return pool[idx](data);
};

// ── Capacitor plugin shim ─────────────────────────────────────────────────────

interface LocalNotifPlugin {
  requestPermissions: () => Promise<{ display: string }>;
  checkPermissions: () => Promise<{ display: string }>;
  schedule: (opts: { notifications: Array<Record<string, unknown>> }) => Promise<void>;
  cancel: (opts: { notifications: Array<{ id: number }> }) => Promise<void>;
}

const getPlugin = (): LocalNotifPlugin | undefined => {
  if (typeof window === 'undefined') return undefined;
  const cap = (window as unknown as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor;
  return cap?.Plugins?.LocalNotifications as LocalNotifPlugin | undefined;
};

// ── Preference ────────────────────────────────────────────────────────────────

export const getSchedNotifPref = (): boolean => {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(SCHED_KEY) === 'true'; } catch { return false; }
};

export const setSchedNotifPref = (on: boolean): void => {
  try { localStorage.setItem(SCHED_KEY, on ? 'true' : 'false'); } catch { /* ignore */ }
};

// ── Scheduling ────────────────────────────────────────────────────────────────

/**
 * Schedules (or cancels) the 3 daily reminder notifications based on the
 * user's actual usage pattern. Call this on app open and when the user
 * toggles the preference.
 */
export const syncScheduledNotifications = async (
  data: VibeData,
  enabled?: boolean,
): Promise<void> => {
  if (!isNativeShell()) return;
  const plugin = getPlugin();
  if (!plugin) return;

  const on = enabled !== undefined ? enabled : getSchedNotifPref();

  // Always cancel first so we don't stack duplicates
  try {
    await plugin.cancel({
      notifications: [{ id: MORNING_ID }, { id: EVENING_ID }, { id: NIGHT_ID }],
    });
  } catch { /* ignore */ }

  if (!on) return;

  // Request permission if not already granted
  try {
    const perm = await plugin.checkPermissions();
    if (perm.display !== 'granted') {
      const req = await plugin.requestPermissions();
      if (req.display !== 'granted') return;
    }
  } catch { return; }

  const pattern = getUsagePattern();

  // Determine hours — prefer learned pattern, fall back to defaults
  const morningHour = pattern.hasData && pattern.morningHour !== null
    ? pattern.morningHour : DEFAULT_MORNING_HOUR;
  const eveningHour = pattern.hasData && pattern.eveningHour !== null
    ? pattern.eveningHour : DEFAULT_EVENING_HOUR;
  const nightHour = pattern.hasData && pattern.nightHour !== null
    ? pattern.nightHour : DEFAULT_NIGHT_HOUR;

  const atHour = (hour: number): Date => {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1); // next occurrence
    return d;
  };

  const morningMsg = pickMsg('morning', data);
  const eveningMsg = pickMsg('evening', data);
  const nightMsg   = pickMsg('night',   data);

  try {
    await plugin.schedule({
      notifications: [
        {
          id: MORNING_ID,
          title: morningMsg.title,
          body: morningMsg.body,
          schedule: { at: atHour(morningHour), repeats: true, every: 'day' },
          autoCancel: true,
          silent: false,
        },
        {
          id: EVENING_ID,
          title: eveningMsg.title,
          body: eveningMsg.body,
          schedule: { at: atHour(eveningHour), repeats: true, every: 'day' },
          autoCancel: true,
          silent: false,
        },
        {
          id: NIGHT_ID,
          title: nightMsg.title,
          body: nightMsg.body,
          schedule: { at: atHour(nightHour), repeats: true, every: 'day' },
          autoCancel: true,
          silent: false,
        },
      ],
    });
  } catch { /* ignore — non-critical */ }
};

/** Preview all three notification messages for the current data & hour pattern. */
export const previewNotifications = (data: VibeData) => {
  const pattern = getUsagePattern();
  const morningHour = pattern.hasData && pattern.morningHour !== null
    ? pattern.morningHour : DEFAULT_MORNING_HOUR;
  const eveningHour = pattern.hasData && pattern.eveningHour !== null
    ? pattern.eveningHour : DEFAULT_EVENING_HOUR;
  const nightHour = pattern.hasData && pattern.nightHour !== null
    ? pattern.nightHour : DEFAULT_NIGHT_HOUR;

  const fmt = (h: number) => {
    const d = new Date(); d.setHours(h, 0, 0, 0);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return [
    { slot: 'morning' as Slot, hour: morningHour, time: fmt(morningHour), ...pickMsg('morning', data) },
    { slot: 'evening' as Slot, hour: eveningHour, time: fmt(eveningHour), ...pickMsg('evening', data) },
    { slot: 'night'   as Slot, hour: nightHour,   time: fmt(nightHour),   ...pickMsg('night',   data) },
  ];
};
