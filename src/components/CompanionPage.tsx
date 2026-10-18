"use client";

import React, { useState, useEffect } from 'react';
import { useNav } from '../lib/navContext';
import NavBar from './NavBar';
import MoodCheckin from './MoodCheckin';
import BreathingExercise from './BreathingExercise';
import EmiTracker from './EmiTracker';
import { getTodayMood, getPriorityTask, savePriorityTask, getPunyaCount, getEmiEntries, getEmiOptedIn, setEmiOptedIn } from '@/lib/companion/storage';
import { MOOD_META, BOOSTER_META, getBoosterResponse } from '@/lib/companion/moodEngine';
import { getUpcomingWeek, getOverdue } from '@/lib/companion/emiCalculations';
import { BoosterCategory } from '@/lib/companion/types';
import SoulMate from './SoulMate';
import { SoulMateMode, SOULMATE_MODES } from '@/lib/companion/soulMate';

const BOOSTER_ORDER: BoosterCategory[] = [
  'calm_mind', 'navkar_jaap', 'lift_mood', 'restore_energy',
  'work_pressure', 'financial_worry', 'need_listener', 'before_sleep',
];

type SubView = 'dashboard' | 'mood' | 'breathe' | 'emi' | 'booster' | 'soulmate';

export default function CompanionPage() {
  const { setPage, setPendingAction } = useNav() as { page: string; setPage: (p: string) => void; setPendingAction: (a: string | null) => void };
  const [subView, setSubView] = useState<SubView>('dashboard');
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [todayMoodEmoji, setTodayMoodEmoji] = useState<string>('');
  const [priority, setPriority] = useState('');
  const [editingPriority, setEditingPriority] = useState(false);
  const [punya, setPunya] = useState(0);
  const [emiAlert, setEmiAlert] = useState('');
  const [userName, setUserName] = useState('');
  const [activeBooster, setActiveBooster] = useState<BoosterCategory | null>(null);
  const [soulMateMode, setSoulMateMode] = useState<SoulMateMode | null>(null);
  const [emiOptedIn, setEmiOptedInState] = useState<boolean | null>(null);
  const [showEmiPrompt, setShowEmiPrompt] = useState(false);

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

      const emiOpt = getEmiOptedIn();
      setEmiOptedInState(emiOpt);
      if (emiOpt === true) {
        const entries = getEmiEntries();
        const overdueCount = getOverdue(entries).length;
        const upcomingCount = getUpcomingWeek(entries).length;
        if (overdueCount > 0) setEmiAlert(`${overdueCount} overdue`);
        else if (upcomingCount > 0) setEmiAlert(`${upcomingCount} due soon`);
      }

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

  const handleBoosterAction = (type: string) => {
    switch (type) {
      case 'breathe': setSubView('breathe'); break;
      case 'jaap': setPage('jaap'); break;
      case 'emi':
        if (emiOptedIn === null) { setShowEmiPrompt(true); }
        else if (emiOptedIn) { setSubView('emi'); }
        break;
      case 'bhakti': setPendingAction('bhakti'); setPage('jaap'); break;
      case 'done': setActiveBooster(null); setSubView('dashboard'); break;
    }
  };

  const handleEmiOptIn = (opted: boolean) => {
    setEmiOptedIn(opted);
    setEmiOptedInState(opted);
    setShowEmiPrompt(false);
    if (opted) setSubView('emi');
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

  if (subView === 'booster' && activeBooster) {
    const response = getBoosterResponse(activeBooster);
    const meta = BOOSTER_META[activeBooster];
    return (
      <>
        <NavBar />
        <div className="pt-14 px-4 pb-8 max-w-md mx-auto">
          <button onClick={() => { setActiveBooster(null); setSubView('dashboard'); }} className="pt-3 text-sm text-orange-600 hover:text-orange-800">
            &larr; Back
          </button>
          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-4">
            <div className="text-center">
              <span className="text-4xl">{meta.emoji}</span>
              <h3 className="text-lg font-semibold text-gray-800 mt-2">{response.title}</h3>
            </div>
            <p className="text-gray-700 text-center leading-relaxed">{response.message}</p>
            {response.spiritualNote && (
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm text-amber-800">{response.spiritualNote}</p>
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2">
              {response.actions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleBoosterAction(action.type)}
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    action.type === 'done'
                      ? 'text-gray-500 text-sm hover:text-gray-700'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={action.type !== 'done' ? { backgroundColor: meta.color } : undefined}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (subView === 'soulmate' && soulMateMode) {
    return (
      <>
        <NavBar />
        <div className="pt-14">
          <SoulMate
            mode={soulMateMode}
            onAction={(type, duration) => handleBoosterAction(type)}
            onBack={() => { setSoulMateMode(null); setSubView('dashboard'); }}
          />
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

        {/* Mood check-in (compact) */}
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
            className="w-full bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-4 text-left">
            <p className="font-medium text-gray-800">How are you feeling today?</p>
            <p className="text-sm text-gray-500 mt-0.5">Optional check-in — no judgment</p>
          </button>
        )}

        {/* Mood Boosters grid */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">What do you need right now?</p>
          <div className="grid grid-cols-2 gap-2.5">
            {BOOSTER_ORDER.filter(cat => cat !== 'financial_worry' || emiOptedIn !== false).map((cat) => {
              const meta = BOOSTER_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => {
                    if (cat === 'financial_worry' && emiOptedIn === null) {
                      setShowEmiPrompt(true);
                      return;
                    }
                    setActiveBooster(cat); setSubView('booster');
                  }}
                  className="bg-white rounded-2xl border border-gray-100 p-3.5 text-left hover:border-orange-200 transition-colors"
                >
                  <span className="text-2xl block mb-1">{meta.emoji}</span>
                  <span className="text-xs font-medium text-gray-700 block">{meta.label}</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">{meta.description}</span>
                </button>
              );
            })}
          </div>
        </div>

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

        {/* Soul Mate */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-4">
          <p className="text-sm font-medium text-gray-700 mb-1">💬 Soul Mate</p>
          <p className="text-xs text-gray-500 mb-3">Talk through anything — no judgment, just support</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(Object.entries(SOULMATE_MODES) as [SoulMateMode, { emoji: string; label: string; description: string }][]).map(([mode, meta]) => (
              <button
                key={mode}
                onClick={() => { setSoulMateMode(mode); setSubView('soulmate'); }}
                className="flex-shrink-0 bg-white/80 rounded-xl px-3 py-2.5 text-center hover:bg-white transition-colors min-w-[80px]"
              >
                <span className="text-xl block">{meta.emoji}</span>
                <span className="text-[10px] text-gray-600 block mt-1 whitespace-nowrap">{meta.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* EMI opt-in prompt */}
        {showEmiPrompt && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <p className="text-sm font-medium text-gray-800">Do you have any EMIs or loans to track?</p>
            <p className="text-xs text-gray-500">If not, we&apos;ll keep things simple and skip this section entirely.</p>
            <div className="flex gap-2">
              <button onClick={() => handleEmiOptIn(true)}
                className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600">
                Yes, I have EMIs
              </button>
              <button onClick={() => handleEmiOptIn(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200">
                No loans
              </button>
            </div>
          </div>
        )}

        {/* EMI alert */}
        {emiOptedIn === true && emiAlert && (
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
