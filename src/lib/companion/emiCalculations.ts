import { EmiEntry } from './types';

export function isOverdue(entry: EmiEntry): boolean {
  if (entry.isPaid) return false;
  return entry.dueDate < new Date().toISOString().slice(0, 10);
}

export function isDueWithinDays(entry: EmiEntry, days: number): boolean {
  if (entry.isPaid) return false;
  const diff = Math.ceil((new Date(entry.dueDate + 'T00:00:00').getTime() - Date.now()) / 86400_000);
  return diff >= 0 && diff <= days;
}

export function daysUntilDue(entry: EmiEntry): number {
  return Math.ceil((new Date(entry.dueDate + 'T00:00:00').getTime() - Date.now()) / 86400_000);
}

export function validateEmiEntry(label: string, amount: number, dueDate: string): string | null {
  if (!label.trim()) return 'Label is required';
  if (amount <= 0 || !Number.isFinite(amount)) return 'Amount must be a positive number';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return 'Invalid date format';
  if (isNaN(new Date(dueDate + 'T00:00:00').getTime())) return 'Invalid date';
  return null;
}

export function sortEmiEntries(entries: EmiEntry[]): EmiEntry[] {
  return [...entries].sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

export function getUpcomingWeek(entries: EmiEntry[]): EmiEntry[] {
  return entries.filter(e => !e.isPaid && isDueWithinDays(e, 7));
}

export function getOverdue(entries: EmiEntry[]): EmiEntry[] {
  return entries.filter(e => isOverdue(e));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
