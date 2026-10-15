// Tracks hourly app-open patterns so smart notifications can fire at times
// the user is actually likely to be using the app.
//
// Data stays local (localStorage only) — never leaves the device.

const USAGE_KEY = 'navkar_usage_hours';
const MAX_DAYS = 30; // rolling window

interface HourBuckets {
  [hour: number]: number; // hour 0-23 → open count
}

interface UsageLog {
  days: Record<string, HourBuckets>; // "2026-10-15" → { 7: 3, 20: 2, … }
}

const load = (): UsageLog => {
  if (typeof window === 'undefined') return { days: {} };
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY) || '{"days":{}}');
  } catch {
    return { days: {} };
  }
};

const save = (log: UsageLog): void => {
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(log));
  } catch { /* ignore */ }
};

const todayKey = (): string => new Date().toISOString().slice(0, 10);

/** Call once on app open — records the current hour. */
export const recordAppOpen = (): void => {
  const log = load();
  const key = todayKey();
  const hour = new Date().getHours();
  if (!log.days[key]) log.days[key] = {};
  log.days[key][hour] = (log.days[key][hour] || 0) + 1;

  // Prune old days
  const keys = Object.keys(log.days).sort();
  if (keys.length > MAX_DAYS) {
    keys.slice(0, keys.length - MAX_DAYS).forEach(k => delete log.days[k]);
  }

  save(log);
};

interface UsagePattern {
  /** Best hour for morning reminder (4–11), or null if no data */
  morningHour: number | null;
  /** Best hour for evening reminder (17–20), or null */
  eveningHour: number | null;
  /** Best hour for bedtime reminder (21–23), or null */
  nightHour: number | null;
  /** Aggregated counts per hour across all logged days */
  hourCounts: Record<number, number>;
  /** Whether we have enough data (≥3 days) to personalise */
  hasData: boolean;
}

/** Reads the rolling log and returns the user's typical usage hours. */
export const getUsagePattern = (): UsagePattern => {
  const log = load();
  const days = Object.values(log.days);
  const hasData = days.length >= 3;

  // Aggregate counts across all days
  const hourCounts: Record<number, number> = {};
  for (const day of days) {
    for (const [h, c] of Object.entries(day)) {
      const hour = Number(h);
      hourCounts[hour] = (hourCounts[hour] || 0) + (c as number);
    }
  }

  const bestInRange = (min: number, max: number): number | null => {
    let best: number | null = null;
    let bestCount = 0;
    for (let h = min; h <= max; h++) {
      if ((hourCounts[h] || 0) > bestCount) {
        bestCount = hourCounts[h] || 0;
        best = h;
      }
    }
    return best;
  };

  return {
    morningHour: bestInRange(4, 11),
    eveningHour: bestInRange(17, 20),
    nightHour: bestInRange(21, 23),
    hourCounts,
    hasData,
  };
};
