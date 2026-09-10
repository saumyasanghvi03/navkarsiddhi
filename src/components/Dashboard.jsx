import React from 'react';
import { computeStreak } from '../lib/tapStorage';
import TimeOfDayCard from './TimeOfDayCard';

const Dashboard = ({ history, totalNavkars, onClose }) => {
  // Compute Stats
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = history.find(h => h.date === today) || { navkars: 0 };

  const totalMalas = Math.floor(totalNavkars / 108);
  const malasToday = Math.floor(todayEntry.navkars / 108);
  const streak = computeStreak(history);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="bg-white/95 rounded-2xl shadow-2xl p-6 w-full max-w-sm relative animate-scale-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-2"
        >
          ✕
        </button>

        <h2 className="text-2xl font-serif font-bold text-orange-900 mb-4 text-center">Your Sadhana</h2>

        {/* Time of Day Breakdown Card */}
        <div className="mb-4">
          <TimeOfDayCard todayTotal={todayEntry.navkars} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-100">
            <div className="text-3xl font-bold text-orange-700">{todayEntry.navkars}</div>
            <div className="text-xs text-orange-600 uppercase tracking-wider mt-1">Navkars Today</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
            <div className="text-3xl font-bold text-blue-700">{malasToday}</div>
            <div className="text-xs text-blue-600 uppercase tracking-wider mt-1">Malas Today</div>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-amber-50 p-3 rounded-xl text-center border border-amber-100 mb-4 flex items-center justify-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <span className="text-2xl font-bold text-amber-700">{streak}</span>
            <span className="text-xs text-amber-600 ml-1">day streak</span>
          </div>
        </div>

        {todayEntry.samples > 0 && (
          <div className="bg-purple-50 p-3 rounded-xl text-center border border-purple-100 mb-4">
            <div className="text-2xl font-bold text-purple-700">
              {Math.round(todayEntry.stabilitySum / todayEntry.samples)}
            </div>
            <div className="text-xs text-purple-600 uppercase tracking-wider mt-1">Mind Stability Score</div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 text-sm">Total Navkars</span>
            <span className="font-bold text-gray-800">{totalNavkars}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 text-sm">Total Malas</span>
            <span className="font-bold text-gray-800">{totalMalas}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 text-sm">Days Active</span>
            <span className="font-bold text-gray-800">{history.length}</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 italic font-serif">"Namo Arihantanam"</p>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
