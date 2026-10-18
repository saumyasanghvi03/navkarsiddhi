"use client";

import React, { useState, useEffect } from 'react';
import { useNav } from '../lib/navContext';
import NavBar from './NavBar';
import MoodCheckin from './MoodCheckin';
import BreathingExercise from './BreathingExercise';
import EmiTracker from './EmiTracker';
import { getTodayMood, getPriorityTask, savePriorityTask, getPunyaCount, getEmiEntries } from '@/lib/companion/storage';
import { MOOD_META } from '@/lib/companion/moodEngine';
import { getUpcomingWeek, getOverdue } from '@/lib/companion/emiCalculations';

type SubView = 'dashboard' | 'mood' | 'breathe' | 'emi';

export default function CompanionPage() {
  const { setPage } = useNav() as { page: string; setPage: (p: string) => void };
  const [subView, setSubView] = useState<SubView>('dashboard');
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [todayMoodEmoji, setTodayMoodEmoji] = useState<string>('');
  const [priority, setPriority] = useState('');
  const [editingPriority, setEditingPriority] = useState(false);
  const [punya, setPunya] = useState(0);
  const [emiAlert, setEmiAlert] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const mood = getTodayMood();
      if (mood) {
        setTodayMood(mood.mood);
        const meta = MOOD_META[mood.mood];
        if (meta) setTodayMoodEmoji(meta.emoji);
      }
      setPriority(getPriorityTask());
      setPunya(getPunyaCount());

      const entries = getEmiEntries();
      const overdueCount = getOverdue(entries).length;
      const upcomingCount = getUpcomingWeek(entries).length;
      if (overdueCount > 0) setEmiAlert(`${overdueCount} overdue`);
      else if (upcomingCount > 0) setEmiAlert(`${upcomingCount} due soon`);

      const name = localStorage.getItem('navkar_user_name') || '';
      setUserName(name);
    } catch { /* noop */ }
  }, [subView]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userName ? `, ${userName}` : '';
    if (hour < 12) return `Good morning${name}`;
    if (hour < 17) return `Good afternoon${name}`;
    if (hour < 21) return `Good evening${name}`;
    return `Late night${name}`;
  };

  const savePriority = () => {
    savePriorityTask(priority);
    setEditingPriority(false);
  };

  if (subView === 'mood') {
    return (
      <>
        <NavBar />
        <div className="pt-14">
          <button onClick={() => setSubView('dashboard')} className="px-4 pt-3 text-sm text-orange-600 hover:text-orange-800">
            &larr; Back
          </button>
          <MoodCheckin
            onStartBreathing={() => setSubView('breathe')}
            onStartJaap={() => setPage('jaap')}
            onDone={() => setSubView('dashboard')}
          />
        </div>
      </>
    );
  }

  if (subView === 'breathe') {
    return (
      <>
        <NavBar />
        <div className="pt-14">
          <BreathingExercise
            onClose={() => setSubView('dashboard')}
            onStartJaap={() => setPage('jaap')}
          />
        </div>
      </>
    );
  }

  if (subView === 'emi') {
    return (
      <>
        <NavBar />
        <div className="pt-14">
          <button onClick={() => setSubView('dashboard')} className="px-4 pt-3 text-sm text-orange-600 hover:text-orange-800">
            &larr; Back
          </button>
          <EmiTracker />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="pt-14 px-4 pb-8 max-w-md mx-auto space-y-4">
        {/* Greeting */}
        <div className="pt-2">
          <h1 className="text-xl font-semibold text-gray-800">{getGreeting()}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your companion for today</p>
        </div>

        {/* Mood */}
        {todayMood ? (
          <div className="bg-white rounded-2xl border border-orange-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today&apos;s mood</p>
                <p className="text-lg font-medium text-gray-800 mt-0.5">{todayMoodEmoji} {todayMood.replace('_', ' ')}</p>
              </div>
              <button onClick={() => setSubView('mood')} className="text-xs text-orange-500 hover:text-orange-700">Update</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setSubView('mood')}
            className="w-full bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-5 text-left">
            <p className="font-medium text-gray-800">How are you feeling today?</p>
            <p className="text-sm text-gray-500 mt-0.5">Optional check-in — no judgment</p>
          </button>
        )}

        {/* Priority task */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-2">Your ONE thing today</p>
          {editingPriority ? (
            <div className="flex gap-2">
              <input value={priority} onChange={e => setPriority(e.target.value)} placeholder="What matters most today?"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-orange-300 focus:outline-none"
                autoFocus onKeyDown={e => e.key === 'Enter' && savePriority()} />
              <button onClick={savePriority} className="px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium">Save</button>
            </div>
          ) : priority ? (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800">{priority}</p>
              <div className="flex gap-2">
                <button onClick={() => setEditingPriority(true)} className="text-xs text-gray-400 hover:text-gray-600">Edit</button>
                <button onClick={() => { setPriority(''); savePriorityTask(''); }} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditingPriority(true)} className="text-sm text-orange-500 hover:text-orange-700">
              + Set your priority
            </button>
          )}
        </div>

        {/* Punya */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Punya earned</p>
              <p className="text-2xl font-semibold text-orange-600 mt-0.5">{punya.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">1 mala = +108</p>
              <p className="text-xs text-gray-400">1 breathing = +10</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setPage('jaap')}
            className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:border-orange-200 transition-colors">
            <span className="text-2xl block mb-1">📿</span>
            <span className="text-xs font-medium text-gray-700">Start Jaap</span>
          </button>
          <button onClick={() => setSubView('breathe')}
            className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:border-orange-200 transition-colors">
            <span className="text-2xl block mb-1">🫁</span>
            <span className="text-xs font-medium text-gray-700">Breathe</span>
          </button>
          <button onClick={() => setSubView('emi')}
            className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:border-orange-200 transition-colors">
            <span className="text-2xl block mb-1">💰</span>
            <span className="text-xs font-medium text-gray-700">EMI Check</span>
          </button>
        </div>

        {/* EMI alert */}
        {emiAlert && (
          <button onClick={() => setSubView('emi')}
            className="w-full bg-amber-50 rounded-xl border border-amber-200 p-3 text-left">
            <p className="text-sm text-amber-800 font-medium">EMI: {emiAlert}</p>
            <p className="text-xs text-amber-600 mt-0.5">Tap to view details</p>
          </button>
        )}

        {/* Calm footer */}
        <p className="text-center text-xs text-gray-400 pt-2">
          No pressure. Everything here is optional.
        </p>
      </div>
    </>
  );
}
