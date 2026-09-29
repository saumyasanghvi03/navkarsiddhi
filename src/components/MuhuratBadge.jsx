"use client";

import React, { useState, useEffect } from 'react';
import { getCurrentOrNextAuspiciousSlot } from '../lib/muhuratData';

/**
 * Small chip surfacing today's best (Shubh-quality) Choghadiya slot — the
 * same data the full Muhurat modal already computes, just not visible
 * anywhere until you open that modal. Refreshes every minute so "now" stays
 * accurate through the day without needing a page reload.
 */
const MuhuratBadge = ({ onClick }) => {
  const [slot, setSlot] = useState(() => getCurrentOrNextAuspiciousSlot());

  useEffect(() => {
    const id = setInterval(() => setSlot(getCurrentOrNextAuspiciousSlot()), 60000);
    return () => clearInterval(id);
  }, []);

  if (!slot) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs text-gray-600 shadow-sm border border-orange-100 hover:bg-orange-50 transition-colors max-w-full"
      title="View full Muhurat & Choghadiya"
    >
      <span className="flex-shrink-0">🕐</span>
      <span className="truncate">
        {slot.isCurrent ? 'Auspicious now:' : 'Next auspicious:'}{' '}
        <strong style={{ color: slot.color }}>{slot.nameEn}</strong>
        {' '}
        {slot.isCurrent ? `until ${slot.endTime}` : `at ${slot.startTime}`}
      </span>
    </button>
  );
};

export default MuhuratBadge;
