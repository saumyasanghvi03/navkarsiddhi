import { BoosterAction } from './types';

export type SoulMateMode =
  | 'listen_to_me'
  | 'help_me_think'
  | 'calm_me_down'
  | 'give_me_strength'
  | 'help_me_decide'
  | 'reflect_with_me'
  | 'help_me_rest';

export interface SoulMateMessage {
  text: string;
  isUser: boolean;
  timestamp: number;
}

export interface SoulMateStep {
  message: string;
  options: string[];
  responses: Record<string, string>;
  finalActions?: BoosterAction[];
}

export const SOULMATE_MODES: Record<SoulMateMode, { emoji: string; label: string; description: string }> = {
  listen_to_me: { emoji: '💬', label: 'Listen to Me', description: 'I just need to talk' },
  help_me_think: { emoji: '🧠', label: 'Help Me Think', description: 'Sort through my thoughts' },
  calm_me_down: { emoji: '🍃', label: 'Calm Me Down', description: 'I need peace right now' },
  give_me_strength: { emoji: '💪', label: 'Give Me Strength', description: 'I need courage' },
  help_me_decide: { emoji: '⚖️', label: 'Help Me Decide', description: 'I\'m stuck on a choice' },
  reflect_with_me: { emoji: '🪞', label: 'Reflect With Me', description: 'End-of-day reflection' },
  help_me_rest: { emoji: '🌙', label: 'Help Me Rest', description: 'Wind down for sleep' },
};

export function getSoulMateConversation(mode: SoulMateMode): SoulMateStep[] {
  const conversations: Record<SoulMateMode, SoulMateStep[]> = {
    listen_to_me: [
      {
        message: 'I\'m here. No advice, no fixing — just listening. What\'s on your mind?',
        options: ['I\'m stressed about something', 'I feel alone', 'Something happened today', 'I don\'t even know what\'s wrong'],
        responses: {
          'I\'m stressed about something': 'That weight you\'re carrying — it\'s real. You don\'t have to figure it all out right now. Just naming it already takes some of its power away.',
          'I feel alone': 'Loneliness can feel so heavy. But you reached out just now — that matters. You\'re not as alone as it feels in this moment.',
          'Something happened today': 'Whatever it was, the fact that it\'s still with you means it matters to you. That\'s not weakness — that\'s being human.',
          'I don\'t even know what\'s wrong': 'That\'s okay. Sometimes feelings arrive before explanations. You don\'t need a reason to feel what you feel.',
        },
      },
      {
        message: 'What would help right now?',
        options: ['Just hearing this helped', 'Play me some Bhakti music', 'Let me do a quiet Jaap', 'I want to breathe'],
        responses: {
          'Just hearing this helped': 'I\'m glad. Remember — you can come back anytime. No judgment, ever. \u{1F64F}',
          'Play me some Bhakti music': 'Music speaks when words can\'t. Let the Bhakti carry what you\'re feeling.',
          'Let me do a quiet Jaap': 'A quiet Navkar — just you and the mantra. No goals, no count. Just presence.',
          'I want to breathe': 'Let\'s breathe together. Slow, deep, no rush.',
        },
        finalActions: [
          { label: '\u{1F3B5} Bhakti Music', type: 'bhakti' },
          { label: '\u{1F4FF} Quiet Jaap', type: 'jaap', duration: 10 },
          { label: '\u{1FAC1} Breathe', type: 'breathe' },
          { label: 'I\'m good now', type: 'done' },
        ],
      },
    ],
    help_me_think: [
      {
        message: 'Let\'s untangle this together. What\'s the main thing you\'re trying to figure out?',
        options: ['A big life decision', 'A work/career thing', 'A relationship situation', 'Just feeling confused in general'],
        responses: {
          'A big life decision': 'Big decisions feel big because they matter. Let\'s break it down. What are you choosing between?',
          'A work/career thing': 'Work decisions hit different because they affect so much of your day. What\'s the core tension?',
          'A relationship situation': 'Relationships are complex because people are complex. What\'s the feeling you can\'t shake?',
          'Just feeling confused in general': 'Confusion is your mind processing too many inputs at once. Let\'s narrow it down to one thing.',
        },
      },
      {
        message: 'Here\'s a Jain thinking framework: What would the wisest version of you — the one with Samyak Darshan (right perception) — do?',
        options: ['They\'d choose what\'s kind', 'They\'d choose what\'s honest', 'They\'d wait and observe', 'I don\'t know yet'],
        responses: {
          'They\'d choose what\'s kind': 'Ahimsa in decision-making. When in doubt, kindness is rarely wrong. Trust that instinct.',
          'They\'d choose what\'s honest': 'Satya — truth is your compass. Even when it\'s harder, the honest path builds less karma.',
          'They\'d wait and observe': 'Patience is underrated wisdom. Not every decision needs to be made today.',
          'I don\'t know yet': 'And that\'s a perfectly valid answer. Clarity comes when it\'s ready. Don\'t force it.',
        },
        finalActions: [
          { label: '\u{1F4FF} Think with Jaap', type: 'jaap', duration: 5 },
          { label: '\u{1FAC1} Clear my head', type: 'breathe' },
          { label: 'That helped', type: 'done' },
        ],
      },
    ],
    calm_me_down: [
      {
        message: 'I can feel you need calm. Before anything else — take one slow breath with me. In... and out. How are you right now?',
        options: ['My mind won\'t stop racing', 'I feel panicky', 'Just generally tense', 'I\'m angry at something'],
        responses: {
          'My mind won\'t stop racing': 'Racing thoughts are like clouds in a storm — they\'ll pass. Let\'s anchor you to right now. Feel your feet on the ground.',
          'I feel panicky': 'You\'re safe. This feeling is temporary. Focus on one thing you can see, one you can hear, one you can touch.',
          'Just generally tense': 'Tension is stored energy. Let\'s release it gently — your body wants to let go.',
          'I\'m angry at something': 'Krodh (anger) is one of the four kashayas. Acknowledging it is the first step to releasing it.',
        },
      },
      {
        message: 'Let\'s do something that helps right now.',
        options: ['Guide me through breathing', 'I want grounding (5-4-3-2-1)', 'A Navkar to center me', 'I just need silence'],
        responses: {
          'Guide me through breathing': 'Let\'s do 4-7-8 breathing. It activates your parasympathetic nervous system — your body\'s built-in calm button.',
          'I want grounding (5-4-3-2-1)': '5 things you see. 4 you can touch. 3 you hear. 2 you smell. 1 you taste. You\'re here. You\'re present. You\'re okay.',
          'A Navkar to center me': 'One Navkar, whispered or silent. Let each line be a breath. Namo Arihantanam...',
          'I just need silence': 'Silence is sacred. Take all the time you need. I\'ll be here when you\'re ready. \u{1F64F}',
        },
        finalActions: [
          { label: '\u{1FAC1} 4-7-8 Breathing', type: 'breathe' },
          { label: '\u{1F4FF} Centering Navkar', type: 'jaap', duration: 3 },
          { label: 'I feel calmer', type: 'done' },
        ],
      },
    ],
    give_me_strength: [
      {
        message: 'Strength isn\'t about not feeling weak. It\'s about showing up anyway. What do you need strength for?',
        options: ['A tough conversation', 'Getting through a hard time', 'Starting something I\'m scared of', 'Just getting through today'],
        responses: {
          'A tough conversation': 'Speak with Satya (truth) and Ahimsa (non-harm). When your words come from both, you cannot go wrong.',
          'Getting through a hard time': 'Mahavir endured 12.5 years of hardship in silence. You don\'t have to be silent — but know that endurance is in your spiritual DNA.',
          'Starting something I\'m scared of': 'Fear means you care about the outcome. Channel that caring into action. The first step is always the hardest — and the most powerful.',
          'Just getting through today': 'One day. That\'s all you need to get through. And you\'ve already gotten through every hard day before this one.',
        },
      },
      {
        message: '"Parasparopagraho Jivanam" — All life is interconnected. Your strength helps others too.',
        options: ['That resonates', 'I need something to DO', 'Read me something inspiring'],
        responses: {
          'That resonates': 'Hold onto that feeling. You\'re stronger than the moment. \u{1F64F}',
          'I need something to DO': 'Action dissolves fear. Start with your body — breathe deeply, stand tall, then take one small step.',
          'Read me something inspiring': '"The soul is the architect of its own fortune and the destroyer of its own misery." — Jain Wisdom. You are building, even when it doesn\'t feel like it.',
        },
        finalActions: [
          { label: '\u{1F4FF} Strength Jaap', type: 'jaap', duration: 5 },
          { label: '\u{1FAC1} Power Breathing', type: 'breathe' },
          { label: 'I feel stronger', type: 'done' },
        ],
      },
    ],
    help_me_decide: [
      {
        message: 'Decisions are hard because both options have something real to offer. What kind of decision is this?',
        options: ['Should I or shouldn\'t I', 'Choosing between two paths', 'Whether to let go of something', 'A financial decision'],
        responses: {
          'Should I or shouldn\'t I': 'Here\'s a test: imagine you\'ve already done it. How does future-you feel? Relief or regret?',
          'Choosing between two paths': 'Both paths have karma. Ask: which path has less himsa (harm) — to yourself and others?',
          'Whether to let go of something': 'Aparigraha teaches us that letting go isn\'t losing — it\'s making space. What would that space hold?',
          'A financial decision': 'Money decisions work best when separated from emotion. Sleep on it. If the answer is still the same tomorrow, trust it.',
        },
      },
      {
        message: 'The Jain decision filter: Does this choice move me toward less attachment, more truth, more compassion?',
        options: ['Yes, I think so', 'I\'m not sure', 'I need more time'],
        responses: {
          'Yes, I think so': 'Then trust yourself. The fact that you\'re thinking this carefully means you\'re already making a good choice.',
          'I\'m not sure': 'Uncertainty is okay. Give yourself permission to not decide today. Clarity has its own timeline.',
          'I need more time': 'Take it. A decision made in peace is worth more than one made in haste.',
        },
        finalActions: [
          { label: '\u{1F4FF} Clarity Jaap', type: 'jaap', duration: 5 },
          { label: '\u{1FAC1} Clear thinking', type: 'breathe' },
          { label: 'I know what to do', type: 'done' },
        ],
      },
    ],
    reflect_with_me: [
      {
        message: 'Let\'s look back on today with kindness. How would you describe your day in one word?',
        options: ['Productive', 'Challenging', 'Peaceful', 'Draining'],
        responses: {
          'Productive': 'Productive days build momentum. But remember — your worth isn\'t measured by output. You matter even on slow days.',
          'Challenging': 'Challenges are karma playing out. You met today\'s challenges — that\'s what counts.',
          'Peaceful': 'A peaceful day is a gift. Savor it. These are the days that recharge your soul.',
          'Draining': 'Draining days are temporary. Tomorrow is a fresh page in your karma notebook.',
        },
      },
      {
        message: 'Pratikraman moment: Is there anything you\'d do differently? No guilt — just awareness.',
        options: ['I could\'ve been kinder', 'I should\'ve spoken up', 'I was too hard on myself', 'Today was good as it was'],
        responses: {
          'I could\'ve been kinder': 'Noticing that is itself an act of kindness. Tomorrow, you\'ll remember this moment — and you\'ll be gentler.',
          'I should\'ve spoken up': 'Satya (truth) sometimes needs courage. Next time, speak with both truth and compassion.',
          'I was too hard on myself': 'Ahimsa starts with yourself. You deserve the same gentleness you give others.',
          'Today was good as it was': 'Beautiful. Gratitude is the highest form of punya. \u{1F64F}',
        },
        finalActions: [
          { label: '\u{1F4FF} Gratitude Navkar', type: 'jaap', duration: 5 },
          { label: '\u{1F319} Wind down', type: 'breathe' },
          { label: 'Good night', type: 'done' },
        ],
      },
    ],
    help_me_rest: [
      {
        message: 'The day is over. Let\'s let it go, one layer at a time. How\'s your body feeling right now?',
        options: ['Tense and tired', 'Wired, can\'t relax', 'Physically okay but mind is busy', 'Already relaxed, just want to wind down'],
        responses: {
          'Tense and tired': 'Your body held a lot today. Starting from your toes, imagine each muscle softening, releasing, melting into rest.',
          'Wired, can\'t relax': 'That wired feeling is adrenaline still circulating. Slow breathing is the off switch. Let\'s use it.',
          'Physically okay but mind is busy': 'The mind replays the day like a movie. Acknowledge each thought, then let it drift away like a cloud.',
          'Already relaxed, just want to wind down': 'Perfect. Let\'s add one peaceful layer — a few breaths and a whispered Navkar.',
        },
      },
      {
        message: 'Close your eyes if you can. Take three slow breaths. Each exhale releases something you don\'t need to carry into sleep.',
        options: ['Guide me to sleep', 'A bedtime Navkar', 'Play calming Bhakti', 'I\'m ready to sleep'],
        responses: {
          'Guide me to sleep': 'Feel your body getting heavier. Each breath takes you deeper into rest. The Tirthankaras watch over your sleep. You are safe.',
          'A bedtime Navkar': 'Whisper it: Namo Arihantanam... Namo Siddhanam... Let each line carry you closer to sleep.',
          'Play calming Bhakti': 'Let the devotion wash over you. No need to focus — just let it play.',
          'I\'m ready to sleep': 'Sweet dreams. May your sleep be karma-free and your morning be bright. \u{1F319}',
        },
        finalActions: [
          { label: '\u{1FAC1} Sleep Breathing', type: 'breathe' },
          { label: '\u{1F4FF} Whispered Navkar', type: 'jaap', duration: 3 },
          { label: '\u{1F3B5} Bhakti Lullaby', type: 'bhakti' },
          { label: 'Goodnight \u{1F319}', type: 'done' },
        ],
      },
    ],
  };
  return conversations[mode];
}
