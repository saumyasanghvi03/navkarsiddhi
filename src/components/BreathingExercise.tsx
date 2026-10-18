"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { addPunya } from '@/lib/companion/storage';

const PHASES = [
  { name: 'Breathe in...', duration: 4000, scale: 1.6 },
  { name: 'Hold with stillness...', duration: 7000, scale: 1.6 },
  { name: 'Release everything...', duration: 8000, scale: 1.0 },
] as const;

const TOTAL_CYCLES = 3;

interface BreathingExerciseProps {
  onClose?: () => void;
  onStartJaap?: () => void;
}

export default function BreathingExercise({ onClose, onStartJaap }: BreathingExerciseProps) {
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
            addPunya(10);
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

  const start = () => { setCycle(0); setPhaseIdx(0); setDone(false); setRunning(true); };
  const stop = () => { setRunning(false); if (timerRef.current) clearTimeout(timerRef.current); };

  const phase = PHASES[phaseIdx];

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 text-center">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">4-7-8 Breathing</h3>
          {onClose && <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Back</button>}
        </div>

        <div className="flex items-center justify-center my-8" style={{ minHeight: 160 }}>
          <div className="rounded-full bg-gradient-to-br from-orange-300 to-amber-400 shadow-lg"
            style={{
              width: 100, height: 100,
              transform: `scale(${running ? phase.scale : 1})`,
              transition: running ? `transform ${phase.duration}ms ${phaseIdx === 2 ? 'ease-in' : 'ease-out'}` : 'transform 0.3s ease',
              opacity: 0.85,
            }} />
        </div>

        {running && (
          <div className="mb-4">
            <p className="text-lg font-medium text-gray-700">{phase.name}</p>
            <p className="text-xs text-gray-400 mt-1">Cycle {cycle + 1} of {TOTAL_CYCLES}</p>
          </div>
        )}
        {!running && !done && <p className="text-sm text-gray-500 mb-4">3 cycles of deep breathing to calm your mind</p>}
        {done && (
          <div className="mb-4">
            <p className="text-lg font-medium text-gray-700 mb-1">Your prana is balanced</p>
            <p className="text-sm text-gray-500">+10 punya earned</p>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {!running && !done && (
            <button onClick={start} className="px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">Begin</button>
          )}
          {running && (
            <button onClick={stop} className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors">Pause</button>
          )}
          {done && (
            <>
              <button onClick={start} className="px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors">Again</button>
              {onStartJaap && (
                <button onClick={onStartJaap} className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">Start Navkar</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
