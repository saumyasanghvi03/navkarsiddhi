"use client";

import React, { useState, useEffect } from 'react';
import {
  isWristNotifSupported,
  getWristNotifPref,
  enableWristNotifications,
  disableWristNotifications,
} from '../lib/wristNotifications';

const WristNotificationToggle = () => {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSupported(isWristNotifSupported());
    setEnabled(getWristNotifPref());
  }, []);

  const handleToggle = async () => {
    setError('');
    setLoading(true);
    try {
      if (enabled) {
        await disableWristNotifications();
        setEnabled(false);
      } else {
        const result = await enableWristNotifications();
        if (result.ok) {
          setEnabled(true);
        } else {
          setError(result.error || 'Could not enable wrist notifications.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <section className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm mb-6">
        <h3 className="font-serif font-semibold text-orange-800 text-sm mb-1">⌚ Wrist Companion</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Currently available in the Navkar Siddhi Android app. Once enabled, your live Jaap and Mala
          count shows up on any smartwatch that mirrors phone notifications — NoiseFit, boAt, Amazfit,
          Galaxy Watch, and most others.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-serif font-semibold text-orange-800 text-sm">⌚ Wrist Companion</h3>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
            enabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {loading ? '…' : enabled ? 'Enabled — tap to turn off' : 'Enable'}
        </button>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        Shows a live, silently-updating notification with today's Navkar and Mala count, so it mirrors
        straight to your watch face as you tap — works with any smartwatch's notification mirroring,
        including the NoiseFit Halo Plus.
      </p>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </section>
  );
};

export default WristNotificationToggle;
