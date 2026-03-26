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
// India city metadata: name → { lat, lng }
// Used for India-focused city dot map.
// ---------------------------------------------------------------------------
const INDIA_CITY_META = {
  'Mumbai':        { lat: 19.08, lng: 72.88 },
  'Delhi':         { lat: 28.61, lng: 77.23 },
  'Bengaluru':     { lat: 12.97, lng: 77.59 },
  'Bangalore':     { lat: 12.97, lng: 77.59 },
  'Hyderabad':     { lat: 17.39, lng: 78.49 },
  'Chennai':       { lat: 13.08, lng: 80.27 },
  'Kolkata':       { lat: 22.57, lng: 88.36 },
  'Pune':          { lat: 18.52, lng: 73.86 },
  'Ahmedabad':     { lat: 23.03, lng: 72.59 },
  'Surat':         { lat: 21.17, lng: 72.83 },
  'Jaipur':        { lat: 26.91, lng: 75.79 },
  'Lucknow':       { lat: 26.85, lng: 80.95 },
  'Kanpur':        { lat: 26.44, lng: 80.33 },
  'Nagpur':        { lat: 21.15, lng: 79.09 },
  'Indore':        { lat: 22.72, lng: 75.86 },
  'Thane':         { lat: 19.22, lng: 72.98 },
  'Bhopal':        { lat: 23.26, lng: 77.41 },
  'Visakhapatnam': { lat: 17.69, lng: 83.22 },
  'Patna':         { lat: 25.61, lng: 85.14 },
  'Vadodara':      { lat: 22.31, lng: 73.18 },
  'Coimbatore':    { lat: 11.02, lng: 76.96 },
  'Rajkot':        { lat: 22.30, lng: 70.80 },
  'Chandigarh':    { lat: 30.74, lng: 76.79 },
  'Mysuru':        { lat: 12.30, lng: 76.65 },
  'Mysore':        { lat: 12.30, lng: 76.65 },
  'Ranchi':        { lat: 23.34, lng: 85.31 },
  'Kochi':         { lat:  9.93, lng: 76.27 },
  'Guwahati':      { lat: 26.19, lng: 91.74 },
  'Amritsar':      { lat: 31.63, lng: 74.87 },
  'Agra':          { lat: 27.18, lng: 78.01 },
  'Varanasi':      { lat: 25.32, lng: 83.00 },
  'Nashik':        { lat: 19.99, lng: 73.79 },
  'Meerut':        { lat: 28.98, lng: 77.71 },
  'Ludhiana':      { lat: 30.90, lng: 75.85 },
  'Jodhpur':       { lat: 26.29, lng: 73.02 },
  'Madurai':       { lat:  9.93, lng: 78.12 },
  'Raipur':        { lat: 21.25, lng: 81.63 },
  'Kota':          { lat: 25.18, lng: 75.84 },
  'Gwalior':       { lat: 26.22, lng: 78.18 },
  'Vijayawada':    { lat: 16.51, lng: 80.62 },
  'Tiruchirappalli': { lat: 10.79, lng: 78.70 },
  'Hubli':         { lat: 15.36, lng: 75.12 },
  'Dharwad':       { lat: 15.46, lng: 75.01 },
  'Bareilly':      { lat: 28.36, lng: 79.43 },
  'Moradabad':     { lat: 28.84, lng: 78.77 },
  'Aligarh':       { lat: 27.88, lng: 78.08 },
  'Jabalpur':      { lat: 23.18, lng: 79.95 },
  'Srinagar':      { lat: 34.08, lng: 74.80 },
  'Aurangabad':    { lat: 19.88, lng: 75.34 },
  'Dehradun':      { lat: 30.32, lng: 78.03 },
  'Solapur':       { lat: 17.69, lng: 75.91 },
  'Udaipur':       { lat: 24.57, lng: 73.69 },
  'Jamshedpur':    { lat: 22.80, lng: 86.19 },
  'Bhubaneswar':   { lat: 20.30, lng: 85.82 },
  'Tirupati':      { lat: 13.63, lng: 79.42 },
  'Noida':         { lat: 28.54, lng: 77.39 },
  'Gurgaon':       { lat: 28.46, lng: 77.03 },
  'Gurugram':      { lat: 28.46, lng: 77.03 },
  'Faridabad':     { lat: 28.41, lng: 77.31 },
};

// India bounding box (with a small margin for display)
const INDIA_BOUNDS = { minLat: 7.5, maxLat: 37.5, minLng: 67.5, maxLng: 97.5 };
const IW = 300;
const IH = 400;

const toIndiaXY = (lat, lng) => ({
  x: ((lng - INDIA_BOUNDS.minLng) / (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng)) * IW,
  y: ((INDIA_BOUNDS.maxLat - lat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) * IH,
});

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
// IndiaView component — city dot map + ranked city list
// ---------------------------------------------------------------------------
const IndiaView = ({ indiaCityData, indiaTotal, isLoading }) => {
  const [tooltip, setTooltip] = useState(null);

  const sortedCities = useMemo(() => {
    return [...indiaCityData].sort((a, b) => b.count - a.count);
  }, [indiaCityData]);

  const topCity = sortedCities[0] || null;

  const maxCityCount = useMemo(
    () => Math.max(...sortedCities.map((d) => d.count), 1),
    [sortedCities]
  );

  // Merge Firestore city names with coordinate metadata (case-insensitive fallback)
  const cityDots = useMemo(() => {
    return sortedCities
      .map((d) => {
        const meta = INDIA_CITY_META[d.city] ||
          Object.entries(INDIA_CITY_META).find(
            ([k]) => k.toLowerCase() === d.city.toLowerCase()
          )?.[1];
        if (!meta) return null;
        const { x, y } = toIndiaXY(meta.lat, meta.lng);
        return { ...d, x, y };
      })
      .filter(Boolean);
  }, [sortedCities]);

  // Background city dots (cities with no data yet)
  const bgCityDots = useMemo(() => {
    const activeCitiesLower = new Set(sortedCities.map((d) => d.city.toLowerCase()));
    return Object.entries(INDIA_CITY_META)
      .filter(([name]) => !activeCitiesLower.has(name.toLowerCase()))
      .map(([name, meta]) => {
        const { x, y } = toIndiaXY(meta.lat, meta.lng);
        return { name, x, y };
      });
  }, [sortedCities]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* India total count — always visible, derived from existing country-level data */}
      {(indiaTotal !== null && indiaTotal !== undefined) && (
        <div className="flex-shrink-0 mx-4 mb-2 flex items-center gap-3 rounded-xl px-4 py-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-xl">🇮🇳</span>
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-[10px] uppercase tracking-widest">
              Total Navkars from India
            </p>
          </div>
          <span className="text-amber-300 font-extrabold text-lg sm:text-xl font-serif flex-shrink-0">
            {formatIndian(indiaTotal)}
          </span>
        </div>
      )}

      {/* Top city banner */}
      {topCity && (
        <div className="flex-shrink-0 mx-4 mb-2 rounded-xl px-4 py-2 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(249,115,22,0.10))', border: '1px solid rgba(251,191,36,0.25)' }}>
          <span className="text-2xl">🏆</span>
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-[10px] uppercase tracking-widest">
              Top Chanting City in India
            </p>
            <p className="text-amber-400 font-bold text-base sm:text-lg font-serif truncate">
              {topCity.city}
            </p>
          </div>
          <span className="text-amber-300 font-extrabold text-lg sm:text-xl font-serif flex-shrink-0">
            {formatIndian(topCity.count)}
          </span>
        </div>
      )}

      {/* India city dot map */}
      <div className="flex-1 relative min-h-0 flex items-center justify-center px-2">
        <svg
          viewBox={`0 0 ${IW} ${IH}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full"
          style={{ maxHeight: '100%', maxWidth: '100%', display: 'block' }}
        >
          {/* Subtle grid lines within India bounds */}
          {[10, 15, 20, 25, 30, 35].map((lat) => {
            const { y } = toIndiaXY(lat, INDIA_BOUNDS.minLng);
            return (
              <line key={`lat-${lat}`} x1={0} y1={y} x2={IW} y2={y}
                stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            );
          })}
          {[70, 75, 80, 85, 90, 95].map((lng) => {
            const { x } = toIndiaXY(INDIA_BOUNDS.maxLat, lng);
            return (
              <line key={`lng-${lng}`} x1={x} y1={0} x2={x} y2={IH}
                stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            );
          })}

          {/* Background city dots (no data) */}
          {bgCityDots.map(({ name, x, y }) => (
            <circle key={`bg-${name}`} cx={x} cy={y} r={2.5}
              fill="rgba(255,255,255,0.12)" />
          ))}

          {/* Active city dots with glow */}
          {cityDots.map(({ city, count, x, y }) => {
            const isTop = topCity && city === topCity.city;
            let intensity = count / maxCityCount;
            if (isNaN(intensity)) intensity = 0;
            const r = 4 + intensity * 14;
            const opacity = 0.4 + intensity * 0.6;
            const color = isTop ? '251,191,36' : '249,115,22';
            return (
              <g key={city}
                onMouseEnter={() => setTooltip({ city, count, x, y })}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={x} cy={y} r={r * 2.2}
                  fill={`rgba(${color},${opacity * 0.15})`} />
                <circle cx={x} cy={y} r={r * 1.4}
                  fill={`rgba(${color},${opacity * 0.3})`} />
                <circle cx={x} cy={y} r={r}
                  fill={`rgba(${color},${opacity})`} />
                {(isTop || intensity > 0.5) && (
                  <circle cx={x} cy={y} r={r * 1.6}
                    fill="none"
                    stroke={`rgba(${color},${opacity * 0.5})`}
                    strokeWidth={1}
                    className="animate-ping"
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  />
                )}
                {/* City label for top city */}
                {isTop && (
                  <text x={x} y={y - r - 4}
                    textAnchor="middle" fill="#fcd34d"
                    fontSize={9} fontFamily="serif" fontWeight="bold">
                    👑 {city}
                  </text>
                )}
              </g>
            );
          })}

          {/* Tooltip */}
          {tooltip && (() => {
            const tx = Math.min(Math.max(tooltip.x, 55), IW - 55);
            const ty = tooltip.y > IH / 2 ? tooltip.y - 50 : tooltip.y + 20;
            return (
              <g>
                <rect x={tx - 55} y={ty - 14} width={110} height={28}
                  rx={6} fill="rgba(0,0,0,0.85)" stroke="rgba(251,191,36,0.4)" strokeWidth={1} />
                <text x={tx} y={ty + 3}
                  textAnchor="middle" fill="#fcd34d"
                  fontSize={11} fontFamily="serif" fontWeight="bold">
                  🏙 {tooltip.city}: {tooltip.count.toLocaleString()}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Top cities list */}
      <div className="flex-shrink-0 border-t border-white/10 px-4 sm:px-6 py-3">
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">
          Top Chanting Cities
        </p>
        {sortedCities.length === 0 ? (
          <div className="py-2 space-y-1">
            {isLoading ? (
              <p className="text-white/20 text-xs text-center">Loading…</p>
            ) : (
              <>
                <p className="text-white/40 text-xs text-center">
                  City breakdown will appear as new chants are recorded 🏙️
                </p>
                {(indiaTotal !== null && indiaTotal !== undefined && indiaTotal > 0) && (
                  <p className="text-white/25 text-[10px] text-center">
                    {formatIndian(indiaTotal)} navkars already counted for India — city data starts accumulating now
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 max-h-28 overflow-y-auto">
            {sortedCities.slice(0, 10).map(({ city, count }, idx) => (
              <div key={city} className="flex items-center gap-2">
                <span className="text-white/30 text-[10px] w-4 flex-shrink-0 text-right">{idx + 1}.</span>
                <span className="text-white/70 text-xs w-24 truncate">{city}</span>
                <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${(count / maxCityCount) * 100}%`,
                      background: idx === 0
                        ? 'linear-gradient(90deg, #f59e0b, #fcd34d)'
                        : 'linear-gradient(90deg, #f97316, #fb923c)',
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

// ---------------------------------------------------------------------------
// WorldView component — world dot map + top countries list
// ---------------------------------------------------------------------------
const WorldView = ({ heatmapData, isLoading }) => {
  const [tooltip, setTooltip] = useState(null);

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

  const heatmapMap = useMemo(() => {
    const m = {};
    heatmapData.forEach((d) => { m[d.code] = d.count; });
    return m;
  }, [heatmapData]);

  const activeDots = useMemo(() => {
    return sortedCountries.map((d) => {
      const { x, y } = toXY(d.meta.lat, d.meta.lng);
      return { ...d, x, y };
    });
  }, [sortedCountries]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
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
            if (hasData) return null;
            return (
              <circle key={`bg-${code}`} cx={x} cy={y} r={2}
                fill="rgba(255,255,255,0.10)" />
            );
          })}

          {/* Active country dots with glow */}
          {activeDots.map(({ code, count, meta, x, y }) => {
            let intensity = count / maxCount;
            if (isNaN(intensity)) intensity = 0;
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
                <circle cx={x} cy={y} r={r * 2.2}
                  fill={`rgba(251,191,36,${opacity * 0.15})`} />
                <circle cx={x} cy={y} r={r * 1.4}
                  fill={`rgba(251,191,36,${opacity * 0.3})`} />
                <circle cx={x} cy={y} r={r}
                  fill={`rgba(251,191,36,${opacity})`} />
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

// ---------------------------------------------------------------------------
// GlobalHeatmap component
// ---------------------------------------------------------------------------
const GlobalHeatmap = ({ onClose }) => {
  const { globalCount, heatmapData, indiaCityData, isLoading } = useGlobalStats();
  const displayCount = useAnimatedCount(globalCount || 0);
  // India is the default tab (India-focused as requested)
  const [activeTab, setActiveTab] = useState('india');

  // Derive India's overall count from the existing country-level heatmap data.
  // This is populated from day 1 (navkar_heatmap/IN) even before any city data exists.
  const indiaTotal = useMemo(() => {
    const entry = heatmapData.find((d) => d.code === 'IN');
    return entry ? entry.count : null;
  }, [heatmapData]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#03061a] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🕉️</span>
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

      {/* Tab bar */}
      <div className="flex-shrink-0 flex gap-1 px-4 sm:px-6 mb-1">
        <button
          onClick={() => setActiveTab('india')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            activeTab === 'india'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-white/40 hover:text-white/70 border border-transparent'
          }`}
        >
          🇮🇳 India
        </button>
        <button
          onClick={() => setActiveTab('world')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            activeTab === 'world'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-white/40 hover:text-white/70 border border-transparent'
          }`}
        >
          🌍 World
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'india' ? (
        <IndiaView indiaCityData={indiaCityData} indiaTotal={indiaTotal} isLoading={isLoading} />
      ) : (
        <WorldView heatmapData={heatmapData} isLoading={isLoading} />
      )}
    </div>
  );
};

export default GlobalHeatmap;

