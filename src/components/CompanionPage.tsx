'use client';

import React, { useState, useEffect } from 'react';
import { useNav } from '../lib/navContext';
import MoodCheckin from './MoodCheckin';
import BreathingExercise from './BreathingExercise';
import EmiTracker from './EmiTracker';

const DAILY_TASKS = [
  { emoji: '🙏', task: 'Do 1 extra mala for someone you\'re angry at' },
  { emoji: '🤐', task: 'Skip one complaint today — replace with navkar' },
  { emoji: '💬', task: 'Text someone "Jai Jinendra" you haven\'t spoken to' },
  { emoji: '🌅', task: 'Eat dinner before sunset — chauvihar lite' },
  { emoji: '🧘', task: 'Sit still for 2 minutes. Just breathe. Nothing else.' },
  { emoji: '💧', task: 'Drink water mindfully — each sip is a micro-prayer' },
  { emoji: '🚶', task: 'Walk 5 minutes without your phone. Just you and your atma.' },
  { emoji: '📵', task: 'No phone for 30 min after waking. Morning belongs to you.' },
  { emoji: '🙏', task: 'Forgive one person silently. Release that kashaya.' },
  { emoji: '📿', task: 'Do navkar during your commute — auto, metro, wherever.' },
  { emoji: '🍃', task: 'Notice one thing in nature today. Ground yourself.' },
  { emoji: '😶', task: 'Practice maun (silence) for 15 minutes today.' },
  { emoji: '💛', task: 'Send genuine gratitude to 1 person. No reason needed.' },
  { emoji: '🪷', task: 'Before bed, mentally bow to your own atma. You showed up.' },
];

const QUOTES = [
  '"The soul is the master of its own destiny." — Mahavir Bhagwan',
  '"Non-violence is the highest dharma." — Jain Agam',
  '"Every soul is independent. None depends on another." — Mahavir',
  '"Anger begets more anger, and forgiveness begets more forgiveness." — Mahavir',
  '"Have compassion for all beings — rich and poor alike." — Mahavir',
  '"Silence and self-control is non-violence." — Mahavir',
  '"Attachment and aversion are the root cause of karma." — Umaswati',
  '"Live and let live." — Mahavir Bhagwan',
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getMoodLabel(): string | null {
  const now = new Date();
  const dow = now.getDay();
  const hour = now.getHours();
  const dom = now.getDate();

  if (dow === 1 && hour < 12) return 'Monday grind mode 💪';
  if ((dow === 3 || dow === 4) && hour >= 14 && hour <= 18) return 'Midweek slump — you got this 🫂';
  if (dow === 5 && hour >= 17) return 'Friday vibes! Week done 🎉';
  if (dow === 0 && hour >= 20) return 'Sunday scaries? Navkar is your armour 🛡️';
  if (dom >= 25) return 'Month-end warrior mode 🛡️';
  if (dom <= 3) return 'Fresh start energy ✨';
  if (hour >= 23 || hour < 4) return 'Night owl mode 🦉';
  if (hour >= 12 && hour <= 14) return 'Lunch break micro-reset 🍱';
  if (hour >= 18 && hour <= 20 && dow >= 1 && dow <= 5) return 'Post-work decompression 🫁';
  if ((dow === 0 || dow === 6) && hour >= 7 && hour <= 11) return 'Weekend calm ☀️';
  return null;
}

export default function CompanionPage() {
  const { setPage } = useNav();
  const [name, setUserName] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const n = localStorage.getItem('navkar_user_name') || '';
      setUserName(n);
    } catch {}
  }, []);

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayTask = DAILY_TASKS[dayOfYear % DAILY_TASKS.length];
  const todayQuote = QUOTES[dayOfYear % QUOTES.length];
  const moodLabel = getMoodLabel();

  const handleNavigate = (page: string) => {
    if (page === 'breathe') {
      setExpanded('breathe');
    } else {
      setPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 pb-20">
      <div className="max-w-lg mx-auto px-4 pt-16 space-y-4">
        <div className="pt-2">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {getGreeting()}, {name || 'beautiful soul'} 🙏
          </h1>
          {moodLabel && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">{moodLabel}</p>
          )}
        </div>

        <MoodCheckin onNavigate={handleNavigate} />

        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Your One Thing Today</h3>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{todayTask.emoji}</span>
            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-relaxed">{todayTask.task}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setExpanded(expanded === 'breathe' ? null : 'breathe')} className="rounded-xl bg-blue-50 dark:bg-blue-900/30 p-4 text-center hover:shadow-md transition">
            <span className="text-2xl">🫁</span>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">Breathe</p>
          </button>
          <button onClick={() => setPage('jaap')} className="rounded-xl bg-orange-50 dark:bg-orange-900/30 p-4 text-center hover:shadow-md transition">
            <span className="text-2xl">📿</span>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">Navkar</p>
          </button>
          <button onClick={() => setExpanded(expanded === 'emi' ? null : 'emi')} className="rounded-xl bg-green-50 dark:bg-green-900/30 p-4 text-center hover:shadow-md transition">
            <span className="text-2xl">💰</span>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">EMI Calm</p>
          </button>
          <button onClick={() => setPage('progress')} className="rounded-xl bg-purple-50 dark:bg-purple-900/30 p-4 text-center hover:shadow-md transition">
            <span className="text-2xl">📊</span>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">My Stats</p>
          </button>
        </div>

        {expanded === 'breathe' && <BreathingExercise onNavigate={handleNavigate} />}
        {expanded === 'emi' && <EmiTracker />}

        <div className="text-center py-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 italic leading-relaxed">{todayQuote}</p>
        </div>
      </div>
    </div>
  );
}
