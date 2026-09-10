import React, { useState, useEffect, useRef } from 'react';
import { MANTRA_WORDS, MANTRA_WORDS_HINDI, MANTRA_WORDS_GUJARATI } from '../utils/constants';
import SadhanaCompleteModal from './SadhanaCompleteModal';
import { recordTimeOfDayCount } from '../lib/tapStorage';

export default function SadhanaSessionScreen({
  isActive,
  onExit,
  onAddNavkars,
  language = 'english',
}) {
  // Session Configuration State
  const [mode, setMode] = useState('COUNT'); // COUNT | TIMER | MALA | SANKALP
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Target Parameters
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [malaTarget, setMalaTarget] = useState(3);
  const [sankalpTarget, setSankalpTarget] = useState(1008);
  const [sankalpName, setSankalpName] = useState('Navkar Sadhana');

  // Live Metrics
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionNavkars, setSessionNavkars] = useState(0);
  const [wordIndex, setWordIndex] = useState(-1);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completedStats, setCompletedStats] = useState(null);

  // Timer Ref
  const timerRef = useRef(null);

  // Timer Tick
  useEffect(() => {
    if (sessionStarted && !isPaused && !isCompleteModalOpen) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Check Timer Mode limit
          if (mode === 'TIMER' && next >= timerMinutes * 60) {
            finishSession(next);
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionStarted, isPaused, mode, timerMinutes, isCompleteModalOpen]);

  if (!isActive) return null;

  // Handle Mantra Word Tapping
  const handleTap = () => {
    if (!sessionStarted || isPaused) return;

    if (navigator.vibrate) navigator.vibrate(20);
    const nextIdx = wordIndex + 1;

    if (nextIdx < MANTRA_WORDS.length) {
      setWordIndex(nextIdx);
      if (nextIdx === MANTRA_WORDS.length - 1) {
        // Completed 1 Navkar
        const newNavkarCount = sessionNavkars + 1;
        setSessionNavkars(newNavkarCount);
        onAddNavkars(1);
        recordTimeOfDayCount(1);

        // Reset word index after brief pause
        setTimeout(() => {
          setWordIndex(-1);
        }, 500);

        // Check Mala or Sankalp completion target
        const malasDone = Math.floor(newNavkarCount / 108);
        if (mode === 'MALA' && malasDone >= malaTarget) {
          finishSession(elapsedSeconds, newNavkarCount);
        } else if (mode === 'SANKALP' && newNavkarCount >= sankalpTarget) {
          finishSession(elapsedSeconds, newNavkarCount);
        }
      }
    }
  };

  const startSession = () => {
    setSessionNavkars(0);
    setElapsedSeconds(0);
    setWordIndex(-1);
    setIsPaused(false);
    setSessionStarted(true);
  };

  const finishSession = (finalSeconds = elapsedSeconds, finalNavkars = sessionNavkars) => {
    clearInterval(timerRef.current);
    const malas = Math.floor(finalNavkars / 108);
    const mins = Math.max(1, Math.round(finalSeconds / 60));
    const avgPerMin = Math.round((finalNavkars / mins) * 10) / 10;

    let targetLabel = undefined;
    if (mode === 'TIMER') targetLabel = `${timerMinutes} min`;
    if (mode === 'MALA') targetLabel = `${malaTarget} Malas`;
    if (mode === 'SANKALP') targetLabel = `${sankalpTarget} Navkars`;

    setCompletedStats({
      durationSeconds: finalSeconds,
      navkars: finalNavkars,
      malas,
      avgPerMin,
      target: targetLabel,
      mode,
      suggestedName: sankalpName || 'Navkar Sadhana',
    });
    setIsCompleteModalOpen(true);
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentWord =
    wordIndex >= 0
      ? language === 'hindi'
        ? MANTRA_WORDS_HINDI[wordIndex]
        : language === 'gujarati'
        ? MANTRA_WORDS_GUJARATI[wordIndex]
        : MANTRA_WORDS[wordIndex]
      : 'TAP TO BEGIN';

  const sessionMalas = Math.floor(sessionNavkars / 108);

  // ---------- Setup Screen before Start ----------
  if (!sessionStarted) {
    return (
      <div className="fixed inset-0 z-[90] bg-orange-950/95 backdrop-blur-md flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-xl font-serif font-bold text-orange-100 flex items-center gap-2">
                <span>🪷</span> NAVKAR SADHANA
              </h2>
              <p className="text-xs text-orange-200/70">
                Choose your practice session mode
              </p>
            </div>
            <button
              onClick={onExit}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'COUNT', name: 'Free Count', icon: '📿' },
              { id: 'TIMER', name: 'Timer Mode', icon: '⏱️' },
              { id: 'MALA', name: 'Mala Mode', icon: '🔮' },
              { id: 'SANKALP', name: 'Sankalp Mode', icon: '🎯' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  mode === m.id
                    ? 'bg-orange-500/30 border-orange-400 text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-orange-200/80 hover:bg-white/10'
                }`}
              >
                <span className="text-xl">{m.icon}</span>
                <span className="text-xs font-bold font-serif">{m.name}</span>
              </button>
            ))}
          </div>

          {/* Mode Parameters */}
          {mode === 'TIMER' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-orange-200">Session Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setTimerMinutes(mins)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      timerMinutes === mins
                        ? 'bg-amber-500 border-amber-400 text-white'
                        : 'bg-white/5 border-white/10 text-orange-200 hover:bg-white/10'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'MALA' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-orange-200">Target Malas</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 5, 11].map((target) => (
                  <button
                    key={target}
                    onClick={() => setMalaTarget(target)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      malaTarget === target
                        ? 'bg-amber-500 border-amber-400 text-white'
                        : 'bg-white/5 border-white/10 text-orange-200 hover:bg-white/10'
                    }`}
                  >
                    {target} {target === 1 ? 'Mala' : 'Malas'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'SANKALP' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-orange-200 block mb-1">Target Count</label>
                <div className="grid grid-cols-2 gap-2">
                  {[108, 540, 1008, 10008].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSankalpTarget(val)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        sankalpTarget === val
                          ? 'bg-amber-500 border-amber-400 text-white'
                          : 'bg-white/5 border-white/10 text-orange-200 hover:bg-white/10'
                      }`}
                    >
                      {val.toLocaleString()} Navkars
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Session Title Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-orange-200">Session Name</label>
            <input
              type="text"
              value={sankalpName}
              onChange={(e) => setSankalpName(e.target.value)}
              placeholder="e.g. Morning Sadhana"
              className="px-3 py-2 text-sm bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:border-orange-400"
            />
          </div>

          <button
            onClick={startSession}
            className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm rounded-2xl shadow-xl transition-all active:scale-95 mt-2"
          >
            START SADHANA
          </button>
        </div>
      </div>
    );
  }

  // ---------- Live Sadhana Screen ----------
  return (
    <div className="fixed inset-0 z-[90] bg-orange-950 flex flex-col items-center justify-between p-6 text-white select-none">
      {/* Header Info */}
      <div className="w-full max-w-sm flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪷</span>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-orange-300/80 font-semibold">
              {sankalpName || 'NAVKAR SADHANA'}
            </h3>
            <span className="text-[10px] font-mono text-orange-400">{mode} MODE</span>
          </div>
        </div>

        <button
          onClick={() => finishSession()}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-orange-200 text-xs font-semibold rounded-full border border-white/10 transition-all"
        >
          END SESSION
        </button>
      </div>

      {/* Main Meditation & Tapping Area */}
      <div
        onClick={handleTap}
        className="flex-1 w-full max-w-md flex flex-col items-center justify-center cursor-pointer my-4 text-center"
      >
        {/* Timer Display */}
        <div className="text-4xl sm:text-5xl font-mono font-bold text-orange-100 tracking-wider mb-4 drop-shadow-md">
          {formatTime(elapsedSeconds)}
        </div>

        {/* Counter Stats */}
        <div className="flex items-center gap-6 text-orange-200/90 font-serif mb-8">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-mono text-white">{sessionNavkars}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-70">Navkars</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-mono text-white">{sessionMalas}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-70">Malas</span>
          </div>
        </div>

        {/* Mantra Word Reveal */}
        <div className="h-20 flex items-center justify-center">
          <span className="text-2xl sm:text-3xl font-serif text-amber-200 tracking-wide animate-pulse">
            {currentWord}
          </span>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="w-full max-w-sm flex items-center justify-center gap-4 border-t border-white/10 pt-4">
        <button
          onClick={() => setIsPaused((prev) => !prev)}
          className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border shadow-lg ${
            isPaused
              ? 'bg-emerald-600 border-emerald-400 text-white'
              : 'bg-white/10 border-white/20 text-orange-200 hover:bg-white/20'
          }`}
        >
          {isPaused ? 'RESUME' : 'PAUSE'}
        </button>
      </div>

      {/* Post-Session Summary Modal */}
      <SadhanaCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          onExit();
        }}
        stats={completedStats}
      />
    </div>
  );
}
