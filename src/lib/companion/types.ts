export type MoodState = 'calm' | 'happy' | 'overwhelmed' | 'low_energy' | 'anxious';

export interface MoodResponse {
  acknowledgment: string;
  suggestion: string;
  spiritualOption?: string;
  actionType: 'breathe' | 'jaap_short' | 'jaap_mala' | 'gratitude' | 'rest' | 'ground';
  jaapDuration?: number;
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
