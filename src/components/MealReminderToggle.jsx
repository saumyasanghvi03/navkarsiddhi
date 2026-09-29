"use client";

import React, { useState, useEffect } from 'react';
import {
  isMealReminderSupported,
  getMealReminderPref,
  enableMealReminders,
  disableMealReminders,
} from '../lib/pushNotifications';

const MealReminderToggle = () => {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    isMealReminderSupported().then(setSupported);
    setEnabled(getMealReminderPref());
  }, []);

  const handleToggle = async () => {
    setError('');
    setLoading(true);
    try {
      if (enabled) {
        await disableMealReminders();
        setEnabled(false);
      } else {
        const result = await enableMealReminders();
        if (result.ok) {
          setEnabled(true);
        } else {
          setError(result.error || 'Could not enable reminders.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <section className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm mb-6">
        <h3 className="font-serif font-semibold text-orange-800 text-sm mb-1">🔔 Chovihar Reminder</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Currently available on Android only. A reminder near sunset — the Chovihar cutoff for food and water — will show up here once it's supported on your device.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-serif font-semibold text-orange-800 text-sm">🔔 Chovihar Reminder</h3>
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
        Get a notification near sunset — the Chovihar cutoff for food and water — computed from today's Panchang. Works even when the app is closed.
      </p>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </section>
  );
};

export default MealReminderToggle;
