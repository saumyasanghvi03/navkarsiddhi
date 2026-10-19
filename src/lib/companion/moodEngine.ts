import { MoodState, MoodResponse, BoosterCategory, BoosterResponse } from './types';

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
    spiritualOption: "A short jaap can anchor this joy even deeper.",
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

export const BOOSTER_META: Record<BoosterCategory, { emoji: string; label: string; color: string; description: string }> = {
  calm_mind: { emoji: '\u{1f9d8}', label: 'Calm My Mind', color: '#6366f1', description: 'Breathing, grounding, stillness' },
  navkar_jaap: { emoji: '\u{1f4ff}', label: 'Navkar Jaap', color: '#ea580c', description: 'Start or continue your jaap' },
  lift_mood: { emoji: '\u{1f308}', label: 'Lift My Mood', color: '#f59e0b', description: 'Gratitude, joy, perspective' },
  restore_energy: { emoji: '\u{26a1}', label: 'Restore Energy', color: '#10b981', description: 'Quick recharge for body & mind' },
  work_pressure: { emoji: '\u{1f4bc}', label: 'Work Pressure', color: '#3b82f6', description: 'Reset when work overwhelms' },
  financial_worry: { emoji: '\u{1fab7}', label: 'Money Worries', color: '#8b5cf6', description: 'Perspective on financial stress' },
  need_listener: { emoji: '\u{1f4ac}', label: 'Listen to Me', color: '#ec4899', description: 'Express yourself, be heard' },
  before_sleep: { emoji: '\u{1f319}', label: 'Before Sleep', color: '#6366f1', description: 'Wind down peacefully' },
};

const BOOSTER_RESPONSES: Record<BoosterCategory, BoosterResponse> = {
  calm_mind: {
    title: "Let's find some stillness",
    message: "Your mind is busy \u{2014} that's okay. Let's slow things down with a few deep breaths. Bow to the calm that already lives within you. You can reach it.",
    spiritualNote: 'Stopping the inflow of stress begins with calming the mind. One breath at a time.',
    actions: [
      { label: '\u{1fac1} 4-7-8 Breathing', type: 'breathe' },
      { label: '\u{1f4ff} Short Jaap (5 min)', type: 'jaap', duration: 5 },
      { label: "I'm okay now", type: 'done' },
    ],
  },
  navkar_jaap: {
    title: 'Ready for your Navkar',
    message: "Whether it's one Navkar or a full mala \u{2014} every recitation plants a seed of goodness. No minimum, no pressure.",
    spiritualNote: 'Each Navkar is a bow to the five supreme beings. The act itself is the reward.',
    actions: [
      { label: '\u{1f4ff} Start Jaap', type: 'jaap' },
      { label: '\u{1fac1} Breathe First', type: 'breathe' },
      { label: 'Not now', type: 'done' },
    ],
  },
  lift_mood: {
    title: "Let's shift this energy",
    message: "Low moments pass. Here's what helps: move your body for 2 minutes, think of one thing that went right today, or listen to something that lifts you. Music has that power.",
    spiritualNote: 'Shedding heaviness happens through positive action, not waiting. Every small step counts.',
    actions: [
      { label: '\u{1f3b5} Uplifting Music', type: 'bhakti' },
      { label: '\u{1f4ff} Quick Jaap', type: 'jaap', duration: 3 },
      { label: "I'll try that", type: 'done' },
    ],
  },
  restore_energy: {
    title: 'Recharge time',
    message: "Your energy matters. Try this: close your eyes for 60 seconds and just breathe. Or do a short Navkar \u{2014} the rhythm itself is restorative. Your body knows what it needs.",
    spiritualNote: "Your natural state is full of energy. Tiredness is temporary — rest is how you return to yourself.",
    actions: [
      { label: '\u{1fac1} Quick Breathe', type: 'breathe' },
      { label: '\u{1f4ff} Energizing Jaap', type: 'jaap', duration: 5 },
      { label: 'Just resting', type: 'done' },
    ],
  },
  work_pressure: {
    title: 'Work can wait a moment',
    message: "Step back for 2 minutes. The deadline, the boss, the inbox \u{2014} they'll all still be there. But you'll handle them better after a reset. Breathe, then return sharper.",
    spiritualNote: 'Non-attachment to outcomes frees the mind to perform at its best. Do your best, then release.',
    actions: [
      { label: '\u{1fac1} 2-Min Reset', type: 'breathe' },
      { label: '\u{1f4ff} 3 Navkars', type: 'jaap', duration: 2 },
      { label: 'Back to it', type: 'done' },
    ],
  },
  financial_worry: {
    title: 'Money stress is real',
    message: "Financial worry sits heavy. But you're already taking a step by tracking things. Check your EMIs, breathe through the anxiety, and remember \u{2014} managing money mindfully is itself a practice in growth.",
    spiritualNote: "It's not about having nothing \u{2014} it's about not letting possessions own your peace of mind.",
    actions: [
      { label: '\u{1f4b0} Check EMIs', type: 'emi' },
      { label: '\u{1fac1} Calm Breathing', type: 'breathe' },
      { label: 'I feel better', type: 'done' },
    ],
  },
  need_listener: {
    title: "I'm here",
    message: "Sometimes you just need to feel heard. You don't have to solve anything right now. If words feel hard, let music speak \u{2014} songs carry the feelings we can't always name. Or just sit with this moment.",
    spiritualNote: 'Forgiveness starts with forgiving yourself for feeling this way. Be gentle.',
    actions: [
      { label: '\u{1f3b5} Calming Music', type: 'bhakti' },
      { label: '\u{1f4ff} Quiet Jaap', type: 'jaap', duration: 10 },
      { label: 'Just needed this', type: 'done' },
    ],
  },
  before_sleep: {
    title: 'Winding down',
    message: "The day is done. Whatever happened \u{2014} good, bad, stressful \u{2014} let it go. A few slow breaths and a bedtime Navkar can close the day with peace.",
    spiritualNote: 'Reflect before sleep \u{2014} release what happened, and rest with a clear conscience.',
    actions: [
      { label: '\u{1fac1} Sleep Breathing', type: 'breathe' },
      { label: '\u{1f4ff} Bedtime Navkar', type: 'jaap', duration: 5 },
      { label: 'Goodnight \u{1f319}', type: 'done' },
    ],
  },
};

export function getBoosterResponse(category: BoosterCategory): BoosterResponse {
  return BOOSTER_RESPONSES[category];
}
