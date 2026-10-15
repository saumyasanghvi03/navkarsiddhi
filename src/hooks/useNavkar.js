// src/hooks/useNavkar.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { museManager } from '../lib/muse-client';
import { useTapBiofeedback } from './useTapBiofeedback';
import { useOrganicMetric } from './useOrganicMetric';
import { MANTRA_WORDS, MANTRA_WORDS_HINDI, MANTRA_WORDS_GUJARATI, LINE_BREAKS, THEMES, AUTO_SCROLL_SPEEDS } from '../utils/constants';
import { computeUpdatedHistory, computeBulkUpdatedHistory, loadInitialState, getTodayDate } from '../lib/navkarPersistence';
import { addToTapLog, getActiveTap, computeStreak } from '../lib/tapStorage';
import { syncWidgetData } from '../lib/nativeWidgetBridge';
import { postMalaCompleteMilestone, postDailyTargetMilestone, postVibeCheck, initWristNotificationActions, addWristTapListener } from '../lib/wristNotifications';
import { isNativeShell } from '../lib/nativeWidgetBridge';
import { apiUrl } from '../lib/apiBase';

const HISTORY_KEY = 'navkar_history';
const TOTAL_KEY = 'totalCount'; // legacy key
const PREF_KEY = 'navkar_prefs';

export const useNavkar = () => {
  // State
  const [totalNavkars, setTotalNavkars] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isClearing, setIsClearing] = useState(false);

  // Settings
  const [mode, setMode] = useState('GRID'); // GRID | RING
  const [useMuseEnabled, setUseMuseEnabled] = useState(false);
  const [malaSize, setMalaSize] = useState(108); // 9 | 27 | 36 | 108
  const [showDashboard, setShowDashboard] = useState(false);

  // Biofeedback (Tap vs Muse)
  const { score: tapFocus, calm: tapCalm, onTap: recordTap } = useTapBiofeedback();

  // Real Hardware State
  const [museMetrics, setMuseMetrics] = useState({ focus: 0, calm: 0, connected: false });

  // Connect/Subscribe to Muse
  useEffect(() => {
    let sub;
    if (useMuseEnabled) {
      museManager.connect().catch(err => {
        if (err.name !== 'NotFoundError') {
          console.error('Muse connect error:', err);
        }
        setUseMuseEnabled(false); // Reset if failed
      });

      sub = museManager.metrics$.subscribe(data => {
        setMuseMetrics(data);
      });
    } else {
      museManager.disconnect();
    }
    return () => {
      if (sub) sub.unsubscribe();
      museManager.disconnect();
    };
  }, [useMuseEnabled]);

  // Determine Source of Truth
  // If Muse is connected and streaming, use it. Else use Taps.
  const isMuseActive = useMuseEnabled && museMetrics.connected;

  const rawFocus = isMuseActive ? museMetrics.focus : tapFocus;
  const rawCalm = isMuseActive ? museMetrics.calm : tapCalm;

  // Make them alive!
  // Lower intensity for realistic, subtle breathing
  const focus = useOrganicMetric(rawFocus, 1.0);
  const calm = useOrganicMetric(rawCalm, 0.8);

  const [neuroModeEnabled, setNeuroModeEnabled] = useState(false);
  const toggleNeuroMode = () => setNeuroModeEnabled(prev => !prev);
  const toggleUseMuse = () => setUseMuseEnabled(prev => !prev);

  // Compute Brain State based on metrics
  // Gold: High Focus + High Calm (Flow/Gamma)
  // Cyan: High Focus (Active/Beta)
  // Indigo: High Calm (Deep/Theta)
  // Orange: Distracted (Low Focus, Low Calm)
  const brainState = useMemo(() => {
    if (focus >= 80 && calm >= 80) return 'gold';
    if (focus >= 60) return 'cyan';
    if (calm >= 60) return 'indigo';
    return 'orange';
  }, [focus, calm]);

  // History
  const [history, setHistory] = useState([]);

  // Initialization
  useEffect(() => {
    const initial = loadInitialState({
      totalRaw: localStorage.getItem(TOTAL_KEY),
      historyRaw: localStorage.getItem(HISTORY_KEY),
      prefsRaw: localStorage.getItem(PREF_KEY),
    });

    setTotalNavkars(initial.totalNavkars);
    setHistory(initial.history);
    setMode(initial.mode);
    if (initial.malaSize) setMalaSize(initial.malaSize);
  }, []);

  // Keep the native Android widget's cache in sync whenever today's count
  // changes — a no-op everywhere except inside the Capacitor shell.
  useEffect(() => {
    const today = getTodayDate();
    const todayEntry = history.find(h => h.date === today);
    const todayNavkars = todayEntry ? todayEntry.navkars : 0;
    const streak = computeStreak(history);

    // Build last-7-days string "d0,d1,...,d6" (oldest→today) for the heatmap widget.
    const weeklyNavkars = (() => {
      const counts = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const entry = history.find(h => h.date === key);
        counts.push(entry ? entry.navkars : 0);
      }
      return counts.join(',');
    })();

    syncWidgetData({
      todayNavkars,
      todayMalas: Math.floor(todayNavkars / malaSize),
      streak,
      malaSize,
      weeklyNavkars,
    });
  }, [history, malaSize]);

  // ── Native Android extras (no-op on web) ───────────────────────────────────

  // Register "+1 Navkar" action button on the wrist companion notification and
  // listen for taps on it (works via watch notification action mirroring too).
  useEffect(() => {
    if (!isNativeShell()) return;
    initWristNotificationActions();
    const unsub = addWristTapListener(() => {
      // We need the latest handleTap but can't close over it directly here
      // because it's a useCallback rebuilt each render. Read from a ref instead.
      handleTapRef.current?.();
    });
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Volume-down button → count one Navkar (dispatched from MainActivity.java).
  useEffect(() => {
    if (!isNativeShell()) return;
    const onVolumeDown = () => handleTapRef.current?.();
    document.addEventListener('navkar-volume-down', onVolumeDown);
    return () => document.removeEventListener('navkar-volume-down', onVolumeDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Screen Wake Lock — keep screen on while a mala is in progress.
  const wakeLockRef = useRef(null);
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.wakeLock) return;
    if (currentIndex >= 0 && !wakeLockRef.current) {
      navigator.wakeLock.request('screen').then(wl => { wakeLockRef.current = wl; }).catch(() => {});
    }
    if (currentIndex < 0 && wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }, [currentIndex]);

  // Reacquire wake lock if the page becomes visible again mid-mala.
  useEffect(() => {
    if (typeof document === 'undefined' || !navigator?.wakeLock) return;
    const onVisible = () => {
      if (currentIndex >= 0 && !wakeLockRef.current) {
        navigator.wakeLock.request('screen').then(wl => { wakeLockRef.current = wl; }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [currentIndex]);

  // Vibe check on app close/background — sends a summary notification.
  useEffect(() => {
    if (!isNativeShell()) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const today = getTodayDate();
        const todayEntry = history.find(h => h.date === today);
        const todayNavkars = todayEntry ? todayEntry.navkars : 0;
        if (todayNavkars > 0) {
          postVibeCheck({
            todayNavkars,
            malas: Math.floor(todayNavkars / malaSize),
            streak: computeStreak(history),
          });
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [history, malaSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stable ref so the zero-dep effects above always call the latest handleTap.
  const handleTapRef = useRef(null);

  // Persistence helpers
  const persistTotal = newTotal => {
    localStorage.setItem(TOTAL_KEY, newTotal.toString());
    setTotalNavkars(newTotal);
  };

  const persistHistory = (newTotal, currentFocus = 0, currentCalm = 0) => {
    const newHistory = computeUpdatedHistory({
      history,
      focus: currentFocus,
      calm: currentCalm,
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const savePrefs = (newMode, newSize) => {
    const prefs = { mode: newMode, malaSize: newSize };
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  };

  const updateMalaSize = (size) => {
    setMalaSize(size);
    savePrefs(mode, size);
  };

  // Complexity Levels
  const [complexity, setComplexity] = useState('ADVANCED'); // BASIC | INTERMEDIATE | ADVANCED

  const setComplexityMode = (level) => {
    setComplexity(level);
    // Auto-configure features based on level
    if (level === 'BASIC') {
      setNeuroModeEnabled(false);
      setUseMuseEnabled(false);
    } else if (level === 'INTERMEDIATE') {
      setNeuroModeEnabled(false);
      setUseMuseEnabled(false);
    } else {
      // Advanced
      setNeuroModeEnabled(true);
      // Don't auto-enable Muse, let user decide, but enable the capability
    }
  };

  const resetMala = () => {
    // Reset only the current mala progress, keeping completed malas
    const completedNavkars = Math.floor(totalNavkars / malaSize) * malaSize;
    setTotalNavkars(completedNavkars);
    setCurrentIndex(-1);
    setIsClearing(false);
    localStorage.setItem(TOTAL_KEY, completedNavkars.toString());
  };

  // Computed values
  const malaCount = Math.floor(totalNavkars / malaSize);
  const navkarsInMala = totalNavkars % malaSize;
  // So likely standard logic relies on 108 for "Mala Count" display, but ring behavior adapts to size.
  // I'll leave `malaCount` as standard 108 for now to avoid confusion or ask user if needed. 
  // Actually, let's stick to standard 108 for global count, but MalaRing will handle local cycles.

  const themeIndex = malaCount > 0 ? (malaCount - 1) % THEMES.length : -1;
  const currentTheme = themeIndex >= 0 ? THEMES[themeIndex] : null;

  const currentLineIndex = useMemo(() => {
    if (currentIndex < 0) return 0;
    let wordCount = 0;
    for (let i = 0; i < LINE_BREAKS.length; i++) {
      wordCount += LINE_BREAKS[i];
      if (currentIndex < wordCount) return i;
    }
    return LINE_BREAKS.length - 1;
  }, [currentIndex]);

  // Actions
  const handleTap = useCallback(() => {
    if (isClearing) return;

    // Biofeedback
    recordTap();

    if (navigator.vibrate) navigator.vibrate(20);
    const nextIdx = currentIndex + 1;
    if (nextIdx < MANTRA_WORDS.length) {
      setCurrentIndex(nextIdx);
      if (nextIdx === MANTRA_WORDS.length - 1) completeMantra();
    }
  }, [currentIndex, isClearing, totalNavkars, recordTap]);

  // Keep the ref in sync so zero-dep effects can always call the latest tap.
  handleTapRef.current = handleTap;

  const completeMantra = () => {
    if (navigator.vibrate) navigator.vibrate(100);
    const newTotal = totalNavkars + 1;
    persistTotal(newTotal);
    persistHistory(newTotal, focus, calm);

    // Wrist milestone: a mala just completed (mirrors to watches that pick
    // up Android notifications, unlike the silent ongoing progress update).
    if (newTotal % malaSize === 0) {
      postMalaCompleteMilestone(newTotal / malaSize);
    }

    // Update tap log if an active tap exists
    try {
      const activeTap = getActiveTap();
      if (activeTap) {
        const today = getTodayDate();
        const todayHist = history.find(h => h.date === today);
        const todayCount = todayHist ? todayHist.navkars + 1 : 1;
        addToTapLog(todayCount);

        // Wrist milestone: today's daily tap target was just reached.
        if (activeTap.dailyTarget && todayCount === activeTap.dailyTarget) {
          postDailyTargetMilestone(activeTap.dailyTarget);
        }
      }
    } catch (_) { /* ignore tap log errors */ }

    // Increment global counter (fire-and-forget — never blocks local UX)
    fetch(apiUrl('/api/navkar'), { method: 'POST' }).catch((err) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[GlobalStats] API call failed:', err);
      }
    });

    setIsClearing(true);
    setTimeout(() => {
      setCurrentIndex(-1);
      setIsClearing(false);
    }, 1000);
  };

  // Bulk-add navkars (Sadhana sessions, Quick Add) without a full page reload.
  // Mirrors completeMantra's persistence so the Progress tab and active-tap
  // log reflect these navkars immediately.
  const addNavkars = useCallback((count) => {
    if (!count || count <= 0) return;

    const newTotal = totalNavkars + count;
    persistTotal(newTotal);

    // Wrist milestone: a bulk add (Quick Add / Sadhana) crossed into a new
    // mala — compare mala counts before/after rather than newTotal % malaSize,
    // since a bulk add can land mid-mala.
    const newMalaCount = Math.floor(newTotal / malaSize);
    if (newMalaCount > Math.floor(totalNavkars / malaSize)) {
      postMalaCompleteMilestone(newMalaCount);
    }

    const newHistory = computeBulkUpdatedHistory({ history, count, focus, calm });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    setHistory(newHistory);

    try {
      const activeTap = getActiveTap();
      if (activeTap) {
        const today = getTodayDate();
        const oldTodayNavkars = (history.find(h => h.date === today) || { navkars: 0 }).navkars;
        const todayHist = newHistory.find(h => h.date === today);
        const newTodayNavkars = todayHist ? todayHist.navkars : count;
        addToTapLog(newTodayNavkars);

        // Wrist milestone: this bulk add crossed today's daily tap target.
        if (activeTap.dailyTarget && oldTodayNavkars < activeTap.dailyTarget && newTodayNavkars >= activeTap.dailyTarget) {
          postDailyTargetMilestone(activeTap.dailyTarget);
        }
      }
    } catch (_) { /* ignore tap log errors */ }
  }, [totalNavkars, history, focus, calm, malaSize]);

  const toggleMode = () => {
    const newMode = mode === 'GRID' ? 'RING' : 'GRID';
    setMode(newMode);
    savePrefs(newMode, malaSize);
  };


  return {
    totalNavkars,
    malaCount,
    navkarsInMala,
    currentIndex,
    currentWord: currentIndex >= 0 ? MANTRA_WORDS[currentIndex] : null,
    currentWordHindi: currentIndex >= 0 ? MANTRA_WORDS_HINDI[currentIndex] : null,
    currentWordGujarati: currentIndex >= 0 ? MANTRA_WORDS_GUJARATI[currentIndex] : null,
    isClearing,
    currentLineIndex,
    currentTheme,
    // Settings & History
    mode,
    // autoScroll: false, // Legacy
    // scrollSpeed: 'MEDIUM', // Legacy
    malaSize,      // New Prop
    setMalaSize: updateMalaSize, // Setter
    history,
    showDashboard,
    setShowDashboard,
    // Optional Muse
    useMuseEnabled,
    toggleUseMuse,
    isMuseConnected: isMuseActive, // Expose connection status
    // Neuro Mode (UI Visibility)
    neuroModeEnabled,
    toggleNeuroMode,
    // Metrics
    focus,
    calm,
    brainState,
    // Actions
    handleTap,
    addNavkars,
    toggleMode,
    resetMala,
    complexity,
    setComplexityMode,
    // toggleAutoScroll: () => {}, // Legacy stub if needed
    // cycleSpeed: () => {}, // Legacy stub
  };
};
