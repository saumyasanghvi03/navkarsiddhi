"use client";

import React, { useState, useEffect } from 'react';
import { MoodState } from '@/lib/companion/types';
import { getMoodResponse, MOOD_META } from '@/lib/companion/moodEngine';
import { addMoodEntry, getTodayMood } from '@/lib/companion/storage';

interface MoodCheckinProps {
  onStartBreathing?: () => void;
  onStartJaap?: () => void;
  onDone?: () => void;
}

const MOOD_ORDER: MoodState[] = ['calm', 'happy', 'overwhelmed', 'low_energy', 'anxious'];

export default function MoodCheckin({ onStartBreathing, onStartJaap, onDone }: MoodCheckinProps) {
  const [selected, setSelected] = useState<MoodState | null>(null);
  const [todayMood, setTodayMood] = useState<MoodState | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    try {
      const existing = getTodayMood();
      if (existing) setTodayMood(existing.mood);
    } catch { /* noop */ }
  }, []);

  const handleSelect = (mood: MoodState) => {
    setSelected(mood);
    setShowResponse(true);
    const today = new Date().toISOString().slice(0, 10);
    addMoodEntry({ date: today, mood, timestamp: Date.now() });
    setTodayMood(mood);
  };

  const handleAction = (action: string) => {
    if (action === 'breathe' && onStartBreathing) onStartBreathing();
    else if (action === 'jaap' && onStartJaap) onStartJaap();
    else if (action === 'done' && onDone) onDone();
  };

  if (showResponse && selected) {
    const response = getMoodResponse(selected);
    const meta = MOOD_META[selected];
    return (
      <div className="px-4 py-6 max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-4">
          <div className="text-center">
            <span className="text-4xl">{meta.emoji}</span>
            <h3 className="text-lg font-semibold text-gray-800 mt-2">{meta.label}</h3>
          </div>
          <p className="text-gray-700 text-center leading-relaxed">{response.acknowledgment}</p>
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-sm text-orange-900 font-medium">{response.suggestion}</p>
          </div>
          {response.spiritualOption && (
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm text-amber-800">{response.spiritualOption}</p>
            </div>
          )}
          <div className="flex flex-col gap-2 pt-2">
            {(response.actionType === 'breathe' || response.actionType === 'ground') && (
              <button onClick={() => handleAction('breathe')}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
                Let's Breathe
              </button>
            )}
            {(response.actionType === 'jaap_short' || response.actionType === 'jaap_mala') && (
              <button onClick={() => handleAction('jaap')}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
                Start Jaap {response.jaapDuration ? `(${response.jaapDuration} min)` : ''}
              </button>
            )}
            <button onClick={() => handleAction('done')}
              className="w-full py-2.5 text-gray-500 text-sm hover:text-gray-700 transition-colors">
              Skip — I'm just checking in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="text-center mb-5">
        <h2 className="text-lg font-semibold text-gray-800">
          {todayMood ? 'Update your mood?' : 'How are you feeling?'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">No judgment. Just checking in</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MOOD_ORDER.map((mood) => {
          const meta = MOOD_META[mood];
          const isToday = todayMood === mood;
          return (
            <button key={mood} onClick={() => handleSelect(mood)}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all
                ${isToday ? 'border-orange-400 bg-orange-50 shadow-sm' : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/50'}`}>
              <span className="text-3xl">{meta.emoji}</span>
              <span className="text-xs font-medium text-gray-700">{meta.label}</span>
            </button>
          );
        })}
      </div>
      {onDone && (
        <button onClick={onDone} className="w-full mt-4 py-2.5 text-gray-400 text-sm hover:text-gray-600 transition-colors">
          Not now
        </button>
      )}
    </div>
  );
}
