'use client';

import React, { useState, useEffect } from 'react';

const MOODS = [
  { emoji: '😌', label: 'Peaceful', response: 'That stillness? That\'s your atma talking. Keep listening.', action: null },
  { emoji: '😊', label: 'Good', response: 'Beautiful energy today! Channel it into a mala — compound that punya.', action: { label: 'Start Navkar', page: 'jaap' } },
  { emoji: '😐', label: 'Meh', response: 'Meh days are just unfinished good days. 2 min navkar flips it.', action: { label: '2-Min Reset', page: 'jaap' } },
  { emoji: '😔', label: 'Low', response: 'Low energy? A navkar is chai for the atma. Warm you up from inside.', action: { label: 'Gentle Navkar', page: 'jaap' } },
  { emoji: '😤', label: 'Stressed', response: 'Kashaya is loud today. Breathe first, then 108 taps to quiet it.', action: { label: '🫁 Breathe', page: 'breathe' } },
] as const;

interface MoodCheckinProps {
  onNavigate?: (page: string) => void;
}

export default function MoodCheckin({ onNavigate }: MoodCheckinProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [lastCheckin, setLastCheckin] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('navkar_mood_last');
      if (stored) {
        const { timestamp } = JSON.parse(stored);
        const mins = Math.floor((Date.now() - timestamp) / 60000);
        if (mins < 60) setLastCheckin(`${mins}m ago`);
        else if (mins < 1440) setLastCheckin(`${Math.floor(mins / 60)}h ago`);
        else setLastCheckin(`${Math.floor(mins / 1440)}d ago`);
      }
    } catch {}
  }, []);

  const handleSelect = (idx: number) => {
    setSelected(idx);
    try {
      localStorage.setItem('navkar_mood_last', JSON.stringify({
        mood: MOODS[idx].label,
        timestamp: Date.now(),
      }));
    } catch {}
  };

  const mood = selected !== null ? MOODS[selected] : null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">How are you feeling?</h3>
        {lastCheckin && <span className="text-xs text-gray-400">Last: {lastCheckin}</span>}
      </div>

      <div className="flex justify-between gap-2 mb-3">
        {MOODS.map((m, i) => (
          <button
            key={m.label}
            onClick={() => handleSelect(i)}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all flex-1 ${
              selected === i
                ? 'bg-orange-200 dark:bg-orange-900 scale-105 shadow-md'
                : 'hover:bg-orange-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">{m.label}</span>
          </button>
        ))}
      </div>

      {mood && (
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-3 animate-in fade-in">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{mood.response}</p>
          {mood.action && onNavigate && (
            <button
              onClick={() => onNavigate(mood.action!.page)}
              className="text-xs font-medium text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50 px-3 py-1.5 rounded-full"
            >
              {mood.action.label} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
