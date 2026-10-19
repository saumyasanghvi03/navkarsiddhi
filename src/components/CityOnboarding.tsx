"use client";

import React, { useState } from 'react';
import { INDIA_CITIES, setUserCity } from '@/lib/cityStorage';

interface CityOnboardingProps {
  onComplete: (cityId: string) => void;
}

const sortedCities = Object.entries(INDIA_CITIES).sort((a, b) => a[1].name.localeCompare(b[1].name));

export default function CityOnboarding({ onComplete }: CityOnboardingProps) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? sortedCities.filter(([, m]) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.state.toLowerCase().includes(search.toLowerCase())
      )
    : sortedCities;

  const pick = (id: string) => {
    setUserCity(id);
    onComplete(id);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden shadow-xl">
        <div className="p-5 pb-3 text-center">
          <span className="text-3xl block mb-2">🏙️</span>
          <h2 className="text-lg font-semibold text-gray-800">Which city are you from?</h2>
          <p className="text-xs text-gray-500 mt-1">See how your city chants together</p>
        </div>
        <div className="px-4 pb-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search city or state..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-300 focus:outline-none"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filtered.map(([id, meta]) => (
            <button
              key={id}
              onClick={() => pick(id)}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-orange-50 transition-colors flex items-center gap-3"
            >
              <span className="text-orange-500 text-lg">📍</span>
              <div>
                <span className="text-sm font-medium text-gray-800 block">{meta.name}</span>
                <span className="text-[10px] text-gray-400">{meta.state}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">No cities found</p>
          )}
        </div>
      </div>
    </div>
  );
}
