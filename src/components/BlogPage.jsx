"use client";

import React from 'react';
import { useNav } from '../lib/navContext';
import { pageTopPaddingClass } from '../lib/nativeWidgetBridge';

const featureUpdates = [
  {
    date: '2026-10-15',
    version: 'v2.0',
    emoji: '🚀',
    title: 'Android Native — Full Power Unlock',
    tags: ['Android', 'Feature'],
    highlights: [
      '📳 Volume Down = count (no hands)',
      '⌚ +1 Navkar from wrist notification',
      '⚡ Quick Settings tile in shade',
      '🔒 Screen stays on mid-mala',
      '🏠 Long-press shortcuts on home screen',
    ],
    body: 'Five native Android superpowers shipped in one drop. Count without touching the screen, tap from your watch, access from the shade, never lose your place when the screen dims — plus launcher shortcuts that get you straight to Jaap or Progress.',
    accent: 'from-orange-500 to-amber-400',
    hot: true,
  },
  {
    date: '2026-09-29',
    version: 'v1.5',
    emoji: '✨',
    title: 'Muhurat · Voice Mantra · Color Malas',
    tags: ['Feature', 'UI'],
    highlights: [
      '🕐 Auspicious Muhurat badge in Jaap',
      '🔊 Read mantra aloud — EN / HI / GU',
      '🎨 5-color mala bead cycle',
      '🏷️ Nav tabs always show labels',
    ],
    body: 'Your Jaap screen got smarter and more alive. Know the right time to chant, hear the mantra in your language, and watch your mala beads change color as you go.',
    accent: 'from-rose-500 to-pink-400',
  },
  {
    date: '2026-09-29',
    version: 'v1.4',
    emoji: '📱',
    title: 'Real Android App — No Browser Drama',
    tags: ['Android', 'PWA'],
    highlights: [
      '📦 Standalone APK — works offline',
      '🔑 Stable signing → clean updates',
      '🏠 Home screen widget (count + streak)',
      '⌚ Live mala progress on smartwatch',
    ],
    body: 'No more "tab that kinda works." Navkar Siddhi ships as a proper Android app with its own bundle, widget, and watch companion — yours to keep even offline.',
    accent: 'from-green-500 to-emerald-400',
  },
  {
    date: '2026-09-29',
    version: 'v1.3',
    emoji: '🕌',
    title: 'Derasar Finder — Mumbai & Thane',
    tags: ['Community', 'Feature'],
    highlights: [
      '📍 Nearby Shwetambar Jain temples',
      '🗺️ Directions + darshan details',
      '➕ Community can submit new temples',
    ],
    body: 'Find any Jain temple near you. Built for the community, by the community — submit a new derasar straight from the app.',
    accent: 'from-cyan-500 to-teal-400',
  },
  {
    date: '2026-09-29',
    version: 'v1.2',
    emoji: '🌅',
    title: 'Chovihar Reminder + Live Panchang',
    tags: ['Offline', 'Feature'],
    highlights: [
      '🔔 Sunset push notification (Android)',
      '📅 Live Tithi from today\'s Panchang',
      '💾 Persistent storage — no silent data loss',
    ],
    body: 'Never miss your Chovihar cutoff. Get a push reminder near sunset, see the real Tithi today, and rest easy knowing your sadhana history is safely stored.',
    accent: 'from-violet-500 to-purple-400',
  },
];

const tagColors = {
  Android: 'bg-green-100 text-green-700',
  PWA: 'bg-blue-100 text-blue-700',
  Offline: 'bg-amber-100 text-amber-700',
  Community: 'bg-cyan-100 text-cyan-700',
  UI: 'bg-pink-100 text-pink-700',
  Feature: 'bg-orange-100 text-orange-700',
};

const BlogPage = () => {
  const { setPage } = useNav();
  const [topPadding] = React.useState(pageTopPaddingClass);

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-10">

      {/* Hero */}
      <div className={`bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400 ${topPadding} pt-8 pb-12 px-4 text-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 10%, #fff 0%, transparent 50%)' }} />
        <div className="text-5xl mb-3 relative">📿</div>
        <h1 className="text-2xl font-serif font-bold text-white mb-1 tracking-tight relative">
          What&apos;s New
        </h1>
        <p className="text-orange-100 text-sm leading-relaxed max-w-xs mx-auto relative">
          Built for the next generation of JainZ — dharma meets tech.
        </p>
        <div className="mt-4 relative inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
          <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
          <span className="text-white text-xs font-semibold">v2.0 live now 🔥</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-5">

        <div className="space-y-4">
          {featureUpdates.map((update, i) => (
            <article
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-100/60"
            >
              {/* Card header stripe */}
              <div className={`bg-gradient-to-r ${update.accent} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{update.emoji}</span>
                  <span className="text-white text-xs font-bold tracking-wider uppercase opacity-90">{update.version}</span>
                  {update.hot && (
                    <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">LATEST</span>
                  )}
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {update.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] bg-white/25 text-white px-2 py-0.5 rounded-full font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card body */}
              <div className="px-4 py-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{update.title}</h3>
                  <time className="text-[10px] text-gray-400 font-mono whitespace-nowrap mt-0.5 flex-shrink-0">{update.date}</time>
                </div>

                {/* Highlights chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {update.highlights.map((h, j) => (
                    <span key={j} className="text-[11px] bg-orange-50 text-orange-700 border border-orange-100 px-2 py-1 rounded-lg font-medium leading-none">
                      {h}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">{update.body}</p>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8 space-y-3">
          <button
            onClick={() => setPage('jaap')}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md hover:from-orange-700 hover:to-amber-600 transition-all"
          >
            🪔 Begin Jaap
          </button>
          <p className="text-[11px] text-gray-400">Jai Jinendra 🙏 · Made with love by JainZBharat</p>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
