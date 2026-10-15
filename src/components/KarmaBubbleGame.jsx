"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNav } from '../lib/navContext';
import { pageTopPaddingClass } from '../lib/nativeWidgetBridge';

const KARMA_TYPES = [
  { key: 'krodh', label: 'Krodh',  emoji: '😡', hint: 'Anger',      color: '#EF4444', bg: 'from-red-400 to-red-600',       shadow: 'shadow-red-300'    },
  { key: 'maan',  label: 'Maan',   emoji: '😤', hint: 'Ego',        color: '#8B5CF6', bg: 'from-violet-400 to-violet-600',  shadow: 'shadow-violet-300' },
  { key: 'maya',  label: 'Maya',   emoji: '🎭', hint: 'Deceit',     color: '#EC4899', bg: 'from-pink-400 to-pink-600',      shadow: 'shadow-pink-300'   },
  { key: 'lobh',  label: 'Lobh',   emoji: '🤑', hint: 'Greed',      color: '#F59E0B', bg: 'from-amber-400 to-amber-600',    shadow: 'shadow-amber-300'  },
  { key: 'moha',  label: 'Moha',   emoji: '💔', hint: 'Attachment', color: '#06B6D4', bg: 'from-cyan-400 to-cyan-600',      shadow: 'shadow-cyan-300'   },
];

const SIZES = [64, 72, 80, 88, 96]; // px diameters

let _uid = 0;
const uid = () => ++_uid;

const makeBalloon = (areaW) => {
  const type = KARMA_TYPES[Math.floor(Math.random() * KARMA_TYPES.length)];
  const size = SIZES[Math.floor(Math.random() * SIZES.length)];
  const duration = 5000 + Math.random() * 4000; // 5-9s float
  const drift = (Math.random() - 0.5) * 60;     // horizontal drift px
  const left = Math.random() * Math.max(1, areaW - size - 20) + 10;
  return { id: uid(), type, size, duration, drift, left, popped: false, born: Date.now() };
};

// Inline styles for the float animation (keyframes injected once)
const STYLE_ID = 'karma-balloon-style';
const injectStyle = () => {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes balloonFloat {
      0%   { transform: translateY(0px)   translateX(0px)   scale(0.6); opacity: 0; }
      8%   { opacity: 1; }
      50%  { transform: translateY(-45vh) translateX(var(--drift)) scale(1); }
      100% { transform: translateY(-105vh) translateX(calc(var(--drift) * 0.6)) scale(0.9); opacity: 0; }
    }
    @keyframes balloonPop {
      0%   { transform: scale(1);   opacity: 1; }
      40%  { transform: scale(1.6); opacity: 0.8; }
      100% { transform: scale(0);   opacity: 0; }
    }
    @keyframes particleFly {
      0%   { transform: translate(0,0) scale(1); opacity: 1; }
      100% { transform: translate(var(--px), var(--py)) scale(0); opacity: 0; }
    }
    @keyframes malaIn {
      0%   { transform: scale(0.7); opacity: 0; }
      60%  { transform: scale(1.08); opacity: 1; }
      100% { transform: scale(1);   opacity: 1; }
    }
  `;
  document.head.appendChild(s);
};

const Balloon = ({ balloon, onPop }) => {
  const [popped, setPopped] = useState(false);
  const [particles, setParticles] = useState([]);

  const pop = useCallback((e) => {
    e.stopPropagation();
    if (popped) return;
    setPopped(true);
    // Generate particles
    setParticles(Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      const dist = 40 + Math.random() * 40;
      return {
        id: i,
        px: Math.round(Math.cos(angle) * dist),
        py: Math.round(Math.sin(angle) * dist),
      };
    }));
    onPop(balloon.id);
    setTimeout(() => setParticles([]), 500);
  }, [popped, onPop, balloon.id]);

  const floatStyle = {
    position: 'absolute',
    bottom: -balloon.size,
    left: balloon.left,
    width: balloon.size,
    height: balloon.size,
    '--drift': `${balloon.drift}px`,
    animation: popped
      ? 'balloonPop 0.35s ease-out forwards'
      : `balloonFloat ${balloon.duration}ms ease-in-out forwards`,
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    zIndex: 10,
  };

  return (
    <div style={floatStyle}>
      {/* Balloon body */}
      <div
        onTouchStart={pop}
        onClick={pop}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
          background: `linear-gradient(135deg, var(--blight), var(--bdark))`,
          '--blight': balloon.type.color + 'DD',
          '--bdark': balloon.type.color,
          boxShadow: `0 4px 20px ${balloon.type.color}66, inset -6px -8px 0 rgba(0,0,0,0.12), inset 8px 6px 0 rgba(255,255,255,0.18)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          position: 'relative',
        }}
      >
        {/* Shine */}
        <div style={{
          position: 'absolute', top: '12%', left: '20%',
          width: '30%', height: '22%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.38)',
          transform: 'rotate(-25deg)',
          pointerEvents: 'none',
        }} />
        <span style={{ fontSize: balloon.size * 0.32, lineHeight: 1, pointerEvents: 'none' }}>{balloon.type.emoji}</span>
        <span style={{ fontSize: Math.max(9, balloon.size * 0.17), fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.4)', pointerEvents: 'none', letterSpacing: 0.3 }}>{balloon.type.label}</span>
      </div>

      {/* Knot + string */}
      <div style={{
        width: 8, height: 8,
        borderRadius: '50%',
        background: balloon.type.color,
        margin: '0 auto',
        marginTop: -2,
        pointerEvents: 'none',
      }} />
      <div style={{
        width: 1.5, height: 18,
        background: balloon.type.color + '88',
        margin: '0 auto',
        pointerEvents: 'none',
      }} />

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 8, height: 8,
          borderRadius: '50%',
          background: balloon.type.color,
          '--px': `${p.px}px`,
          '--py': `${p.py}px`,
          animation: 'particleFly 0.45s ease-out forwards',
          pointerEvents: 'none',
          zIndex: 20,
        }} />
      ))}
    </div>
  );
};

const KarmaBubbleGame = ({ handleTap, totalNavkars, malaSize = 108 }) => {
  const { setPage } = useNav();
  const [topPadding] = useState(() => pageTopPaddingClass());
  const areaRef = useRef(null);
  const [areaW, setAreaW] = useState(320);
  const [balloons, setBalloons] = useState([]);
  const [malaFlash, setMalaFlash] = useState(false);
  const prevMalaRef = useRef(Math.floor(totalNavkars / malaSize));
  const scoreDisplay = totalNavkars % malaSize;
  const malaDisplay = Math.floor(totalNavkars / malaSize);

  useEffect(() => { injectStyle(); }, []);

  useEffect(() => {
    if (!areaRef.current) return;
    const ro = new ResizeObserver(([e]) => setAreaW(e.contentRect.width));
    ro.observe(areaRef.current);
    setAreaW(areaRef.current.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // Spawn balloons
  useEffect(() => {
    if (!areaW) return;
    const spawn = () => {
      setBalloons(prev => {
        const alive = prev.filter(b => !b.popped && Date.now() - b.born < b.duration + 500);
        if (alive.length >= 12) return alive;
        return [...alive, makeBalloon(areaW)];
      });
    };
    spawn(); // immediate first balloon
    const id = setInterval(spawn, 1200);
    return () => clearInterval(id);
  }, [areaW]);

  // Mala flash
  useEffect(() => {
    const m = Math.floor(totalNavkars / malaSize);
    if (m > prevMalaRef.current) {
      prevMalaRef.current = m;
      setBalloons([]);
      setMalaFlash(true);
      setTimeout(() => setMalaFlash(false), 1800);
    }
  }, [totalNavkars, malaSize]);

  const onPop = useCallback((id) => {
    setBalloons(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    handleTap();
  }, [handleTap]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 via-blue-50 to-amber-50">
      {/* Header */}
      <div className={`${topPadding} bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 flex items-center justify-between`}>
        <button onClick={() => setPage('jaap')} className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-1">
          ← Jaap
        </button>
        <div className="text-center">
          <div className="text-white font-bold text-sm">Karma Bubbles 🎈</div>
          <div className="text-orange-100 text-[10px]">Tap to pop karma</div>
        </div>
        <div className="w-12" />
      </div>

      {/* Scoreboard */}
      <div className="flex items-center justify-center gap-6 py-2 bg-white/80 backdrop-blur border-b border-orange-100">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-gray-400">Navkar</div>
          <div className="text-2xl font-bold text-orange-700 font-serif leading-none">{scoreDisplay}</div>
          <div className="text-[9px] text-gray-400">/ {malaSize}</div>
        </div>
        <div className="h-8 w-px bg-orange-100" />
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-gray-400">Mala</div>
          <div className="text-2xl font-bold text-amber-600 font-serif leading-none">{malaDisplay}</div>
        </div>
        <div className="h-8 w-px bg-orange-100" />
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-gray-400">Total</div>
          <div className="text-2xl font-bold text-gray-700 font-serif leading-none">{totalNavkars}</div>
        </div>
      </div>

      {/* Karma type chips */}
      <div className="flex gap-1.5 justify-center py-1.5 flex-wrap px-3 bg-white/60 border-b border-orange-100">
        {KARMA_TYPES.map(k => (
          <span key={k.key} className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: k.color }}>
            {k.emoji} {k.hint}
          </span>
        ))}
      </div>

      {/* Game area */}
      <div ref={areaRef} className="relative flex-1 overflow-hidden" style={{ minHeight: 200 }}>
        {/* Sky clouds decoration */}
        <div className="absolute top-4 left-4 opacity-20 text-5xl pointer-events-none select-none">☁️</div>
        <div className="absolute top-12 right-8 opacity-15 text-3xl pointer-events-none select-none">☁️</div>
        <div className="absolute top-6 right-24 opacity-10 text-4xl pointer-events-none select-none">☁️</div>

        {balloons.map(b => (
          <Balloon key={b.id} balloon={b} onPop={onPop} />
        ))}

        {/* Mala complete overlay */}
        {malaFlash && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-orange-900/20 backdrop-blur-sm">
            <div style={{ animation: 'malaIn 0.4s ease-out forwards' }}
              className="bg-white rounded-3xl px-10 py-8 text-center shadow-2xl border-2 border-orange-200">
              <div className="text-5xl mb-3">🪔</div>
              <div className="text-orange-700 font-bold text-2xl font-serif">Mala {malaDisplay}!</div>
              <div className="text-orange-500 text-sm mt-1 font-medium">Jai Jinendra 🙏</div>
              <div className="text-gray-400 text-xs mt-2">New balloons incoming…</div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {balloons.length === 0 && !malaFlash && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-5xl mb-3 opacity-30">🎈</div>
            <p className="text-gray-400 text-sm text-center px-8">Balloons floating up…<br />tap them to pop karma!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KarmaBubbleGame;
