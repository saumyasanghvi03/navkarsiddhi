"use client";

import React from 'react';
import { useNav } from '../lib/navContext';
import { pageTopPaddingClass } from '../lib/nativeWidgetBridge';

const PrivacyPage = () => {
  const { setPage } = useNav();
  const [topPadding] = React.useState(pageTopPaddingClass);

  return (
    <div className={`min-h-screen bg-gradient-to-b from-orange-50 to-white ${topPadding} pb-8 px-4`}>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-serif font-bold text-orange-900 text-center mb-6">
          Your Data
        </h1>

        <div className="bg-white rounded-xl p-5 border border-orange-100 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Local-first & Private</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                All your sadhana data — Navkar counts, mala progress, tap settings, and streaks — is
                stored only on your device using your browser's local storage. Nothing is sent to any server.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">For Personal Sadhana Only</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                This data is used solely for your personal sadhana tracking. It is not shared with anyone,
                not used for advertising, and not analyzed for any purpose other than showing you your progress.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Clear Your Data</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                You can clear all your data at any time by clearing your browser's local storage for this site.
                Go to your browser settings &gt; Site Data &gt; Clear for this site.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Future Sync</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                In the future, we may offer optional login and cross-device sync. This will always be opt-in
                and clearly communicated before any data leaves your device.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setPage('jaap')}
            className="text-orange-600 text-sm font-medium hover:underline"
          >
            Back to Jaap
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
