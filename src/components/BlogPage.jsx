"use client";

import React from 'react';
import { useNav } from '../lib/navContext';

const featureUpdates = [
  {
    date: '2026-02-24',
    title: 'Auto Offline Mode & Audio Fix',
    tags: ['PWA', 'Audio', 'Offline'],
    body: 'The app now works fully offline as a mobile webapp. The service worker caches all assets so you can continue your sadhana without internet. An offline banner appears automatically when disconnected. The OM soundscape no longer auto-plays on startup — it defaults to silent and remembers your preference.',
  },
  {
    date: '2026-02-24',
    title: 'JainZBharat Initiative on About Page',
    tags: ['Content'],
    body: 'Added the JainZBharat initiative intro to the About page — a youth-driven mission to strengthen Jain identity through disciplined action, ethical leadership, and cultural continuity. Founded by Saumya Jignesh Sanghvi.',
  },
  {
    date: '2026-02-23',
    title: 'Gujarati Language Support',
    tags: ['Language', 'Accessibility'],
    body: 'Added full Gujarati language support for the Navkar Mantra. You can now cycle between English, Hindi, and Gujarati using the language toggle in the top-right corner during jaap.',
  },
  {
    date: '2026-02-23',
    title: 'Contact Page',
    tags: ['UI'],
    body: 'A new Contact page is now available from the navigation bar, making it easy to reach out with feedback or questions.',
  },
  {
    date: '2026-02-22',
    title: 'Mala Size Selection',
    tags: ['Feature'],
    body: 'You can now choose between 9, 27, 36, or 108 beads per mala from the bottom controls. The progress grid dynamically adjusts to show boxes based on your selected mala size.',
  },
];

const tagColors = {
  PWA: 'bg-blue-100 text-blue-700',
  Audio: 'bg-purple-100 text-purple-700',
  Offline: 'bg-amber-100 text-amber-700',
  Content: 'bg-green-100 text-green-700',
  Language: 'bg-teal-100 text-teal-700',
  Accessibility: 'bg-indigo-100 text-indigo-700',
  UI: 'bg-pink-100 text-pink-700',
  Feature: 'bg-orange-100 text-orange-700',
};

const BlogPage = () => {
  const { setPage } = useNav();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-16 pb-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-serif font-bold text-orange-900 text-center mb-2">
          Feature Updates
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
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
