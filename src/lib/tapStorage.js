/**
 * Tap Storage — localStorage service for tap presets, streaks, and progress.
 *
 * Storage keys:
 *   navkar_active_tap   – current active tap configuration
 *   navkar_tap_log      – daily log entries for active tap
 *   navkar_streak       – cached streak value
 */

const ACTIVE_TAP_KEY = 'navkar_active_tap';
const TAP_LOG_KEY = 'navkar_tap_log';
const HISTORY_KEY = 'navkar_history';

// ---------- helpers ----------

const safeParse = (raw, fallback) => {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
};

const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// ---------- Tap presets ----------

export const TAP_PRESETS = [
  {
    id: 'daily',
    name: 'Daily Navkar',
    description: 'Set a daily target of Navkars or malas for your regular sadhana.',
    defaultDailyTarget: 108,
    defaultTotalDays: 0, // ongoing
  },
  {
    id: 'siddhi',
    name: 'Navkar Siddhi Tap',
    description: 'A structured multi-day tap with fixed daily count and total days.',
    defaultDailyTarget: 108,
    defaultTotalDays: 48,
  },
  {
    id: 'parva',
    name: 'Parva Special',
    description: 'Higher daily counts for Paryushan, Ayambil Oli, and other parvas.',
    defaultDailyTarget: 1008,
    defaultTotalDays: 8,
  },
];

// ---------- Active tap CRUD ----------

/**
 * Shape of an active tap:
 * {
 *   presetId: 'daily' | 'siddhi' | 'parva',
 *   name: string,
 *   dailyTarget: number,      // navkars per day
 *   totalDays: number,         // 0 = ongoing
 *   startDate: 'YYYY-MM-DD',
 *   tapLabel: string,          // optional label like 'Ayambil + Navkar'
 * }
 */

export const getActiveTap = () =>
  safeParse(localStorage.getItem(ACTIVE_TAP_KEY), null);

export const saveActiveTap = (tap) =>
  localStorage.setItem(ACTIVE_TAP_KEY, JSON.stringify(tap));

export const clearActiveTap = () =>
  localStorage.removeItem(ACTIVE_TAP_KEY);

// ---------- Tap daily log ----------

/**
 * Log shape: [ { date, navkars, malas } ]
 * Separate from navkar_history so tap-specific tracking is isolated.
 */

export const getTapLog = () =>
  safeParse(localStorage.getItem(TAP_LOG_KEY), []);

export const saveTapLog = (log) =>
  localStorage.setItem(TAP_LOG_KEY, JSON.stringify(log));

export const clearTapLog = () =>
  localStorage.removeItem(TAP_LOG_KEY);

export const addToTapLog = (navkarsToday) => {
  const log = getTapLog();
  const today = todayStr();
  const idx = log.findIndex(e => e.date === today);
  if (idx >= 0) {
    log[idx].navkars = navkarsToday;
    log[idx].malas = Math.floor(navkarsToday / 108);
  } else {
    log.push({ date: today, navkars: navkarsToday, malas: Math.floor(navkarsToday / 108) });
  }
  saveTapLog(log);
  return log;
};

// ---------- Streak computation ----------

export const computeStreak = (history) => {
  if (!Array.isArray(history) || history.length === 0) return 0;

  // Sort descending by date
  const sorted = [...history]
    .filter(h => h.navkars >= 108) // at least 1 mala
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return 0;

  const today = todayStr();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  // Streak must include today or yesterday
  if (sorted[0].date !== today && sorted[0].date !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date);
    const curr = new Date(sorted[i].date);
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

// ---------- Tap progress computation ----------

export const computeTapProgress = () => {
  const tap = getActiveTap();
  if (!tap) return null;

  const log = getTapLog();
  const today = todayStr();

  const completedDays = log.filter(e => e.navkars >= tap.dailyTarget).length;
  const totalNavkarsInTap = log.reduce((sum, e) => sum + e.navkars, 0);
  const totalMalasInTap = log.reduce((sum, e) => sum + e.malas, 0);

  const startDate = new Date(tap.startDate);
  const todayDate = new Date(today);
  const daysSinceStart = Math.max(1, Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24)) + 1);

  const totalDays = tap.totalDays || daysSinceStart; // ongoing taps use elapsed days
  const remaining = Math.max(0, totalDays - completedDays);
  const percentage = totalDays > 0 ? Math.min(100, Math.round((completedDays / totalDays) * 100)) : 0;

  // today's entry
  const todayEntry = log.find(e => e.date === today);
  const todayNavkars = todayEntry ? todayEntry.navkars : 0;

  return {
    tap,
    completedDays,
    remainingDays: remaining,
    totalDays,
    totalNavkarsInTap,
    totalMalasInTap,
    percentage,
    dayNumber: daysSinceStart,
    todayNavkars,
    todayTarget: tap.dailyTarget,
  };
};

// ---------- All-time stats ----------

export const computeAllTimeStats = (history) => {
  if (!Array.isArray(history) || history.length === 0) {
    return { totalNavkars: 0, totalMalas: 0, totalDays: 0, streak: 0 };
  }

  const totalNavkars = history.reduce((sum, h) => sum + (h.navkars || 0), 0);
  const totalMalas = history.reduce((sum, h) => sum + Math.floor((h.navkars || 0) / 108), 0);
  const totalDays = history.length;
  const streak = computeStreak(history);

  return { totalNavkars, totalMalas, totalDays, streak };
};

// ---------- Sadhana Sessions ----------
const SADHANA_SESSIONS_KEY = 'navkar_sadhana_sessions';

export const getSadhanaSessions = () =>
  safeParse(localStorage.getItem(SADHANA_SESSIONS_KEY), []);

export const saveSadhanaSession = (session) => {
  const sessions = getSadhanaSessions();
  sessions.unshift(session); // latest first
  localStorage.setItem(SADHANA_SESSIONS_KEY, JSON.stringify(sessions));
  return sessions;
};

// ---------- Time of Day Tracking ----------
const TIME_OF_DAY_KEY = 'navkar_timeofday_log';

export const getTimeOfDayCategory = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) return 'morning'; // 04:00 - 11:59
  if (hour >= 12 && hour < 17) return 'afternoon'; // 12:00 - 16:59
  if (hour >= 17 && hour < 21) return 'evening'; // 17:00 - 20:59
  return 'night'; // 21:00 - 03:59
};

export const recordTimeOfDayCount = (count = 1, date = new Date()) => {
  const today = todayStr();
  const category = getTimeOfDayCategory(date);
  const log = safeParse(localStorage.getItem(TIME_OF_DAY_KEY), {});

  if (!log[today]) {
    log[today] = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  }

  log[today][category] = (log[today][category] || 0) + count;
  localStorage.setItem(TIME_OF_DAY_KEY, JSON.stringify(log));
  return log[today];
};

export const getTodayTimeOfDayStats = () => {
  if (typeof window === 'undefined') return { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const today = todayStr();
  const log = safeParse(localStorage.getItem(TIME_OF_DAY_KEY), {});
  return log[today] || { morning: 0, afternoon: 0, evening: 0, night: 0 };
};

// ---------- Quick-Add Preference Memory ----------
const QUICK_ADD_PREF_KEY = 'navkar_quickadd_pref';

export const getQuickAddPrefs = () => {
  if (typeof window === 'undefined') return [1, 5, 10, 21, 54, 108];
  return safeParse(localStorage.getItem(QUICK_ADD_PREF_KEY), [1, 5, 10, 21, 54, 108]);
};

export const recordQuickAddUsage = (increment) => {
  if (typeof window === 'undefined') return [1, 5, 10, 21, 54, 108];
  const current = getQuickAddPrefs();
  const filtered = current.filter(x => x !== increment);
  filtered.unshift(increment); // move to front
  const updated = filtered.slice(0, 6);
  localStorage.setItem(QUICK_ADD_PREF_KEY, JSON.stringify(updated));
  return updated;
};

