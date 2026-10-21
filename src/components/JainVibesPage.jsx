"use client";

import React, { useState, useEffect } from 'react';
import { useNav } from '../lib/navContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { computeStreak, computeAllTimeStats, computeTapProgress, getTimeOfDayCategory } from '../lib/tapStorage';
import { getTodayDate } from '../lib/navkarPersistence';
import { apiUrl } from '../lib/apiBase';
import { pageTopPaddingClass, isNativeShell } from '../lib/nativeWidgetBridge';
import { getSchedNotifPref, setSchedNotifPref, syncScheduledNotifications, previewNotifications } from '../lib/smartNotifications';
import { getUsagePattern } from '../lib/usageTracker';
import { enableNavkarReminders, disableNavkarReminders, getNavkarReminderPref, isNavkarReminderSupported } from '../lib/pushNotifications';

// Reads the user's own local practice stats (never sent anywhere) to tailor
// the vibe check to where they actually are today, instead of a generic line.
const readPersonalStats = () => {
  if (typeof window === 'undefined') return null;
  try {
    const history = JSON.parse(localStorage.getItem('navkar_history') || '[]');
    const today = getTodayDate();
    const todayEntry = Array.isArray(history) ? history.find(h => h.date === today) : null;
    return {
      streak: computeStreak(history),
      todayNavkars: todayEntry ? todayEntry.navkars : 0,
      allTime: computeAllTimeStats(history),
      tapProgress: computeTapProgress(),
      timeOfDay: getTimeOfDayCategory(new Date()),
    };
  } catch (_) {
    return null;
  }
};

const TIME_GREETING = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
  night: 'Late night dedication',
};

// One tailored opening line, picked by what's most relevant to the user right now.
const buildPersonalIntro = (stats) => {
  if (!stats) return null;
  const greeting = TIME_GREETING[stats.timeOfDay] || 'Hey';
  const { tapProgress, streak, todayNavkars, allTime } = stats;

  if (tapProgress && tapProgress.tap) {
    const label = tapProgress.tap.totalDays > 0
      ? `Day ${tapProgress.dayNumber} of ${tapProgress.totalDays} on your ${tapProgress.tap.name} (${tapProgress.percentage}% there)`
      : `${tapProgress.completedDays} day${tapProgress.completedDays === 1 ? '' : 's'} into your ${tapProgress.tap.name}`;
    return `${greeting} — ${label}.`;
  }
  if (streak >= 7) {
    return `${greeting} — ${streak}-day streak going strong.`;
  }
  if (streak >= 1) {
    return `${greeting} — Day ${streak} of your streak, keep it alive.`;
  }
  if (todayNavkars > 0) {
    return `${greeting} — ${todayNavkars} Navkars in already today.`;
  }
  if (allTime.totalMalas > 0) {
    return `${greeting} — ${allTime.totalMalas} malas completed on your journey so far.`;
  }
  return `${greeting} — every Sadhana journey starts with a single Navkar.`;
};

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);


const JainVibesPage = () => {
  const { setPage } = useNav();
  const isOnline = useOnlineStatus();
  const [topPadding] = useState(() => pageTopPaddingClass());
  const [isNative] = useState(() => isNativeShell());

  const [vibe, setVibe] = useState('');
  const [vibeIntro, setVibeIntro] = useState('');
  const [vibeLoading, setVibeLoading] = useState(false);
  const [vibeError, setVibeError] = useState('');

  // Daily reminders state
  const [schedEnabled, setSchedEnabled] = useState(() => getSchedNotifPref());
  const [notifPreviews, setNotifPreviews] = useState(null);
  const [usagePattern, setUsagePattern] = useState(null);
  // Web push state (non-APK)
  const [webPushEnabled, setWebPushEnabled] = useState(() => getNavkarReminderPref());
  const [webPushSupported, setWebPushSupported] = useState(false);
  const [webPushLoading, setWebPushLoading] = useState(false);
  const [webPushError, setWebPushError] = useState('');

  // Load notification previews on mount
  useEffect(() => {
    const stats = readPersonalStats();
    if (!stats) return;
    const data = {
      todayNavkars: stats.todayNavkars,
      malas: Math.floor(stats.todayNavkars / 108),
      streak: stats.streak,
      totalNavkars: stats.allTime?.totalNavkars || 0,
    };
    setNotifPreviews(previewNotifications(data));
    setUsagePattern(getUsagePattern());
    isNavkarReminderSupported().then(setWebPushSupported);
  }, []);

  const toggleWebPush = async () => {
    setWebPushLoading(true);
    setWebPushError('');
    if (webPushEnabled) {
      await disableNavkarReminders();
      setWebPushEnabled(false);
    } else {
      const result = await enableNavkarReminders();
      if (result.ok) {
        setWebPushEnabled(true);
      } else {
        setWebPushError(result.error || 'Could not enable reminders.');
      }
    }
    setWebPushLoading(false);
  };

  const toggleSchedNotif = async () => {
    const next = !schedEnabled;
    setSchedEnabled(next);
    setSchedNotifPref(next);
    const stats = readPersonalStats();
    if (stats) {
      await syncScheduledNotifications({
        todayNavkars: stats.todayNavkars,
        malas: Math.floor(stats.todayNavkars / 108),
        streak: stats.streak,
        totalNavkars: stats.allTime?.totalNavkars || 0,
      }, next);
    }
    // Refresh previews
    if (stats) {
      setNotifPreviews(previewNotifications({
        todayNavkars: stats.todayNavkars,
        malas: Math.floor(stats.todayNavkars / 108),
        streak: stats.streak,
      }));
    }
    setUsagePattern(getUsagePattern());
  };

  const fetchVibe = async () => {
    setVibeLoading(true);
    setVibeError('');
    const intro = buildPersonalIntro(readPersonalStats());
    try {
      const res = await fetch(apiUrl('/api/ai/vibe'), { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVibeIntro(intro);
      setVibe(data.vibe);
    } catch (err) {
      setVibeError(err instanceof Error ? err.message : 'Could not generate vibe. Please try again.');
    } finally {
      setVibeLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-orange-50 to-white ${topPadding} pb-8 px-4`}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-orange-900 mb-2">
            Jain Vibes ✨
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            AI-powered spiritual guidance rooted in Jain philosophy and the Navkar Mantra.
          </p>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="mb-5 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
            <span className="text-base">📵</span>
            <span>You&apos;re offline. AI features are unavailable — reconnect to get your daily vibe.</span>
          </div>
        )}

        {/* Daily Vibe */}
        <div className="mb-6 bg-white rounded-xl p-5 border border-orange-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🌅</span>
            <h2 className="text-sm font-bold text-gray-900">Today&apos;s Jain Vibe</h2>
          </div>

          {!vibe && !vibeLoading && (
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Tap below for your daily Jain-inspired spiritual affirmation.
            </p>
          )}

          {vibeLoading && (
            <div className="flex items-center gap-2 text-xs text-orange-600 mb-4">
              <SpinnerIcon />
              <span>Channelling your vibe…</span>
            </div>
          )}

          {vibe && !vibeLoading && (
            <div className="mb-4">
              {vibeIntro && (
                <p className="text-xs font-bold text-orange-700 mb-1.5">{vibeIntro}</p>
              )}
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {vibe}
              </p>
            </div>
          )}

          {vibeError && (
            <p className="text-xs text-red-500 mb-3">{vibeError}</p>
          )}

          <button
            onClick={fetchVibe}
            disabled={vibeLoading || !isOnline}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {vibeLoading
              ? <><SpinnerIcon /><span>Loading…</span></>
              : vibe ? '🔄 New Vibe' : '✨ Get My Vibe'}
          </button>
        </div>

        {/* Daily Reminders card */}
        <div className="mb-6 bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔔</span>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Daily Reminders</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-none">Morning · Evening · Before sleep</p>
                </div>
              </div>
              {isNative ? (
                <button
                  onClick={toggleSchedNotif}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${schedEnabled ? 'bg-orange-500' : 'bg-gray-200'}`}
                  aria-label="Toggle daily reminders"
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${schedEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              ) : webPushSupported ? (
                <button
                  onClick={toggleWebPush}
                  disabled={webPushLoading}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-60 ${webPushEnabled ? 'bg-orange-500' : 'bg-gray-200'}`}
                  aria-label="Toggle web push reminders"
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${webPushEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              ) : (
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">APK / PWA</span>
              )}
            </div>

            {usagePattern?.hasData && (
              <p className="text-[10px] text-emerald-600 mt-1">
                ✅ Timed to your usage pattern
              </p>
            )}
            {isNative && !usagePattern?.hasData && (
              <p className="text-[10px] text-gray-400 mt-1">
                Times learn from your app usage (3+ days). Using smart defaults for now.
              </p>
            )}
            {webPushError && (
              <p className="text-[10px] text-red-500 mt-1">{webPushError}</p>
            )}
            {!isNative && webPushSupported && webPushEnabled && (
              <p className="text-[10px] text-emerald-600 mt-1">✅ Web push active — reminders at 7am · 6pm · 7pm · 10pm IST</p>
            )}
          </div>

          {/* Notification preview cards */}
          {notifPreviews && (
            <div className="px-5 pb-4 space-y-2">
              {notifPreviews.map(n => (
                <div key={n.slot} className="flex gap-3 items-start bg-orange-50 rounded-xl px-3 py-2.5 border border-orange-100">
                  <div className="flex-shrink-0 text-center min-w-[42px]">
                    <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">
                      {n.slot === 'morning' ? '🌅' : n.slot === 'chauvihar' ? '🌇' : n.slot === 'evening' ? '🌆' : '🌙'}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">{n.time}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-800 leading-snug">{n.title}</p>
                    <p className="text-[10px] text-gray-500 leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                  </div>
                </div>
              ))}
              <p className="text-[9px] text-gray-400 text-center pt-1">
                Messages refresh daily based on your count & streak 📿
              </p>
            </div>
          )}
        </div>

        {/* What's New blog card */}
        <div
          className="mb-6 bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => setPage('blog')}
        >
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="text-3xl">📿</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white font-bold text-sm">What&apos;s New in v2.1</span>
                <span className="bg-white/25 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">LATEST</span>
              </div>
              <p className="text-orange-100 text-[11px] leading-snug line-clamp-2">
                Karma Bubble game · Smart daily reminders · Widget tap buttons · Web push. Dharma meets tech 🚀
              </p>
            </div>
            <span className="text-white/70 text-lg flex-shrink-0">→</span>
          </div>
        </div>

        {/* Karma Bubble Game CTA */}
        <div
          className="mb-6 bg-gradient-to-br from-purple-50 to-orange-50 rounded-xl border border-purple-100 shadow-sm cursor-pointer hover:shadow-md transition-all"
          onClick={() => setPage('game')}
        >
          <div className="px-5 py-5 flex items-center gap-4">
            <div className="text-4xl">🫧</div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-gray-900 mb-0.5">Karma Bubble</h2>
              <p className="text-[11px] text-gray-500 leading-snug">
                Catch punya, dodge kashaya. A mindful game rooted in Jain karma theory.
              </p>
            </div>
            <span className="text-gray-400 text-lg flex-shrink-0">→</span>
          </div>
        </div>

        {/* Jain Vibes Playlist by JainZBharat */}
        <div className="mb-6 bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-4 pb-3">
            <span className="text-lg">🎵</span>
            <h2 className="text-sm font-bold text-gray-900">Jain Vibes Playlist</h2>
            <span className="ml-auto text-[10px] text-gray-400">by JainZBharat</span>
          </div>
          <iframe
            src="https://open.spotify.com/embed/playlist/4WsjlXMfJzb71wl6Krf4L4?utm_source=generator"
            title="Jain Vibes by JainZBharat"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full"
            style={{ height: 352, border: 'none' }}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            onClick={() => setPage('jaap')}
            className="text-orange-600 text-xs font-medium hover:underline"
          >
            Back to Jaap
          </button>
          <button
            onClick={() => { try { localStorage.setItem('navkar_prev_page', 'vibes'); } catch(_) {} setPage('settings'); }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-700 transition-colors"
          >
            <span>⚙️</span>
            <span className="font-medium">Settings</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default JainVibesPage;
