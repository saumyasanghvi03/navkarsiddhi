import React, { useState } from 'react';
import { saveSadhanaSession } from '../lib/tapStorage';

export default function SadhanaCompleteModal({
  isOpen,
  onClose,
  stats,
}) {
  const [sessionName, setSessionName] = useState(stats?.suggestedName || 'Navkar Sadhana');

  if (!isOpen || !stats) return null;

  const { durationSeconds, navkars, malas, avgPerMin, target, mode } = stats;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSave = () => {
    saveSadhanaSession({
      id: Date.now().toString(),
      name: sessionName || 'Navkar Sadhana',
      mode,
      durationSeconds,
      navkars,
      malas,
      avgPerMin,
      target,
      timestamp: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-orange-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-orange-200 text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-3xl mb-3 shadow-inner">
          🙏
        </div>

        <h2 className="text-2xl font-serif font-bold text-orange-950">
          Sadhana Complete
        </h2>
        <p className="text-xs text-orange-700 font-medium mt-1 mb-5">
          May this practice bring inner peace and clarity
        </p>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 w-full mb-5">
          <div className="p-3 bg-orange-50/80 rounded-2xl border border-orange-100 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-orange-800/70 font-semibold">Time</span>
            <span className="text-lg font-bold font-mono text-orange-950 mt-0.5">{formatTime(durationSeconds)}</span>
          </div>

          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-100 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-amber-800/70 font-semibold">Navkars</span>
            <span className="text-lg font-bold font-mono text-amber-950 mt-0.5">{navkars}</span>
          </div>

          <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-100 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-rose-800/70 font-semibold">Malas</span>
            <span className="text-lg font-bold font-mono text-rose-950 mt-0.5">{malas}</span>
          </div>
        </div>

        {/* Secondary Details */}
        <div className="w-full bg-gray-50 rounded-2xl p-3 mb-5 border border-gray-100 text-xs text-gray-600 flex justify-around">
          <span>Pace: <strong>{avgPerMin}</strong> Navkars/min</span>
          {target && <span>Target: <strong>{target}</strong></span>}
        </div>

        {/* Session Title Input */}
        <div className="w-full text-left mb-6">
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Session Title / Sankalp
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g. Morning Sadhana"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-orange-800 hover:bg-orange-900 text-white font-bold text-sm rounded-xl shadow-lg transition-all active:scale-95"
        >
          Save to Practice Log
        </button>
      </div>
    </div>
  );
}
