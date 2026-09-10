import React from 'react';
import { getTodayTimeOfDayStats } from '../lib/tapStorage';

export default function TimeOfDayCard({ todayTotal = 0 }) {
  const stats = getTodayTimeOfDayStats();
  const morning = stats.morning || 0;
  const afternoon = stats.afternoon || 0;
  const evening = stats.evening || 0;
  const night = stats.night || 0;

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm border border-orange-100/80 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-orange-100 pb-2">
        <h4 className="text-sm font-serif font-bold text-orange-950 flex items-center gap-1.5">
          <span>🌅</span> Time-of-Day Sadhana
        </h4>
        <span className="text-xs font-semibold text-orange-800 bg-orange-100/70 px-2 py-0.5 rounded-full">
          Total: {todayTotal}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100/60 flex flex-col items-center">
          <span className="text-base mb-0.5">🌅</span>
          <span className="text-[10px] uppercase tracking-wider text-amber-900/70 font-medium">Morning</span>
          <span className="text-sm font-bold text-amber-900 mt-0.5">{morning}</span>
        </div>

        <div className="p-2 rounded-xl bg-orange-50/60 border border-orange-100/60 flex flex-col items-center">
          <span className="text-base mb-0.5">☀️</span>
          <span className="text-[10px] uppercase tracking-wider text-orange-900/70 font-medium">Afternoon</span>
          <span className="text-sm font-bold text-orange-900 mt-0.5">{afternoon}</span>
        </div>

        <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100/60 flex flex-col items-center">
          <span className="text-base mb-0.5">🌆</span>
          <span className="text-[10px] uppercase tracking-wider text-rose-900/70 font-medium">Evening</span>
          <span className="text-sm font-bold text-rose-900 mt-0.5">{evening}</span>
        </div>

        <div className="p-2 rounded-xl bg-indigo-50/60 border border-indigo-100/60 flex flex-col items-center">
          <span className="text-base mb-0.5">🌙</span>
          <span className="text-[10px] uppercase tracking-wider text-indigo-900/70 font-medium">Night</span>
          <span className="text-sm font-bold text-indigo-900 mt-0.5">{night}</span>
        </div>
      </div>
    </div>
  );
}
