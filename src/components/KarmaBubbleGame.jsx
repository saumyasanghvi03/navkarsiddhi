"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNav } from '../lib/navContext';
import { pageTopPaddingClass } from '../lib/nativeWidgetBridge';

// ── Bubble types ──────────────────────────────────────────────────────────────
// 🕉️  punya drops falling from above — catch them (+1 navkar, +1 punya)
// 💢  kashaya clouds rising — let them pass (don't touch — ahimsa)
// 🫧   neutral breath — ignore

const PUNYA_TYPES = [
  { key: 'navkar',    label: 'Navkar',  emoji: '📿', hint: '+1 punya',   color: '#e06400', isPunya: true  },
  { key: 'arihant',  label: 'Arihant', emoji: '🕉️', hint: '+1 punya',   color: '#f5a623', isPunya: true  },
  { key: 'om',       label: 'Siddha',  emoji: '✨', hint: '+1 punya',   color: '#10b981', isPunya: true  },
];

const KASHAYA_TYPES = [
  { key: 'krodh', label: 'Krodh',  emoji: '😡', hint: 'Let it go',  color: '#ef4444', isPunya: false },
  { key: 'lobh',  label: 'Lobh',   emoji: '🤑', hint: 'Let it go',  color: '#f59e0b', isPunya: false },
  { key: 'maya',  label: 'Maya',   emoji: '🎭', hint: 'Let it go',  color: '#ec4899', isPunya: false },
  { key: 'maan',  label: 'Maan',   emoji: '😤', hint: 'Let it go',  color: '#8b5cf6', isPunya: false },
  { key: 'moha',  label: 'Moha',   emoji: '💔', hint: 'Let it go',  color: '#06b6d4', isPunya: false },
];

const NEUTRAL_TYPE = { key: 'neutral', label: '', emoji: '🫧', hint: '',  color: '#94a3b8', isPunya: false, isNeutral: true };

const SIZES = [60, 68, 76, 84, 92];
let _uid = 0;
const uid = () => ++_uid;

const pickBubbleType = (score) => {
  // As score grows, more kashaya to avoid; early game = mostly punya to catch
  const kashaRatio = Math.min(0.35, score * 0.02); // up to 35% kashaya
  const neutralRatio = 0.1;
  const r = Math.random();
  if (r < kashaRatio) return KASHAYA_TYPES[Math.floor(Math.random() * KASHAYA_TYPES.length)];
  if (r < kashaRatio + neutralRatio) return NEUTRAL_TYPE;
  return PUNYA_TYPES[Math.floor(Math.random() * PUNYA_TYPES.length)];
};

// Speed curve: starts at 4s intervals, ramps to 1.4s after 20 pops
const spawnInterval = (score) => Math.max(1400, 4000 - score * 130);

const STYLE_ID = 'karma-bubble-v2-style';
const injectStyle = () => {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes punyaDrop {
      0%   { transform: translateY(-120px) translateX(0) scale(0.5); opacity: 0; }
      8%   { opacity: 1; }
      50%  { transform: translateY(40vh) translateX(var(--drift)) scale(1); }
      100% { transform: translateY(110vh) translateX(calc(var(--drift)*0.7)) scale(0.85); opacity: 0; }
    }
    @keyframes kashaRise {
      0%   { transform: translateY(0) translateX(0) scale(0.5); opacity: 0; }
      8%   { opacity: 0.85; }
      50%  { transform: translateY(-42vh) translateX(var(--drift)) scale(1); }
      100% { transform: translateY(-110vh) translateX(calc(var(--drift)*0.7)) scale(0.9); opacity: 0; }
    }
    @keyframes bubblePop {
      0%   { transform: scale(1);   opacity: 1; }
      35%  { transform: scale(1.7); opacity: 0.9; }
      70%  { transform: scale(2.2); opacity: 0.3; }
      100% { transform: scale(0);   opacity: 0; }
    }
    @keyframes particleFly {
      0%   { transform: translate(0,0) scale(1); opacity: 1; }
      100% { transform: translate(var(--px), var(--py)) scale(0); opacity: 0; }
    }
    @keyframes punyaFloat {
      0%   { transform: translateY(0) scale(0.8); opacity: 1; }
      100% { transform: translateY(-52px) scale(1); opacity: 0; }
    }
    @keyframes malaIn {
      0%   { transform: scale(0.7); opacity: 0; }
      60%  { transform: scale(1.08); opacity: 1; }
      100% { transform: scale(1);   opacity: 1; }
    }
    @keyframes wrongShake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-8px); }
      40%     { transform: translateX(8px); }
      60%     { transform: translateX(-5px); }
      80%     { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(s);
};

// ── Bubble component ──────────────────────────────────────────────────────────
const Bubble = ({ bubble, onPop, onMiss }) => {
  const [state, setState] = useState('alive'); // alive | popped | miss
  const [particles, setParticles] = useState([]);
  const [punyaLabel, setPunyaLabel] = useState(null);

  const tap = useCallback((e) => {
    e.stopPropagation();
    if (state !== 'alive') return;

    if (bubble.type.isPunya) {
      setState('popped');
      setPunyaLabel('+1 punya');
      setParticles(Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const dist = 44 + Math.random() * 36;
        return { id: i, px: Math.round(Math.cos(angle) * dist), py: Math.round(Math.sin(angle) * dist) };
      }));
      onPop(bubble.id);
      setTimeout(() => setParticles([]), 550);
    } else if (!bubble.type.isNeutral) {
      setState('miss');
      onMiss();
      setTimeout(() => setState('alive'), 500);
    }
  }, [state, bubble, onPop, onMiss]);

  const isPunya = bubble.type.isPunya;
  const animName = isPunya ? 'punyaDrop' : 'kashaRise';

  const floatStyle = {
    position: 'absolute',
    ...(isPunya ? { top: -bubble.size } : { bottom: -bubble.size }),
    left: bubble.left,
    width: bubble.size,
    height: bubble.size,
    '--drift': `${bubble.drift}px`,
    animation: state === 'popped'
      ? 'bubblePop 0.4s ease-out forwards'
      : state === 'miss'
      ? 'wrongShake 0.4s ease-out'
      : `${animName} ${bubble.duration}ms ease-in-out forwards`,
    cursor: isPunya ? 'pointer' : 'default',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    zIndex: 10,
  };

  const glowColor = bubble.type.color;

  return (
    <div style={floatStyle}>
      <div
        onTouchStart={tap}
        onClick={tap}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${glowColor}ee, ${glowColor}99)`,
          boxShadow: isPunya
            ? `0 0 18px ${glowColor}88, 0 4px 20px ${glowColor}44, inset -4px -6px 0 rgba(0,0,0,0.1), inset 6px 5px 0 rgba(255,255,255,0.22)`
            : `0 2px 12px ${glowColor}44, inset -4px -6px 0 rgba(0,0,0,0.1)`,
          opacity: bubble.type.isNeutral ? 0.45 : 1,
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
          position: 'absolute', top: '10%', left: '18%',
          width: '28%', height: '20%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.35)',
          transform: 'rotate(-25deg)',
          pointerEvents: 'none',
        }} />
        <span style={{ fontSize: bubble.size * 0.34, lineHeight: 1, pointerEvents: 'none' }}>{bubble.type.emoji}</span>
        {bubble.type.hint && (
          <span style={{ fontSize: Math.max(8, bubble.size * 0.14), fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.4)', pointerEvents: 'none' }}>
            {bubble.type.hint}
          </span>
        )}
      </div>

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 8, height: 8,
          borderRadius: '50%',
          background: glowColor,
          '--px': `${p.px}px`, '--py': `${p.py}px`,
          animation: 'particleFly 0.48s ease-out forwards',
          pointerEvents: 'none', zIndex: 20,
        }} />
      ))}

      {/* +1 punya label */}
      {punyaLabel && (
        <div style={{
          position: 'absolute', top: -20, left: '50%',
          transform: 'translateX(-50%)',
          fontWeight: 800, fontSize: 13,
          color: '#e06400',
          textShadow: '0 1px 3px rgba(255,255,255,0.9)',
          animation: 'punyaFloat 0.75s ease-out forwards',
          pointerEvents: 'none', zIndex: 30, whiteSpace: 'nowrap',
        }}>
          +1 punya ✨
        </div>
      )}
    </div>
  );
};

// ── Main game ─────────────────────────────────────────────────────────────────
const KarmaBubbleGame = ({ handleTap, totalNavkars, malaSize = 108 }) => {
  const { setPage } = useNav();
  const [topPadding] = useState(() => pageTopPaddingClass());
  const areaRef = useRef(null);
  const [areaW, setAreaW] = useState(320);
  const [bubbles, setBubbles] = useState([]);
  const [sessionPunya, setSessionPunya] = useState(0);
  const [misses, setMisses] = useState(0);
  const [malaFlash, setMalaFlash] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const prevMalaRef = useRef(Math.floor(totalNavkars / malaSize));
  const scoreDisplay = totalNavkars % malaSize;
  const malaDisplay = Math.floor(totalNavkars / malaSize);
  const spawnRef = useRef(null);

  useEffect(() => { injectStyle(); }, []);

  useEffect(() => {
    if (!areaRef.current) return;
    const ro = new ResizeObserver(([e]) => setAreaW(e.contentRect.width));
    ro.observe(areaRef.current);
    setAreaW(areaRef.current.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const makeBubble = useCallback((w) => {
    const type = pickBubbleType(sessionPunya);
    const size = SIZES[Math.floor(Math.random() * SIZES.length)];
    const duration = 5500 + Math.random() * 3500;
    const drift = (Math.random() - 0.5) * 70;
    const left = Math.random() * Math.max(1, w - size - 20) + 10;
    return { id: uid(), type, size, duration, drift, left, born: Date.now() };
  }, [sessionPunya]);

  // Spawn loop — speed scales with sessionPunya
  useEffect(() => {
    if (!areaW) return;
    if (showEnd) return;

    const spawn = () => {
      setBubbles(prev => {
        const alive = prev.filter(b => Date.now() - b.born < b.duration + 600);
        if (alive.length >= 10) return alive;
        return [...alive, makeBubble(areaW)];
      });
    };
    spawn();
    const interval = spawnInterval(sessionPunya);
    spawnRef.current = setInterval(spawn, interval);
    return () => clearInterval(spawnRef.current);
  }, [areaW, sessionPunya, makeBubble, showEnd]);

  // Mala flash
  useEffect(() => {
    const m = Math.floor(totalNavkars / malaSize);
    if (m > prevMalaRef.current) {
      prevMalaRef.current = m;
      setBubbles([]);
      setMalaFlash(true);
      setTimeout(() => setMalaFlash(false), 1800);
    }
  }, [totalNavkars, malaSize]);

  const onPop = useCallback((id) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setSessionPunya(p => p + 1);
    handleTap();
  }, [handleTap]);

  const onMiss = useCallback(() => {
    setMisses(m => m + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #fff8f0 0%, #fef3c7 50%, #ecfdf5 100%)' }}>
      {/* Header */}
      <div className={`${topPadding} px-4 py-3 flex items-center justify-between`} style={{ background: 'linear-gradient(90deg, #e06400, #f5a623)' }}>
        <button onClick={() => setPage('jaap')} className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-1">
          ← Jaap
        </button>
        <div className="text-center">
          <div className="text-white font-bold text-sm">Atma Bubbles ✨</div>
          <div className="text-orange-100 text-[10px]">Catch punya · Let kashaya go</div>
        </div>
        <button
          onClick={() => setShowEnd(true)}
          className="text-white/70 hover:text-white text-xs font-medium"
        >
          Finish
        </button>
      </div>

      {/* Scoreboard */}
      <div className="flex items-center justify-center gap-5 py-2 bg-white/70 backdrop-blur border-b border-orange-100">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-gray-400">Punya</div>
          <div className="text-2xl font-bold text-orange-600 font-serif leading-none">{sessionPunya}</div>
          <div className="text-[9px] text-gray-400">today</div>
        </div>
        <div className="h-8 w-px bg-orange-100" />
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
      </div>

      {/* Legend */}
      <div className="flex gap-3 justify-center py-1.5 flex-wrap px-3 bg-white/50 border-b border-orange-50 text-[10px] text-gray-500">
        <span>📿✨🕉️ = <strong className="text-orange-600">catch</strong></span>
        <span>😡🤑🎭😤💔 = <strong className="text-gray-400">let pass</strong></span>
        <span>🫧 = <strong className="text-gray-300">ignore</strong></span>
      </div>

      {/* Game area */}
      <div ref={areaRef} className="relative flex-1 overflow-hidden" style={{ minHeight: 220 }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(251,191,36,0.08) 0%, transparent 70%)',
        }} />

        {bubbles.map(b => (
          <Bubble key={b.id} bubble={b} onPop={onPop} onMiss={onMiss} />
        ))}

        {/* Mala complete overlay */}
        {malaFlash && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 backdrop-blur-sm" style={{ background: 'rgba(224,100,0,0.15)' }}>
            <div style={{ animation: 'malaIn 0.4s ease-out forwards' }}
              className="bg-white rounded-3xl px-10 py-8 text-center shadow-2xl border-2 border-orange-200">
              <div className="text-5xl mb-3">🪔</div>
              <div className="text-orange-700 font-bold text-2xl font-serif">Mala {malaDisplay}!</div>
              <div className="text-orange-500 text-sm mt-1 font-medium">Jai Jinendra 🙏</div>
              <div className="text-gray-400 text-xs mt-2">Atma rising…</div>
            </div>
          </div>
        )}

        {/* End screen */}
        {showEnd && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 backdrop-blur-sm" style={{ background: 'rgba(255,248,240,0.92)' }}>
            <div style={{ animation: 'malaIn 0.4s ease-out forwards' }}
              className="bg-white rounded-3xl px-8 py-8 text-center shadow-2xl border-2 border-orange-100 mx-4 max-w-xs w-full">
              <div className="text-5xl mb-3">🙏</div>
              <div className="text-orange-700 font-bold text-xl font-serif">Your atma feels lighter</div>
              <div className="text-gray-500 text-sm mt-2 leading-relaxed">
                {sessionPunya} punya drops collected<br />
                {malaDisplay > 0 ? `${malaDisplay} mala${malaDisplay > 1 ? 's' : ''} completed` : `${scoreDisplay} navkars towards first mala`}
              </div>
              <div className="mt-4 bg-orange-50 rounded-2xl px-4 py-3">
                <p className="text-xs text-orange-600 font-medium">
                  {sessionPunya >= 20
                    ? '🔥 Peak dharma energy today 💛'
                    : sessionPunya >= 10
                    ? '🌸 Beautiful session — atma is glowing'
                    : '📿 Every punya counts. Mahavir is nodding 🙏'}
                </p>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => { setShowEnd(false); setSessionPunya(0); setMisses(0); }}
                  className="flex-1 border border-orange-200 text-orange-700 text-sm font-bold py-2.5 rounded-xl"
                >
                  Play again
                </button>
                <button
                  onClick={() => setPage('jaap')}
                  className="flex-1 text-white text-sm font-bold py-2.5 rounded-xl"
                  style={{ background: '#e06400' }}
                >
                  Back to jaap
                </button>
              </div>
            </div>
          </div>
        )}

        {bubbles.length === 0 && !malaFlash && !showEnd && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-5xl mb-3 opacity-30">✨</div>
            <p className="text-gray-400 text-sm text-center px-8 leading-relaxed">Punya drops falling…<br />catch them to help your atma rise!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KarmaBubbleGame;
