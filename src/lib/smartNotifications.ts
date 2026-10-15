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

const MORNING_ID    = 90220;
const EVENING_ID    = 90221;
const NIGHT_ID      = 90222;
const CHAUVIHAR_ID  = 90223;
const SCHED_KEY     = 'navkar_sched_notif_enabled';

// ── Default fallback times ────────────────────────────────────────────────────
const DEFAULT_MORNING_HOUR    = 7;   // 7 am
const DEFAULT_EVENING_HOUR    = 19;  // 7 pm
const DEFAULT_NIGHT_HOUR      = 22;  // 10 pm
const DEFAULT_CHAUVIHAR_HOUR  = 18;  // 6 pm — sunset food/water cutoff reminder

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
  d => ({ title: '☀️ Uth ja bhai', body: `The Panch Parmeshthi are already up. Your karma account is at ₹0 for today. ${d.streak > 0 ? `${d.streak}-day streak on the line 😬` : 'First navkar of the day is free 📿'}` }),
  d => ({ title: '🔥 Brahma Muhurta se pehle?', body: `Okay you didn't wake at 4am. Mahavir Swami won't cancel you. But one mala before chai? That's a redemption arc. ${d.streak > 0 ? `Streak ${d.streak} survives if you tap now 😤` : 'Let\'s go 💪'}` }),
  d => ({ title: '📿 Your atma called', body: `She said — "bro it's morning, where are the navkars?" Don't ghost your own atma. Tap. 🙏` }),
  d => ({ title: '🧘 Ngl this hits', body: `Navkar Mantra before screen time = basically a cheat code for the day. Not spiritual advice. Just data. ${d.streak > 0 ? `${d.streak} days of evidence 🔥` : 'Day 1 is the best day to start 📿'}` }),
  d => ({ title: '😤 Grihastha life', body: `Office, family, social media, Jain guilt — you've got a lot running. One mala buys you peace for all of it. That's compound dharma 📈 Open Navkar Siddhi.` }),
  d => ({ title: '🌅 Morning navkar > morning doomscroll', body: `You have 5 minutes. Spend 1 of them on navkar. The rest is yours. ${d.malas > 0 ? `Yesterday: ${d.malas} mala${d.malas === 1 ? '' : 's'}. Today: waiting 📿` : 'Clean slate. Let\'s wreck it with karma points.'}` }),
  d => ({ title: '⚡ Streak danger', body: d.streak >= 7 ? `${d.streak} days straight 🔥 You've officially outlasted most New Year's resolutions. Don't blow it now.` : `${d.streak > 0 ? `Day ${d.streak} alive.` : 'New streak unlocked:'} One tap is all it takes. Namo Arihantanam 📿` }),
  d => ({ title: '🪔 Mahavir energy unlocked', body: `Tap once for navkar energy ↓ Open Navkar Siddhi. Namo Arihantanam. You're already enlightened (in progress). ${d.streak > 0 ? `${d.streak} days 🙏` : ''}` }),
  d => ({ title: '🌸 Soft launch your sadhana', body: `9 navkars. That's it. One Navkar Mantra 9 times. Under 3 minutes. The atma won't complain 🌸 Open the app.` }),
  d => ({ title: '📿 Hot girl sadhana', body: `Hot girls do navkar in the morning. It's science. ${d.streak > 0 ? `${d.streak}-day streak = peak dharma energy 💅` : 'Start today. Glow up is internal.'}` }),
  d => ({ title: '🤌 Ek kaam kar', body: `Literally one thing before the day takes over — one round of Navkar Mantra. Kitchen baad mein, Instagram baad mein. Pehle tu. Pehle atma. 📿` }),
  d => ({ title: '🌄 Pratah Vandana speedrun', body: `Any% navkar: 108 taps, Volume ↓ button, eyes closed, 5 minutes. World record attempt? ${d.streak > 0 ? `Personal best streak: ${d.streak} days 🏆` : 'Leaderboard position: unranked. Fix it 📿'}` }),
];

const EVENING: MsgFn[] = [
  d => ({ title: '🌆 Day ka hisaab', body: `Krodh: kitna? Maan: thoda? Maya: pata nahi 😅 ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars already. Evening mala = karmic flush. Do it.` : 'Navkar count: 0. Evening is still open 📿'}` }),
  d => ({ title: '😤 Commute sadhana', body: `Office band ho gaya. Train/cab pe baithke Volume ↓ button tap karo — no screen, no hands, 100% navkar. Aaj ka best use of commute. 📿` }),
  d => ({ title: '📊 Evening karma audit', body: `Lobh ✓ Maan ✓ Maya ✓ Moha ✓ Krodh ✓ — all five running hot today 😂 Navkar Siddhi is the factory reset. Tap. ${d.todayNavkars > 0 ? `${d.todayNavkars} head start ✅` : ''}` }),
  d => ({ title: '🌇 Golden hour', body: `Sunset hits different when you're mid-mala. ${d.streak > 0 ? `${d.streak}-day streak.` : 'Start your streak tonight.'} Evening navkar is the crème de la crème of sadhana 💛` }),
  d => ({ title: '✅ Grihastha checklist', body: `Work ✅ Family ✅ Dinner ✅ Navkar ${d.todayNavkars > 0 ? `✅ (${d.todayNavkars} done, add more?)` : '⬜ — this is the only one missing. Tap.'}  📿` }),
  d => ({ title: '🔥 5-minute flip', body: `5 minutes of Navkar Mantra = Pratikraman lite™. The guilt from today? Gone. The karma from today? Offset. ${d.malas > 0 ? `${d.malas} mala${d.malas === 1 ? '' : 's'} done. One more? 💪` : 'Open Navkar Siddhi 🙏'}` }),
  d => ({ title: '🪔 Deevo jalavo', body: `Sandhya time. Deevo jalao, navkar karo — that's the whole Jain evening in 6 words. ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars logged 🙏` : 'Abhi bhi time hai 📿'}` }),
  d => ({ title: '😌 Pre-dinner dharma', body: `Literally 3 minutes before dinner. One quick mala. Your pitru will nod in approval from wherever they are 🙏 ${d.streak > 0 ? `Streak ${d.streak} survives 🔥` : ''}` }),
  d => ({ title: '📿 Sanjh ki sadhana', body: `The sun's going down. The kashaya's going up. Counter-attack: one mala, Volume ↓ or finger taps. ${d.todayNavkars > 0 ? `You're at ${d.todayNavkars} today 💛` : 'Evening navkar hits the hardest. Trust 🙏'}` }),
  d => ({ title: '🌙 Shaam warning', body: `Navkar count today: ${d.todayNavkars}. Hours left in day: a few. Ratio: concerning. Fix it 📿` }),
  d => ({ title: '💅 Peak Jain behaviour', body: `You know what's attractive? A ${d.streak > 0 ? `${d.streak}-day navkar streak` : 'consistent sadhana practice'}. You know what's even better? Adding to it tonight. Tap. 📿` }),
  d => ({ title: '🌆 Before you forget', body: `Day's almost done. ${d.todayNavkars === 0 ? 'Zero navkars. The evening session is right here.' : `${d.todayNavkars} navkars in. Evening top-up?`} One tap 📿` }),
];

const NIGHT: MsgFn[] = [
  d => ({ title: '🌙 Bed pe jaane se pehle', body: `Put the phone down. After the navkars. ${d.todayNavkars > 0 ? `${d.todayNavkars} done — ` : ''}Lie down, Volume ↓ in pocket, eyes shut, 108 taps. That's it. Jai Jinendra 🙏` }),
  d => ({ title: '😴 Jain sleep hack', body: `Sadhus chant all night. You're a grihastha — just do one mala in bed. Eyes closed, Volume ↓ taps, no screen. Drift off mid-mantra if you want 😌 ${d.streak > 0 ? `Streak: ${d.streak} 🔥` : ''}` }),
  d => ({ title: '🌟 Main character era', body: `Everyone else is doom-scrolling at ${new Date().getHours() > 21 ? '11pm' : '10pm'}. You're doing navkar. That's unironically the most Mahavir thing you can do right now 📿` }),
  d => ({ title: '🪔 Ratri Pratikraman', body: `Quick mental audit: Krodh today? A little. Maan? Maybe. Lobh? Yes at the mithai stall 😂 Counter all of it — one mala, now. ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars already in 💛` : ''}` }),
  d => ({ title: '📿 Ayushi karma loading…', body: `Best time to build ayushi karma? Sleep onset. Literally. Navkar Mantra as you fall asleep = punyanubandhipunya activated. Science-adjacent dharma 🙏 Open Navkar Siddhi.` }),
  d => ({ title: '💀 Karma debt collector', body: `Today's karma account balance: pending. Navkar count: ${d.todayNavkars}. Closing time: soon 😬 One mala before sleep pays the tab 📿` }),
  d => ({ title: '🌌 Night mode unlocked', body: `Late nights + navkar = unmatched monk aesthetic. ${d.streak > 0 ? `${d.streak} days on the board.` : 'Start the streak tonight.'} The universe is quiet, the mantra is loud 🔥` }),
  d => ({ title: '😤 Don\'t sleep on this', body: `You can scroll. Or you can do 108 navkars in bed in 5 minutes. One of these rewires your karma. The other gives you neck pain. Choose wisely 📿` }),
  d => ({ title: '🧘 Monk mode: easy edition', body: `Actual monks do 48-minute Samayik. You? Just close your eyes and tap Volume ↓ 108 times. That's your grihastha pass 🙏 ${d.malas > 0 ? `${d.malas} mala${d.malas === 1 ? '' : 's'} today already 💛` : ''}` }),
  d => ({ title: '🌙 Last call', body: `${d.todayNavkars > 0 ? `${d.todayNavkars} navkars. Today was good.` : 'Zero navkars. Redemption window: closing.'} One mala before sleep. Antaratma will thank you 🪔` }),
  d => ({ title: '✨ Ye ek kaam kar', body: `Social media: closed. Notifications: off. Navkar Siddhi: open 📿 Make the last thing you tap tonight count. ${d.streak > 1 ? `${d.streak} days 🔥` : 'Day 1 starts at night 🙏'}` }),
  d => ({ title: '🌛 Namo Siddhanam', body: `The Siddhas are chillin in moksha. You're still grinding in samsara. The gap? Navkars. Tap a few before sleep 📿 ${d.streak > 0 ? `Streak ${d.streak} alive 🙏` : ''}` }),
];

const CHAUVIHAR: MsgFn[] = [
  d => ({ title: '🌇 Chauvihar time, bestie', body: `Kitchen is CLOSED. No food, no water till sunrise. Your stomach said no 😤 Your atma said: perfect time for navkars 📿 ${d.todayNavkars > 0 ? `${d.todayNavkars} done today already.` : 'Open Navkar Siddhi.'}` }),
  d => ({ title: '🍽️ Plate down, beads up', body: `You just gave up dinner. That's literally monk-level restraint for a grihastha. Channel that energy — one mala before the sun fully sets 🔥 ${d.streak > 0 ? `Streak ${d.streak} watching 👀` : ''}` }),
  () => ({ title: '😌 No food? More navkars', body: `The logic is simple: stomach empty = mind clearer = navkar hits harder. This is peak sadhana time and it's free 📿 Jai Jinendra 🙏` }),
  d => ({ title: '🌅 Sunset trade-off', body: `Gave up food: ✅ rare Jain W. Now trade 5 minutes for one mala 📿 ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars today — ` : ''}body rests, atma grinds. Open Navkar Siddhi.` }),
  d => ({ title: '🔔 Chauvihar cutoff', body: `Sun's going down. Food: out. Navkars: very much in. The evening belongs to dharma now 🕌 ${d.malas > 0 ? `${d.malas} mala${d.malas === 1 ? '' : 's'} logged today 💛` : 'One mala tonight? 📿'}` }),
  d => ({ title: '💪 Jain athlete mode', body: `Intermittent fasting since Mahavir's time — Jains were ahead. Now that the body's in restraint mode, get the atma into sadhana mode 🧘 ${d.todayNavkars > 0 ? `${d.todayNavkars} done.` : 'Open Navkar Siddhi 📿'}` }),
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

type Slot = 'morning' | 'evening' | 'night' | 'chauvihar' | 'anytime';

const pickMsg = (slot: Slot, data: VibeData): { title: string; body: string } => {
  const pool: MsgFn[] = slot === 'morning' ? MORNING
    : slot === 'evening' ? EVENING
    : slot === 'night' ? NIGHT
    : slot === 'chauvihar' ? CHAUVIHAR
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
      notifications: [{ id: MORNING_ID }, { id: EVENING_ID }, { id: NIGHT_ID }, { id: CHAUVIHAR_ID }],
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

  const morningMsg    = pickMsg('morning',    data);
  const eveningMsg    = pickMsg('evening',    data);
  const nightMsg      = pickMsg('night',      data);
  const chauviharMsg  = pickMsg('chauvihar',  data);

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
        {
          id: CHAUVIHAR_ID,
          title: chauviharMsg.title,
          body: chauviharMsg.body,
          schedule: { at: atHour(DEFAULT_CHAUVIHAR_HOUR), repeats: true, every: 'day' },
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
    { slot: 'morning'    as Slot, hour: morningHour,              time: fmt(morningHour),             ...pickMsg('morning',    data) },
    { slot: 'chauvihar'  as Slot, hour: DEFAULT_CHAUVIHAR_HOUR,   time: fmt(DEFAULT_CHAUVIHAR_HOUR),  ...pickMsg('chauvihar',  data) },
    { slot: 'evening'    as Slot, hour: eveningHour,              time: fmt(eveningHour),             ...pickMsg('evening',    data) },
    { slot: 'night'      as Slot, hour: nightHour,                time: fmt(nightHour),               ...pickMsg('night',      data) },
  ];
};
