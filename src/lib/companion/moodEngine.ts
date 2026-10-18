import { MoodState, MoodResponse } from './types';

const RESPONSES: Record<MoodState, MoodResponse> = {
  calm: {
    acknowledgment: "Sab sorted hai aaj \u{1f60c} That's beautiful.",
    suggestion: "A good day to reflect — what are you grateful for today?",
    spiritualOption: "If you feel like it, a peaceful navkar mala can deepen this calm.",
    actionType: 'gratitude',
  },
  happy: {
    acknowledgment: "Love this energy! \u{1f49b} Khush raho, always.",
    suggestion: "Ride this wave — maybe share a kind word with someone today.",
    spiritualOption: "A short jaap can anchor this joy deeper into your atma.",
    actionType: 'jaap_short',
    jaapDuration: 3,
  },
  overwhelmed: {
    acknowledgment: "Bahut zyada ho raha hai, I feel you \u{1fac2}",
    suggestion: "Let's breathe first. Just 3 deep breaths, nothing else right now.",
    spiritualOption: "After breathing, if you want, 2 minutes of navkar can help settle the mind.",
    actionType: 'breathe',
    jaapDuration: 2,
  },
  low_energy: {
    acknowledgment: "Low battery mode chal raha hai \u{1f634} That's okay.",
    suggestion: "Paani pee lo, 2-minute break le lo. Rest isn't laziness — it's recharging.",
    spiritualOption: "If you're up for it, a slow navkar jaap can gently restore energy.",
    actionType: 'rest',
    jaapDuration: 3,
  },
  anxious: {
    acknowledgment: "That knot in your chest? I see it. You're not alone \u{1f49b}",
    suggestion: "Let's ground first: feel your feet on the floor, take 5 slow breaths.",
    spiritualOption: "Navkar mantra is like a lullaby for an anxious mind. Try 108 taps when ready.",
    actionType: 'ground',
    jaapDuration: 5,
  },
};

export function getMoodResponse(mood: MoodState): MoodResponse {
  return RESPONSES[mood];
}

export const MOOD_META: Record<MoodState, { emoji: string; label: string; color: string }> = {
  calm: { emoji: '\u{1f60c}', label: 'Calm', color: '#4ade80' },
  happy: { emoji: '\u{1f60a}', label: 'Happy', color: '#facc15' },
  overwhelmed: { emoji: '\u{1f630}', label: 'Overwhelmed', color: '#f97316' },
  low_energy: { emoji: '\u{1f634}', label: 'Low Energy', color: '#a78bfa' },
  anxious: { emoji: '\u{1f61f}', label: 'Anxious', color: '#f43f5e' },
};
