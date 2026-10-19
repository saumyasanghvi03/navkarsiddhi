export type MoodState = 'calm' | 'happy' | 'overwhelmed' | 'low_energy' | 'anxious';

export type BoosterCategory =
  | 'calm_mind'
  | 'navkar_jaap'
  | 'lift_mood'
  | 'restore_energy'
  | 'work_pressure'
  | 'financial_worry'
  | 'need_listener'
  | 'before_sleep';

export interface MoodResponse {
  acknowledgment: string;
  suggestion: string;
  spiritualOption?: string;
  actionType: 'breathe' | 'jaap_short' | 'jaap_mala' | 'gratitude' | 'rest' | 'ground';
  jaapDuration?: number;
}

export interface BoosterAction {
  label: string;
  type: 'breathe' | 'jaap' | 'emi' | 'bhakti' | 'journal' | 'done';
  duration?: number;
}

export interface BoosterResponse {
  title: string;
  message: string;
  spiritualNote?: string;
  actions: BoosterAction[];
}

export interface MoodLogEntry {
  date: string;
  mood: MoodState;
  actionTaken?: string;
  timestamp: number;
}

export interface EmiEntry {
  id: string;
  label: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  createdAt: number;
}
