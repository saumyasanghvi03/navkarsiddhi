"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGlobalStats } from '../hooks/useGlobalStats';
import { INDIA_CITIES, getUserCity } from '../lib/cityStorage';
import CityOnboarding from './CityOnboarding';

// India bounding box for SVG projection
const INDIA_BOUNDS = { minLat: 6.5, maxLat: 35.5, minLng: 68.0, maxLng: 97.5 };
const W = 500;
const H = 600;

const toXY = (lat, lng) => ({
  x: ((lng - INDIA_BOUNDS.minLng) / (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng)) * W,
  y: ((INDIA_BOUNDS.maxLat - lat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) * H,
});

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
    let rafId;
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target]);

  return display;
};

const formatIndian = (n) => {
  if (n === null) return '—';
  return n.toLocaleString('en-IN');
};

const GlobalHeatmap = ({ onClose }) => {
  const { globalCount, cityData, isLoading } = useGlobalStats();
  const displayCount = useAnimatedCount(globalCount || 0);
  const [tooltip, setTooltip] = useState(null);
  const [userCity, setUserCity] = useState(getUserCity());
  const [showOnboarding, setShowOnboarding] = useState(!getUserCity());

  const sortedCities = useMemo(() => {
    return [...cityData]
      .map((d) => ({ ...d, meta: INDIA_CITIES[d.cityId] }))
      .filter((d) => d.meta)
      .sort((a, b) => b.count - a.count);
  }, [cityData]);

  const maxCount = useMemo(
    () => Math.max(...sortedCities.map((d) => d.count), 1),
    [sortedCities]
  );

  const cityMap = useMemo(() => {
    const m = {};
    cityData.forEach((d) => { m[d.cityId] = d.count; });
    return m;
  }, [cityData]);

  const allCityDots = useMemo(() => {
    return Object.entries(INDIA_CITIES).map(([id, meta]) => {
      const { x, y } = toXY(meta.lat, meta.lng);
      const count = cityMap[id] || 0;
      return { id, meta, x, y, count };
    });
  }, [cityMap]);

  const handleCitySelected = (cityId) => {
    setUserCity(cityId);
    setShowOnboarding(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#03061a] flex flex-col overflow-hidden">
      {showOnboarding && <CityOnboarding onComplete={handleCitySelected} />}

      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🇮🇳</span>
          <span className="text-white font-bold text-lg sm:text-xl tracking-wide font-serif">
            India Navkar Map
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
              Navkars Completed Across India
            </p>
            {userCity && INDIA_CITIES[userCity] && (
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-amber-400/70 text-[10px] mt-1 hover:text-amber-300"
              >
                📍 {INDIA_CITIES[userCity].name} · Change city
              </button>
            )}
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

      {/* India City Map */}
      <div className="flex-1 relative min-h-0 px-2 sm:px-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          style={{ display: 'block' }}
        >
          {/* India outline approximation - subtle border */}
          <rect x={0} y={0} width={W} height={H} fill="none" />

          {/* City dots */}
          {allCityDots.map(({ id, meta, x, y, count }) => {
            const hasData = count > 0;
            const intensity = hasData ? count / maxCount : 0;
            const r = hasData ? 6 + intensity * 18 : 4;
            const opacity = hasData ? 0.4 + intensity * 0.6 : 0.15;
            const isUserCity = id === userCity;

            return (
              <g key={id}
                onMouseEnter={() => setTooltip({ id, name: meta.name, state: meta.state, count, x, y })}
                onMouseLeave={() => setTooltip(null)}
                onTouchStart={() => setTooltip({ id, name: meta.name, state: meta.state, count, x, y })}
                style={{ cursor: 'pointer' }}
              >
                {hasData && (
                  <>
                    <circle cx={x} cy={y} r={r * 2.2}
                      fill={`rgba(251,191,36,${opacity * 0.12})`} />
                    <circle cx={x} cy={y} r={r * 1.4}
                      fill={`rgba(251,191,36,${opacity * 0.25})`} />
                  </>
                )}
                <circle cx={x} cy={y} r={r}
                  fill={isUserCity ? `rgba(52,211,153,${Math.max(opacity, 0.7)})` : `rgba(251,191,36,${opacity})`}
                  stroke={isUserCity ? 'rgba(52,211,153,0.6)' : 'none'}
                  strokeWidth={isUserCity ? 2 : 0}
                />
                {intensity > 0.5 && (
                  <circle cx={x} cy={y} r={r * 1.6}
                    fill="none"
                    stroke={`rgba(251,191,36,${opacity * 0.5})`}
                    strokeWidth={1}
                    className="animate-ping"
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  />
                )}
                {/* City label for top cities or user's city */}
                {(isUserCity || intensity > 0.3) && (
                  <text x={x} y={y - r - 4}
                    textAnchor="middle" fill="rgba(255,255,255,0.6)"
                    fontSize={9} fontFamily="sans-serif">
                    {meta.name}
                  </text>
                )}
              </g>
            );
          })}

          {/* Tooltip */}
          {tooltip && (() => {
            const tx = Math.min(Math.max(tooltip.x, 70), W - 70);
            const ty = tooltip.y > H / 2 ? tooltip.y - 50 : tooltip.y + 30;
            return (
              <g>
                <rect x={tx - 65} y={ty - 16} width={130} height={32}
                  rx={6} fill="rgba(0,0,0,0.9)" stroke="rgba(251,191,36,0.4)" strokeWidth={1} />
                <text x={tx} y={ty + 1}
                  textAnchor="middle" fill="#fcd34d"
                  fontSize={11} fontFamily="sans-serif" fontWeight="bold">
                  📍 {tooltip.name}: {tooltip.count.toLocaleString()}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Top Cities */}
      <div className="flex-shrink-0 border-t border-white/10 px-4 sm:px-6 py-3">
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">
          Top Chanting Cities
        </p>
        {sortedCities.length === 0 ? (
          <p className="text-white/20 text-xs text-center py-2">
            {isLoading ? 'Loading…' : 'No city data yet — start chanting! 🙏'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 max-h-28 overflow-y-auto">
            {sortedCities.slice(0, 10).map(({ cityId, count, meta }) => (
              <div key={cityId} className={`flex items-center gap-2 ${cityId === userCity ? 'bg-white/5 rounded-lg px-1' : ''}`}>
                <span className="text-xs w-5 flex-shrink-0">{cityId === userCity ? '🏠' : '📍'}</span>
                <span className="text-white/70 text-xs w-24 truncate">{meta.name}</span>
                <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      background: cityId === userCity
                        ? 'linear-gradient(90deg, #34d399, #6ee7b7)'
                        : 'linear-gradient(90deg, #f59e0b, #fcd34d)',
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
