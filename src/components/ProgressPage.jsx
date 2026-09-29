"use client";

import React, { useState, useEffect } from 'react';
import { useNav } from '../lib/navContext';
import { computeTapProgress, computeStreak, computeAllTimeStats, getActiveTap } from '../lib/tapStorage';
import { pageTopPaddingClass } from '../lib/nativeWidgetBridge';

const ProgressPage = ({ history, totalNavkars }) => {
  const { setPage } = useNav();
  const [topPadding] = useState(pageTopPaddingClass);
  const [tapProgress, setTapProgress] = useState(null);
  const [allTime, setAllTime] = useState({ totalNavkars: 0, totalMalas: 0, totalDays: 0, streak: 0 });

  useEffect(() => {
    setTapProgress(computeTapProgress());
    setAllTime(computeAllTimeStats(history));
  }, [history]);

  const streak = computeStreak(history);
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const todayEntry = history.find(h => h.date === todayStr) || { navkars: 0 };
  const todayMalas = Math.floor(todayEntry.navkars / 108);

  return (
    <div className={`min-h-screen bg-gradient-to-b from-orange-50 to-white ${topPadding} pb-8 px-4`}>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-serif font-bold text-orange-900 text-center mb-6">
          Your Sadhana Progress
        </h1>

        {/* Today's stats */}
        <section className="mb-6">
          <h2 className="text-base font-serif font-semibold text-orange-800 mb-3">Today</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
              <div className="text-2xl font-bold text-orange-700">{todayEntry.navkars}</div>
              <div className="text-xs text-orange-600 mt-1">Navkars Today</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-700">{todayMalas}</div>
              <div className="text-xs text-blue-600 mt-1">Malas Today</div>
            </div>
          </div>
        </section>

        {/* Streak */}
        <section className="mb-6">
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
              🔥
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-800">{streak}</div>
              <div className="text-xs text-amber-600">Day Streak (1+ mala/day)</div>
            </div>
          </div>
        </section>

        {/* All-time stats */}
        <section className="mb-6">
          <h2 className="text-base font-serif font-semibold text-orange-800 mb-3">All-Time</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <div className="text-xl font-bold text-gray-800">{allTime.totalNavkars}</div>
              <div className="text-[10px] text-gray-500 mt-1">Total Navkars</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <div className="text-xl font-bold text-gray-800">{allTime.totalMalas}</div>
              <div className="text-[10px] text-gray-500 mt-1">Total Malas</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <div className="text-xl font-bold text-gray-800">{allTime.totalDays}</div>
              <div className="text-[10px] text-gray-500 mt-1">Days Active</div>
            </div>
          </div>
        </section>

        {/* Active Tap Progress */}
        {tapProgress && (
          <section className="mb-6">
            <h2 className="text-base font-serif font-semibold text-orange-800 mb-3">
              Active Tap: {tapProgress.tap.name}
            </h2>
            {tapProgress.tap.tapLabel && (
              <p className="text-xs text-gray-500 mb-2">{tapProgress.tap.tapLabel}</p>
            )}
            <div className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{tapProgress.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${tapProgress.percentage}%` }}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-green-700">{tapProgress.completedDays}</div>
                  <div className="text-[10px] text-gray-500">Days Completed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{tapProgress.remainingDays}</div>
                  <div className="text-[10px] text-gray-500">Days Remaining</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-700">{tapProgress.totalNavkarsInTap}</div>
                  <div className="text-[10px] text-gray-500">Navkars in Tap</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-700">{tapProgress.totalMalasInTap}</div>
                  <div className="text-[10px] text-gray-500">Malas in Tap</div>
                </div>
              </div>

              {/* Today's tap progress */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Today: {tapProgress.todayNavkars} / {tapProgress.todayTarget}</span>
                  <span>
                    {tapProgress.todayNavkars >= tapProgress.todayTarget ? 'Target met' : `${tapProgress.todayTarget - tapProgress.todayNavkars} remaining`}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      tapProgress.todayNavkars >= tapProgress.todayTarget ? 'bg-green-500' : 'bg-blue-400'
                    }`}
                    style={{ width: `${Math.min(100, (tapProgress.todayNavkars / tapProgress.todayTarget) * 100)}%` }}
                  />
                </div>
              </div>

              {tapProgress.tap.totalDays > 0 && (
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Day {tapProgress.dayNumber} of {tapProgress.totalDays}
                </p>
              )}
            </div>
          </section>
        )}

        {!tapProgress && (
          <section className="mb-6 text-center">
            <p className="text-sm text-gray-500 mb-3">No active tap configured.</p>
            <button
              onClick={() => setPage('tapsetup')}
              className="bg-orange-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-orange-700 transition-colors shadow-md"
            >
              Set Up a Tap
            </button>
          </section>
        )}

        {/* Recent history */}
        {history.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-serif font-semibold text-orange-800 mb-3">Recent Activity</h2>
            <div className="space-y-2">
              {[...history].reverse().slice(0, 7).map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100 text-sm">
                  <span className="text-gray-600">{h.date}</span>
                  <div className="flex gap-3">
                    <span className="text-orange-700 font-medium">{h.navkars} Navkars</span>
                    <span className="text-blue-600">{Math.floor(h.navkars / 108)} malas</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
