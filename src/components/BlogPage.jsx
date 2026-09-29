"use client";

import React from 'react';
import { useNav } from '../lib/navContext';
import { pageTopPaddingClass } from '../lib/nativeWidgetBridge';

const featureUpdates = [
  {
    date: '2026-09-29',
    title: 'New Features & Improvements',
    tags: ['Feature', 'UI'],
    body: 'A batch of smaller updates: a badge on the Jaap screen now shows today\'s current or next auspicious Muhurat at a glance; a new speaker button reads the Navkar Mantra aloud in English, Hindi, or Gujarati; mala beads cycle through five colors as you count instead of one flat color; navigation tabs always show their labels; and the two reset buttons are now one, safer button.',
  },
  {
    date: '2026-09-29',
    title: 'Android App (APK) Now Available',
    tags: ['Feature', 'PWA'],
    body: 'Navkar Siddhi now ships as a proper Android app, not just a browser tab wrapped in a shell — it bundles its own build and works even without loading the live site. Signing is now stable across updates, so new versions install cleanly over the old one instead of asking you to uninstall first.',
  },
  {
    date: '2026-09-29',
    title: 'Derasar (Temple) Finder',
    tags: ['Feature', 'Community'],
    body: 'Find nearby Shwetambar Jain temples across Mumbai and Thane, with directions and darshan details. The community can contribute new temple listings directly from the app.',
  },
  {
    date: '2026-09-29',
    title: 'Chovihar Sunset Reminder',
    tags: ['Feature', 'Offline'],
    body: 'A push notification reminds you near sunset when the Chovihar cutoff for food and water is approaching, computed from today\'s Panchang. Currently available on Android.',
  },
  {
    date: '2026-09-29',
    title: 'Live Panchang & Protected Progress',
    tags: ['Feature', 'Offline'],
    body: 'Panchang now shows the correct Tithi for each day instead of a static fallback. Your Navkar history is also better protected against silent data loss — the app now requests persistent browser storage and offers to install itself to your home screen for extra safety.',
  },
];

const tagColors = {
  AI: 'bg-violet-100 text-violet-700',
  PWA: 'bg-blue-100 text-blue-700',
  Audio: 'bg-purple-100 text-purple-700',
  Offline: 'bg-amber-100 text-amber-700',
  Content: 'bg-green-100 text-green-700',
  Community: 'bg-cyan-100 text-cyan-700',
  Language: 'bg-teal-100 text-teal-700',
  Accessibility: 'bg-indigo-100 text-indigo-700',
  UI: 'bg-pink-100 text-pink-700',
  Feature: 'bg-orange-100 text-orange-700',
};

const BlogPage = () => {
  const { setPage } = useNav();
  const [topPadding] = React.useState(pageTopPaddingClass);

  return (
    <div className={`min-h-screen bg-gradient-to-b from-orange-50 to-white ${topPadding} pb-8 px-4`}>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-serif font-bold text-orange-900 text-center mb-2">
          Feature Updates
        </h1>
        <p className="text-sm text-gray-600 text-center mb-4 leading-relaxed">
          See what&apos;s new in Navkar Siddhi Tap. We continuously improve the app to
          support your sadhana journey.
        </p>

        <div className="space-y-4">
          {featureUpdates.map((update, i) => (
            <article
              key={i}
              className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <time className="text-xs text-gray-400 font-mono">{update.date}</time>
                <div className="flex gap-1 flex-wrap justify-end">
                  {update.tags.map(tag => (
                    <span
                      key={tag}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tagColors[tag] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="text-sm font-serif font-semibold text-orange-800 mb-1">
                {update.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{update.body}</p>
            </article>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setPage('jaap')}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-orange-700 transition-colors shadow-md"
          >
            Back to Jaap
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
