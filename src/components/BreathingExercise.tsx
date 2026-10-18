'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

const PHASES = [
  { name: 'Breathe in... 🙏', duration: 4000, scale: 1.6 },
  { name: 'Hold with stillness...', duration: 7000, scale: 1.6 },
  { name: 'Release everything... 🙏', duration: 8000, scale: 1.0 },
] as const;

const TOTAL_CYCLES = 3;

interface BreathingExerciseProps {
  onNavigate?: (page: string) => void;
}

export default function BreathingExercise({ onNavigate }: BreathingExerciseProps) {
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    setPhaseIdx(prev => {
      const next = prev + 1;
      if (next >= PHASES.length) {
        setCycle(c => {
          const nextCycle = c + 1;
          if (nextCycle >= TOTAL_CYCLES) {
            setRunning(false);
            setDone(true);
            return c;
          }
          return nextCycle;
        });
        return 0;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setTimeout(advance, PHASES[phaseIdx].duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [running, phaseIdx, cycle, advance]);

  const start = () => {
    setCycle(0);
    setPhaseIdx(0);
    setDone(false);
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const phase = PHASES[phaseIdx];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-5 shadow-sm text-center">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">4-7-8 Breathing</h3>

      <div className="flex items-center justify-center my-6" style={{ minHeight: 160 }}>
        <div
          className="rounded-full bg-gradient-to-br from-blue-300 to-indigo-400 dark:from-blue-600 dark:to-indigo-700 shadow-lg"
          style={{
            width: 100,
            height: 100,
            transform: `scale(${running ? phase.scale : 1})`,
            transition: running
              ? `transform ${phase.duration}ms ${phaseIdx === 2 ? 'ease-in' : 'ease-out'}`
              : 'transform 0.3s ease',
            opacity: 0.85,
          }}
        />
      </div>

      {running && (
        <div className="mb-4">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">{phase.name}</p>
          <p className="text-xs text-gray-400 mt-1">Cycle {cycle + 1} of {TOTAL_CYCLES}</p>
        </div>
      )}

      {done && (
        <div className="mb-4">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">Your prana is balanced 🙏</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Jai Jinendra</p>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        {!running && !done && (
          <button onClick={start} className="px-5 py-2 rounded-full bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition">
            Begin
          </button>
        )}
        {running && (
          <button onClick={stop} className="px-5 py-2 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-400 transition">
            Stop
          </button>
        )}
        {done && (
          <>
            <button onClick={start} className="px-4 py-2 rounded-full bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition">
              Again
            </button>
            {onNavigate && (
              <button onClick={() => onNavigate('jaap')} className="px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition">
                📿 Navkar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
