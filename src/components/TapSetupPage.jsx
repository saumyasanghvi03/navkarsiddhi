"use client";

import React, { useState, useEffect } from 'react';
import { useNav } from '../lib/navContext';
import { TAP_PRESETS, getActiveTap, saveActiveTap, clearActiveTap, clearTapLog } from '../lib/tapStorage';

const TapSetupPage = () => {
  const { setPage } = useNav();
  const [activeTap, setActiveTap] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [dailyTarget, setDailyTarget] = useState(108);
  const [totalDays, setTotalDays] = useState(48);
  const [tapLabel, setTapLabel] = useState('');

  useEffect(() => {
    setActiveTap(getActiveTap());
  }, []);

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setDailyTarget(preset.defaultDailyTarget);
    setTotalDays(preset.defaultTotalDays);
    setTapLabel('');
  };

  const handleStartTap = () => {
    if (!selectedPreset) return;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');

    const tap = {
      presetId: selectedPreset.id,
      name: selectedPreset.name,
      dailyTarget,
      totalDays: selectedPreset.id === 'daily' ? 0 : totalDays,
      startDate: `${y}-${m}-${d}`,
      tapLabel: tapLabel || '',
    };

    clearTapLog();
    saveActiveTap(tap);
    setActiveTap(tap);
    setSelectedPreset(null);
  };

  const handleEndTap = () => {
    clearActiveTap();
    clearTapLog();
    setActiveTap(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-16 pb-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-serif font-bold text-orange-900 text-center mb-2">
          Tap Setup
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Choose a sadhana preset or configure your own tap.
        </p>

        {/* Navkar Sadhana Interactive Session Banner */}
        <section className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-orange-800 via-amber-700 to-orange-900 text-white shadow-xl border border-orange-300/40">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-3xl">🧘</span>
            <div>
              <h2 className="font-serif font-bold text-lg text-amber-100">Navkar Sadhana Session</h2>
              <p className="text-xs text-amber-200/80">Guided jaap counter with Count, Timer, Mala & Sankalp modes</p>
            </div>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed mb-4">
            Set focused intention for your daily chant session. Features real-time count progress, audio Om vibration, and automated session logging.
          </p>
          <button
            onClick={() => setPage('jaap')}
            className="w-full py-2.5 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md hover:bg-amber-300 transition-colors flex items-center justify-center space-x-2"
          >
            <span>🙏</span>
            <span>Start Navkar Sadhana Now</span>
          </button>
        </section>

        {/* Active tap display */}
        {activeTap && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif font-semibold text-green-800 text-sm">Active Tap</h3>
              <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Running</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>{activeTap.name}</strong></p>
              <p>Daily target: {activeTap.dailyTarget} Navkars</p>
              {activeTap.totalDays > 0 && <p>Duration: {activeTap.totalDays} days</p>}
              {activeTap.tapLabel && <p>Label: {activeTap.tapLabel}</p>}
              <p>Started: {activeTap.startDate}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setPage('progress')}
                className="bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-green-700 transition-colors"
              >
                View Progress
              </button>
              <button
                onClick={handleEndTap}
                className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-medium hover:bg-red-200 transition-colors"
              >
                End Tap
              </button>
            </div>
          </div>
        )}

        {/* Presets */}
        <section className="mb-6">
          <h2 className="text-base font-serif font-semibold text-orange-800 mb-3">Tap Presets</h2>
          <div className="space-y-3">
            {TAP_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`
                  w-full text-left rounded-xl p-4 border transition-all
                  ${selectedPreset?.id === preset.id
                    ? 'bg-orange-100 border-orange-300 shadow-md'
                    : 'bg-white border-orange-100 hover:border-orange-200 shadow-sm'}
                `}
              >
                <h3 className="font-serif font-semibold text-gray-800 text-sm mb-1">{preset.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{preset.description}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>Default: {preset.defaultDailyTarget}/day</span>
                  {preset.defaultTotalDays > 0 && <span>{preset.defaultTotalDays} days</span>}
                  {preset.defaultTotalDays === 0 && <span>Ongoing</span>}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Configuration form */}
        {selectedPreset && (
          <section className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm mb-6">
            <h3 className="font-serif font-semibold text-orange-800 text-sm mb-3">
              Configure: {selectedPreset.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Daily Target (Navkars)</label>
                <input
                  type="number"
                  min={1}
                  value={dailyTarget}
                  onChange={e => setDailyTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  = {Math.floor(dailyTarget / 108)} malas + {dailyTarget % 108} Navkars per day
                </p>
              </div>

              {selectedPreset.id !== 'daily' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Total Days</label>
                  <input
                    type="number"
                    min={1}
                    value={totalDays}
                    onChange={e => setTotalDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Tapas Label <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Ayambil + Navkar, Upvas + Navkar"
                  value={tapLabel}
                  onChange={e => setTapLabel(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>

              <button
                onClick={handleStartTap}
                className="w-full bg-orange-600 text-white py-2.5 rounded-full text-sm font-medium hover:bg-orange-700 transition-colors shadow-md"
              >
                {activeTap ? 'Replace Current Tap & Start' : 'Start Tap'}
              </button>
            </div>
          </section>
        )}

        <section className="mt-8 text-center">
          <a
            href="/resources"
            className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Explore Jain Resources
          </a>
        </section>
      </div>
    </div>
  );
};

export default TapSetupPage;
