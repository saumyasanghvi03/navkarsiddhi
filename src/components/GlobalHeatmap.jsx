"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGlobalStats } from '../hooks/useGlobalStats';

// ---------------------------------------------------------------------------
// Country metadata: code → { name, flag, lat, lng }
// Used for world-map dot placement and country labels.
// ---------------------------------------------------------------------------
const COUNTRY_META = {
  IN: { name: 'India',              flag: '🇮🇳', lat:  20.6, lng:  79.0 },
  US: { name: 'United States',      flag: '🇺🇸', lat:  37.1, lng: -95.7 },
  GB: { name: 'United Kingdom',     flag: '🇬🇧', lat:  51.5, lng:  -0.1 },
  CA: { name: 'Canada',             flag: '🇨🇦', lat:  56.1, lng:-106.3 },
  AU: { name: 'Australia',          flag: '🇦🇺', lat: -25.3, lng: 133.8 },
  DE: { name: 'Germany',            flag: '🇩🇪', lat:  51.2, lng:  10.5 },
  FR: { name: 'France',             flag: '🇫🇷', lat:  46.2, lng:   2.2 },
  AE: { name: 'UAE',                flag: '🇦🇪', lat:  23.4, lng:  53.8 },
  SG: { name: 'Singapore',          flag: '🇸🇬', lat:   1.4, lng: 103.8 },
  JP: { name: 'Japan',              flag: '🇯🇵', lat:  36.2, lng: 138.3 },
  CN: { name: 'China',              flag: '🇨🇳', lat:  35.9, lng: 104.2 },
  BR: { name: 'Brazil',             flag: '🇧🇷', lat: -14.2, lng: -51.9 },
  ZA: { name: 'South Africa',       flag: '🇿🇦', lat: -30.6, lng:  22.9 },
  KE: { name: 'Kenya',              flag: '🇰🇪', lat:  -0.0, lng:  37.9 },
  NZ: { name: 'New Zealand',        flag: '🇳🇿', lat: -40.9, lng: 174.9 },
  NL: { name: 'Netherlands',        flag: '🇳🇱', lat:  52.3, lng:   5.3 },
  CH: { name: 'Switzerland',        flag: '🇨🇭', lat:  46.8, lng:   8.2 },
  SE: { name: 'Sweden',             flag: '🇸🇪', lat:  60.1, lng:  18.6 },
  NO: { name: 'Norway',             flag: '🇳🇴', lat:  60.5, lng:   8.5 },
  BE: { name: 'Belgium',            flag: '🇧🇪', lat:  50.5, lng:   4.5 },
  IT: { name: 'Italy',              flag: '🇮🇹', lat:  41.9, lng:  12.6 },
  ES: { name: 'Spain',              flag: '🇪🇸', lat:  40.5, lng:  -3.7 },
  MX: { name: 'Mexico',             flag: '🇲🇽', lat:  23.6, lng:-102.6 },
  AR: { name: 'Argentina',          flag: '🇦🇷', lat: -38.4, lng: -63.6 },
  PK: { name: 'Pakistan',           flag: '🇵🇰', lat:  30.4, lng:  69.3 },
  BD: { name: 'Bangladesh',         flag: '🇧🇩', lat:  23.7, lng:  90.4 },
  LK: { name: 'Sri Lanka',          flag: '🇱🇰', lat:   7.9, lng:  80.8 },
  NP: { name: 'Nepal',              flag: '🇳🇵', lat:  28.4, lng:  84.1 },
  NG: { name: 'Nigeria',            flag: '🇳🇬', lat:   9.1, lng:   8.7 },
  EG: { name: 'Egypt',              flag: '🇪🇬', lat:  26.8, lng:  30.8 },
  TR: { name: 'Turkey',             flag: '🇹🇷', lat:  38.9, lng:  35.2 },
  SA: { name: 'Saudi Arabia',       flag: '🇸🇦', lat:  23.9, lng:  45.1 },
  TH: { name: 'Thailand',           flag: '🇹🇭', lat:  15.9, lng: 100.9 },
  MY: { name: 'Malaysia',           flag: '🇲🇾', lat:   4.2, lng: 108.0 },
  PH: { name: 'Philippines',        flag: '🇵🇭', lat:  12.9, lng: 121.8 },
  KR: { name: 'South Korea',        flag: '🇰🇷', lat:  35.9, lng: 127.8 },
  ID: { name: 'Indonesia',          flag: '🇮🇩', lat:  -0.8, lng: 113.9 },
  RU: { name: 'Russia',             flag: '🇷🇺', lat:  61.5, lng: 105.3 },
  UA: { name: 'Ukraine',            flag: '🇺🇦', lat:  48.4, lng:  31.2 },
  PL: { name: 'Poland',             flag: '🇵🇱', lat:  51.9, lng:  19.1 },
  MA: { name: 'Morocco',            flag: '🇲🇦', lat:  31.8, lng:  -7.1 },
  ET: { name: 'Ethiopia',           flag: '🇪🇹', lat:   9.1, lng:  40.5 },
  GH: { name: 'Ghana',              flag: '🇬🇭', lat:   7.9, lng:  -1.0 },
  CO: { name: 'Colombia',           flag: '🇨🇴', lat:   4.1, lng: -72.3 },
  AT: { name: 'Austria',            flag: '🇦🇹', lat:  47.5, lng:  14.6 },
  PT: { name: 'Portugal',           flag: '🇵🇹', lat:  39.4, lng:  -8.2 },
  FI: { name: 'Finland',            flag: '🇫🇮', lat:  61.9, lng:  25.7 },
  DK: { name: 'Denmark',            flag: '🇩🇰', lat:  56.3, lng:   9.5 },
  IE: { name: 'Ireland',            flag: '🇮🇪', lat:  53.1, lng:  -8.2 },
  IL: { name: 'Israel',             flag: '🇮🇱', lat:  31.5, lng:  34.8 },
  VN: { name: 'Vietnam',            flag: '🇻🇳', lat:  14.1, lng: 108.3 },
  MM: { name: 'Myanmar',            flag: '🇲🇲', lat:  17.1, lng:  96.7 },
  KW: { name: 'Kuwait',             flag: '🇰🇼', lat:  29.3, lng:  47.5 },
  QA: { name: 'Qatar',              flag: '🇶🇦', lat:  25.4, lng:  51.2 },
  BH: { name: 'Bahrain',            flag: '🇧🇭', lat:  25.9, lng:  50.6 },
  OM: { name: 'Oman',               flag: '🇴🇲', lat:  21.0, lng:  57.0 },
  AF: { name: 'Afghanistan',        flag: '🇦🇫', lat:  33.9, lng:  67.7 },
  KZ: { name: 'Kazakhstan',         flag: '🇰🇿', lat:  48.0, lng:  66.9 },
  IQ: { name: 'Iraq',               flag: '🇮🇶', lat:  33.2, lng:  43.7 },
  IR: { name: 'Iran',               flag: '🇮🇷', lat:  32.4, lng:  53.7 },
  UZ: { name: 'Uzbekistan',         flag: '🇺🇿', lat:  41.4, lng:  64.6 },
  TZ: { name: 'Tanzania',           flag: '🇹🇿', lat:  -6.4, lng:  34.9 },
  UG: { name: 'Uganda',             flag: '🇺🇬', lat:   1.4, lng:  32.3 },
  CD: { name: 'DR Congo',           flag: '🇨🇩', lat:  -4.0, lng:  21.8 },
  MZ: { name: 'Mozambique',         flag: '🇲🇿', lat: -18.7, lng:  35.5 },
  MG: { name: 'Madagascar',         flag: '🇲🇬', lat: -18.8, lng:  46.9 },
  AO: { name: 'Angola',             flag: '🇦🇴', lat: -11.2, lng:  17.9 },
  ZW: { name: 'Zimbabwe',           flag: '🇿🇼', lat: -19.0, lng:  29.2 },
  CL: { name: 'Chile',              flag: '🇨🇱', lat: -35.7, lng: -71.5 },
  PE: { name: 'Peru',               flag: '🇵🇪', lat:  -9.2, lng: -75.0 },
  VE: { name: 'Venezuela',          flag: '🇻🇪', lat:   6.4, lng: -66.6 },
  RO: { name: 'Romania',            flag: '🇷🇴', lat:  45.9, lng:  25.0 },
  GR: { name: 'Greece',             flag: '🇬🇷', lat:  39.1, lng:  21.8 },
  CZ: { name: 'Czechia',            flag: '🇨🇿', lat:  49.8, lng:  15.5 },
  HU: { name: 'Hungary',            flag: '🇭🇺', lat:  47.2, lng:  19.5 },
  BY: { name: 'Belarus',            flag: '🇧🇾', lat:  53.7, lng:  28.0 },
  PG: { name: 'Papua New Guinea',   flag: '🇵🇬', lat:  -6.3, lng: 143.9 },
  LY: { name: 'Libya',              flag: '🇱🇾', lat:  26.3, lng:  17.2 },
  SD: { name: 'Sudan',              flag: '🇸🇩', lat:  12.9, lng:  30.2 },
  MN: { name: 'Mongolia',           flag: '🇲🇳', lat:  46.9, lng: 103.8 },
  TW: { name: 'Taiwan',             flag: '🇹🇼', lat:  23.7, lng: 121.0 },
  KH: { name: 'Cambodia',           flag: '🇰🇭', lat:  12.6, lng: 104.9 },
  DZ: { name: 'Algeria',            flag: '🇩🇿', lat:  28.0, lng:   1.7 },
  GT: { name: 'Guatemala',          flag: '🇬🇹', lat:  15.8, lng: -90.2 },
  EC: { name: 'Ecuador',            flag: '🇪🇨', lat:  -1.8, lng: -78.2 },
  BO: { name: 'Bolivia',            flag: '🇧🇴', lat: -16.3, lng: -63.6 },
  PY: { name: 'Paraguay',           flag: '🇵🇾', lat: -23.4, lng: -58.4 },
  UY: { name: 'Uruguay',            flag: '🇺🇾', lat: -32.5, lng: -55.8 },
  CU: { name: 'Cuba',               flag: '🇨🇺', lat:  21.5, lng: -79.5 },
  UNKNOWN: { name: 'Unknown',       flag: '🌍',  lat:   0.0, lng:   0.0 },
};

// All known country centroids (code reused from COUNTRY_META above + extras)
// Used to paint the background world-map dot constellation.
// 'UNKNOWN' is excluded — its centroid (0,0) is in the ocean and would mislead.
const ALL_CENTROIDS = Object.entries(COUNTRY_META)
  .filter(([code]) => code !== 'UNKNOWN')
  .map(([code, d]) => ({ code, lat: d.lat, lng: d.lng }));

// ---------------------------------------------------------------------------
// Utility: equirectangular lat/lng → SVG pixel (viewBox 800 × 400)
// ---------------------------------------------------------------------------
const W = 800;
const H = 400;
const toXY = (lat, lng) => ({
  x: ((lng + 180) / 360) * W,
  y: ((90 - lat) / 180) * H,
});

// ---------------------------------------------------------------------------
// Animated Counter hook
// ---------------------------------------------------------------------------
const useAnimatedCount = (target) => {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (target === null) return;
    const start = prev.current;
    const end = target;
    prev.current = end;
    if (start === end) return;

    const duration = Math.min(1500, Math.abs(end - start) * 2);
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  return display;
};

// ---------------------------------------------------------------------------
// Format large numbers in Indian style (e.g. 1,23,45,678)
// ---------------------------------------------------------------------------
const formatIndian = (n) => {
  if (n === null) return '—';
  return n.toLocaleString('en-IN');
};

// ---------------------------------------------------------------------------
// GlobalHeatmap component
// ---------------------------------------------------------------------------
const GlobalHeatmap = ({ onClose }) => {
  const { globalCount, heatmapData, isLoading } = useGlobalStats();
  const displayCount = useAnimatedCount(globalCount);
  const [tooltip, setTooltip] = useState(null); // { code, name, flag, count, x, y }

  // Sort heatmap by count descending for top-countries list
  const sortedCountries = useMemo(() => {
    return [...heatmapData]
      .map((d) => ({ ...d, meta: COUNTRY_META[d.code] || COUNTRY_META.UNKNOWN }))
      .filter((d) => d.code !== 'UNKNOWN' && d.meta)
      .sort((a, b) => b.count - a.count);
  }, [heatmapData]);

  const maxCount = useMemo(
    () => Math.max(...sortedCountries.map((d) => d.count), 1),
    [sortedCountries]
  );

  // Map for O(1) lookup in the SVG layer
  const heatmapMap = useMemo(() => {
    const m = {};
    heatmapData.forEach((d) => { m[d.code] = d.count; });
    return m;
  }, [heatmapData]);

  // Active country dots with computed positions
  const activeDots = useMemo(() => {
    return sortedCountries.map((d) => {
      const { x, y } = toXY(d.meta.lat, d.meta.lng);
      return { ...d, x, y };
    });
  }, [sortedCountries]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#03061a] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌏</span>
          <span className="text-white font-bold text-lg sm:text-xl tracking-wide font-serif">
            Global Navkar Siddhi
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white/80 transition-colors p-2 rounded-full hover:bg-white/10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Global Counter */}
      <div className="text-center py-3 flex-shrink-0">
        {isLoading ? (
          <div className="text-white/30 text-3xl font-serif animate-pulse">Loading…</div>
        ) : (
          <>
            <div
              className="text-4xl sm:text-6xl font-extrabold font-serif tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #fcd34d, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {formatIndian(displayCount)}
            </div>
            <p className="text-white/50 text-xs sm:text-sm mt-1 tracking-widest uppercase">
              Navkars Completed Worldwide
            </p>
            {/* Pulsing live indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-green-400/70 text-[10px] uppercase tracking-widest">Live</span>
            </div>
          </>
        )}
      </div>

      {/* World Dot Map */}
      <div className="flex-1 relative min-h-0 px-2 sm:px-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          style={{ display: 'block' }}
        >
          {/* Subtle lat/lng grid */}
          {[-60, -30, 0, 30, 60].map((lat) => {
            const { y } = toXY(lat, 0);
            return (
              <line key={`lat-${lat}`} x1={0} y1={y} x2={W} y2={y}
                stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            );
          })}
          {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lng) => {
            const { x } = toXY(0, lng);
            return (
              <line key={`lng-${lng}`} x1={x} y1={0} x2={x} y2={H}
                stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            );
          })}

          {/* Background constellation dots (all countries) */}
          {ALL_CENTROIDS.map(({ code, lat, lng }) => {
            const { x, y } = toXY(lat, lng);
            const hasData = !!heatmapMap[code];
            if (hasData) return null; // rendered in active layer
            return (
              <circle key={`bg-${code}`} cx={x} cy={y} r={2}
                fill="rgba(255,255,255,0.10)" />
            );
          })}

          {/* Active country dots with glow */}
          {activeDots.map(({ code, count, meta, x, y }) => {
            const intensity = count / maxCount;
            const r = 4 + intensity * 14;
            const opacity = 0.4 + intensity * 0.6;
            return (
              <g key={code}
                onMouseEnter={() =>
                  setTooltip({ code, name: meta.name, flag: meta.flag, count, x, y })
                }
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer glow */}
                <circle cx={x} cy={y} r={r * 2.2}
                  fill={`rgba(251,191,36,${opacity * 0.15})`} />
                {/* Inner glow */}
                <circle cx={x} cy={y} r={r * 1.4}
                  fill={`rgba(251,191,36,${opacity * 0.3})`} />
                {/* Core dot */}
                <circle cx={x} cy={y} r={r}
                  fill={`rgba(251,191,36,${opacity})`} />
                {/* Pulse ring for top countries */}
                {intensity > 0.5 && (
                  <circle cx={x} cy={y} r={r * 1.6}
                    fill="none"
                    stroke={`rgba(251,191,36,${opacity * 0.5})`}
                    strokeWidth={1}
                    className="animate-ping"
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  />
                )}
              </g>
            );
          })}

          {/* Tooltip */}
          {tooltip && (() => {
            const tx = Math.min(Math.max(tooltip.x, 60), W - 60);
            const ty = tooltip.y > H / 2 ? tooltip.y - 50 : tooltip.y + 20;
            return (
              <g>
                <rect x={tx - 55} y={ty - 14} width={110} height={28}
                  rx={6} fill="rgba(0,0,0,0.85)" stroke="rgba(251,191,36,0.4)" strokeWidth={1} />
                <text x={tx} y={ty + 3}
                  textAnchor="middle" fill="#fcd34d"
                  fontSize={11} fontFamily="serif" fontWeight="bold">
                  {tooltip.flag} {tooltip.name}: {tooltip.count.toLocaleString()}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Top Countries */}
      <div className="flex-shrink-0 border-t border-white/10 px-4 sm:px-6 py-3">
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">
          Top Chanting Regions
        </p>
        {sortedCountries.length === 0 ? (
          <p className="text-white/20 text-xs text-center py-2">
            {isLoading ? 'Loading…' : 'No data yet — start chanting! 🙏'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 max-h-28 overflow-y-auto">
            {sortedCountries.slice(0, 10).map(({ code, count, meta }) => (
              <div key={code} className="flex items-center gap-2">
                <span className="text-base w-6 flex-shrink-0">{meta.flag}</span>
                <span className="text-white/70 text-xs w-24 truncate">{meta.name}</span>
                <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      background: 'linear-gradient(90deg, #f59e0b, #fcd34d)',
                    }}
                  />
                </div>
                <span className="text-amber-400/80 text-xs font-bold w-14 text-right flex-shrink-0">
                  {count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalHeatmap;
