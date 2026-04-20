"use client";

import React, { useState } from 'react';
import { useNav } from '../lib/navContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const JainVibesPage = () => {
  const { setPage } = useNav();
  const isOnline = useOnlineStatus();

  const [vibe, setVibe] = useState('');
  const [vibeLoading, setVibeLoading] = useState(false);
  const [vibeError, setVibeError] = useState('');

  const fetchVibe = async () => {
    setVibeLoading(true);
    setVibeError('');
    try {
      const res = await fetch('/api/ai/vibe', { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVibe(data.vibe);
    } catch (err) {
      setVibeError(err instanceof Error ? err.message : 'Could not generate vibe. Please try again.');
    } finally {
      setVibeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-16 pb-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-orange-900 mb-2">
            Jain Vibes ✨
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            AI-powered spiritual guidance rooted in Jain philosophy and the Navkar Mantra.
          </p>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="mb-5 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
            <span className="text-base">📵</span>
            <span>You&apos;re offline. AI features are unavailable — reconnect to get your vibe or ask the Guru.</span>
          </div>
        )}

        {/* Daily Vibe */}
        <div className="mb-6 bg-white rounded-xl p-5 border border-orange-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🌅</span>
            <h2 className="text-sm font-bold text-gray-900">Today&apos;s Jain Vibe</h2>
          </div>

          {!vibe && !vibeLoading && (
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Tap below for your daily Jain-inspired spiritual affirmation.
            </p>
          )}

          {vibeLoading && (
            <div className="flex items-center gap-2 text-xs text-orange-600 mb-4">
              <SpinnerIcon />
              <span>Channelling your vibe…</span>
            </div>
          )}

          {vibe && !vibeLoading && (
            <p className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
              {vibe}
            </p>
          )}

          {vibeError && (
            <p className="text-xs text-red-500 mb-3">{vibeError}</p>
          )}

          <button
            onClick={fetchVibe}
            disabled={vibeLoading || !isOnline}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {vibeLoading
              ? <><SpinnerIcon /><span>Loading…</span></>
              : vibe ? '🔄 New Vibe' : '✨ Get My Vibe'}
          </button>
        </div>

        {/* Ask the Guru — AI Studio */}
        <div className="mb-6 bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-4 pb-3">
            <span className="text-lg">🧘</span>
            <h2 className="text-sm font-bold text-gray-900">Ask the Guru</h2>
          </div>
          <iframe
            src="https://ai.studio/apps/de0a9441-ca1b-4b1c-9d6b-321240ece11b"
            title="Ask the Guru — AI Studio"
            allow="microphone; camera; clipboard-write; fullscreen"
            loading="lazy"
            className="w-full"
            style={{ height: 600, border: 'none' }}
          />
        </div>

        {/* Jain Vibes Playlist by JainZBharat */}
        <div className="mb-6 bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-4 pb-3">
            <span className="text-lg">🎵</span>
            <h2 className="text-sm font-bold text-gray-900">Jain Vibes Playlist</h2>
            <span className="ml-auto text-[10px] text-gray-400">by JainZBharat</span>
          </div>
          <iframe
            src="https://open.spotify.com/embed/playlist/4WsjlXMfJzb71wl6Krf4L4?utm_source=generator"
            title="Jain Vibes by JainZBharat"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full"
            style={{ height: 352, border: 'none' }}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setPage('jaap')}
            className="text-orange-600 text-xs font-medium hover:underline"
          >
            Back to Jaap
          </button>
        </div>

      </div>
    </div>
  );
};

export default JainVibesPage;
