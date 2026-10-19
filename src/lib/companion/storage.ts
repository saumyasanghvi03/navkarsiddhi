import { MoodLogEntry, EmiEntry } from './types';

const MOOD_KEY = 'navkar_mood_log';
const EMI_KEY = 'navkar_emi_entries';
const PRIORITY_KEY = 'navkar_priority_task';
const PUNYA_KEY = 'navkar_punya_count';
const EMI_OPTED_KEY = 'navkar_emi_opted_in';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}

function safeSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function getMoodLog(): MoodLogEntry[] { return safeGet<MoodLogEntry[]>(MOOD_KEY, []); }

export function addMoodEntry(entry: MoodLogEntry): void {
  const log = getMoodLog();
  log.push(entry);
  const cutoff = Date.now() - 90 * 24 * 3600_000;
  safeSet(MOOD_KEY, log.filter(e => e.timestamp > cutoff));
}

export function getTodayMood(): MoodLogEntry | undefined {
  const today = new Date().toISOString().slice(0, 10);
  return getMoodLog().find(e => e.date === today);
}

export function getEmiEntries(): EmiEntry[] { return safeGet<EmiEntry[]>(EMI_KEY, []); }
export function saveEmiEntries(entries: EmiEntry[]): void { safeSet(EMI_KEY, entries); }
export function clearAllEmiData(): void { try { localStorage.removeItem(EMI_KEY); } catch {} }

export function getPriorityTask(): string { return safeGet<string>(PRIORITY_KEY, ''); }
export function savePriorityTask(task: string): void { safeSet(PRIORITY_KEY, task); }

export function getPunyaCount(): number { return safeGet<number>(PUNYA_KEY, 0); }
export function addPunya(amount: number): void { safeSet(PUNYA_KEY, getPunyaCount() + amount); }

export function getEmiOptedIn(): boolean | null {
  try {
    const val = localStorage.getItem(EMI_OPTED_KEY);
    if (val === null) return null;
    return val === 'true';
  } catch { return null; }
}
export function setEmiOptedIn(opted: boolean): void {
  try { localStorage.setItem(EMI_OPTED_KEY, String(opted)); } catch {}
}
