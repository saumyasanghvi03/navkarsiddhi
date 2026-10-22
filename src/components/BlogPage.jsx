"use client";

import React from 'react';
import { useNav } from '../lib/navContext';
import { pageTopPaddingClass } from '../lib/nativeWidgetBridge';

const featureUpdates = [
  {
    date: '2026-10-15',
    version: 'v2.2',
    emoji: '🤖',
    title: 'AI Assistant Integration — Log Navkars via Claude & ChatGPT',
    tags: ['Feature', 'AI'],
    highlights: [
      '🤖 Tell Claude or ChatGPT "I did 3 malas today" — it logs it',
      '📡 OpenAPI spec live at navkarsiddhi.vercel.app/.well-known/openapi.yaml',
      '🙏 AI responds with "Jai Jinendra" after logging',
      '🌍 Works on any device — phone, desktop, web',
    ],
    body: 'Navkar Siddhi now speaks AI. Connect the app as a tool in Claude or ChatGPT and say "I completed 2 malas of Navkar Mantra today" — the AI parses it, calls the API, and logs your count. No app to open. Works wherever you use your AI assistant.',
    accent: 'from-blue-600 to-cyan-400',
    hot: true,
  },
  {
    date: '2026-10-15',
    version: 'v2.1',
    emoji: '🎮',
    title: 'Karma Bubble Game — Pop Karma, Count Navkars',
    tags: ['Feature', 'Game'],
    highlights: [
      '🎮 Tap floating karma bubbles to count navkars',
      '😡 5 Jain kashaya types: Krodh · Maan · Maya · Lobh · Moha',
      '🎯 Mala flash on every 108/36 pops',
      '📿 Counts feed straight into your main Jaap total',
    ],
    body: 'The Game tab is here. Floating karma bubbles — anger, ego, deceit, greed, attachment — drift across the screen. Tap to pop one = one Navkar counted. Particle burst, mala celebration, live scoreboard. Set 36 or 108 mala size. Pure sadhana with dopamine.',
    accent: 'from-purple-600 to-indigo-400',
    hot: true,
  },
  {
    date: '2026-10-15',
    version: 'v2.2',
    emoji: '💛',
    title: 'Smart Notifications — Now Personalised Like Never Before',
    tags: ['Feature', 'Android'],
    highlights: [
      '💛 Girlfriend-style Hinglish reminders — spicy, warm, Jain ethical',
      '🧠 Title + message change based on your streak tier & today\'s count',
      '🔥 Streak 7 / 14 / 21 day milestones get their own tone',
      '📊 Zero-navkar day? Mid-mala progress? Mala done? All handled differently',
    ],
    body: 'Notifications that actually know you. Three styles per slot — classic, spicy, and girlfriend-mode Hinglish — all dynamically personalised. At streak 21 your reminder says "tu Pratikraman level pe aa gaya." At zero navkars it says "poora din gaya aur ek navkar nahi? 😒". Mid-mala it tells you exactly how many taps are left. The message adapts, every time.',
    accent: 'from-pink-500 to-rose-400',
    hot: true,
  },
  {
    date: '2026-10-15',
    version: 'v2.1',
    emoji: '🔔',
    title: 'Smart Daily Reminders — Morning · Chauvihar · Evening · Night',
    tags: ['Feature', 'Android'],
    highlights: [
      '🌅 4 daily slots: morning, 6pm chauvihar, evening, bedtime',
      '📊 Messages use your real count, mala & streak data',
      '🧠 Times adapt to your actual app usage pattern',
      '🌐 Web push for webapp + PWA (not just APK)',
    ],
    body: 'Daily reminders that know your practice. 50+ messages across 4 pools — tailored to your streak, today\'s count, and time of day. The 6pm chauvihar slot reminds you before the food/water cutoff. Learns your usage pattern after 3 days and adjusts the send time. Now works on web too — subscribe once, get reminders everywhere.',
    accent: 'from-orange-600 to-amber-400',
  },
  {
    date: '2026-10-15',
    version: 'v2.1',
    emoji: '📱',
    title: '+1 Navkar from Any Widget — No App Open',
    tags: ['Android', 'Widget'],
    highlights: [
      '📱 Orange tap button on all 5 home screen widgets',
      '⚡ Counts instantly via BroadcastReceiver',
      '🔄 Widget updates in real-time after each tap',
      '🏠 Works from launcher — no app needed',
    ],
    body: 'All five Android home screen widgets — Navkar counter, streak, target bar, mala ring, and heatmap — now have an orange +1 Navkar button. Tap it from your home screen and the count goes up instantly. No app open needed. The BroadcastReceiver handles it in the background and updates all widgets live.',
    accent: 'from-green-600 to-emerald-400',
    hot: true,
  },
  {
    date: '2026-10-15',
    version: 'v2.0',
    emoji: '🔒',
    title: 'Screen Stays On — Mid-Mala, No Interruptions',
    tags: ['Android', 'Feature'],
    highlights: [
      '🔒 WakeLock holds screen awake during jaap',
      '🔄 Re-locks when you come back to the app',
      '✅ Works in the APK and web PWA',
    ],
    body: 'Your screen used to dim mid-mala and break your flow. Not anymore. The moment you start jaap the screen locks on — and if you switch apps and come back, it re-acquires automatically.',
    accent: 'from-violet-600 to-purple-400',
    hot: true,
  },
  {
    date: '2026-10-15',
    version: 'v2.0',
    emoji: '📳',
    title: 'Volume Down = One Navkar',
    tags: ['Android', 'Feature'],
    highlights: [
      '📳 Hardware Volume ↓ button counts',
      '👁️ Eyes closed, hands free, fully present',
      '⚡ Zero latency — native key intercept',
    ],
    body: 'Put the phone in your pocket or hold it face-down. Press Volume Down — one Navkar counted. No screen, no tapping, no breaking concentration. Pure sadhana.',
    accent: 'from-orange-600 to-amber-400',
    hot: true,
  },
  {
    date: '2026-10-15',
    version: 'v2.0',
    emoji: '🪔',
    title: 'About Page — Revamped for JainZ',
    tags: ['UI', 'Feature'],
    highlights: [
      '🪔 Five Pads — Sanskrit · Hindi · Gujarati',
      '🏗️ JainZBharat vision & community',
      '📖 How-to guide + accordion sections',
      '✨ New saffron hero design',
    ],
    body: 'The About page is now a proper introduction to Jainism for the next generation — the Five Pads with full transliteration and meaning, JainZBharat\'s mission, and a step-by-step guide to doing Navkar Siddhi Tap right.',
    accent: 'from-amber-500 to-yellow-400',
    hot: true,
  },
  {
    date: '2026-10-15',
    version: 'v2.0',
    emoji: '🚀',
    title: 'Android Native — Full Power Unlock',
    tags: ['Android', 'Feature'],
    highlights: [
      '⌚ +1 Navkar from wrist notification',
      '⚡ Quick Settings tile in shade',
      '🏠 Long-press launcher shortcuts',
      '🛕 Submit Temple — fixed in APK',
    ],
    body: 'Wrist companion action button, Quick Settings tile, long-press launcher shortcuts, and Derasar Finder\'s Submit Temple fixed in the APK — all shipped in v2.0.',
    accent: 'from-green-600 to-emerald-400',
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
  const [topPadding] = React.useState(() => pageTopPaddingClass());

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-10">

      {/* Hero */}
      <div className={`bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400 ${topPadding} pb-12 px-4 text-center relative overflow-hidden`}>
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
          <span className="text-white text-xs font-semibold">v2.2 live now 🔥</span>
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

          {/* Android APK download */}
          <a
            href="/navkar-siddhi-v2.apk"
            download="navkar-siddhi.apk"
            className="flex items-center justify-center gap-2 w-full bg-white border-2 border-green-500 text-green-700 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-green-50 transition-all"
          >
            <span className="text-base">📦</span>
            Download Android APK — v2.2
            <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold ml-1">com.navkarsiddhi.app</span>
          </a>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Sideload on Android · Settings → Allow unknown apps → Tap APK
          </p>

          <p className="text-[11px] text-gray-400">Jai Jinendra 🙏 · Made with love by JainZBharat</p>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
