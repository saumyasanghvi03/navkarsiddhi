export type MoodState = 'calm' | 'happy' | 'overwhelmed' | 'low_energy' | 'anxious';

export interface MoodLogEntry {
  id: string;
  date: string;
  mood: MoodState;
  actionTaken: string | null;
  timestamp: number;
}

export interface EmiEntry {
  id: string;
  label: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CompanionState {
  lastMoodCheckin: string | null;
  priorityTask: string | null;
  punyaCount: number;
}
