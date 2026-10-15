"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNav } from '../lib/navContext';
import { pageTopPaddingClass } from '../lib/nativeWidgetBridge';

// Jain 5 kashayas (passions that bind karma) + bonus types
const KARMA_TYPES = [
  { key: 'krodh',  label: 'Krodh',  emoji: '😡', hint: 'Anger',      color: '#EF4444', bg: '#FEE2E2', size: [52, 72] },
  { key: 'maan',   label: 'Maan',   emoji: '😤', hint: 'Ego',        color: '#8B5CF6', bg: '#EDE9FE', size: [48, 64] },
  { key: 'maya',   label: 'Maya',   emoji: '🎭', hint: 'Deceit',     color: '#EC4899', bg: '#FCE7F3', size: [50, 68] },
  { key: 'lobh',   label: 'Lobh',   emoji: '🤑', hint: 'Greed',      color: '#F59E0B', bg: '#FEF3C7', size: [54, 74] },
  { key: 'moha',   label: 'Moha',   emoji: '💔', hint: 'Attachment', color: '#06B6D4', bg: '#CFFAFE', size: [46, 66] },
];

const MALA_SIZE = 108;

// Random number in [min, max]
const rand = (min, max) => Math.random() * (max - min) + min;

const makeBubble = (id, containerW, containerH) => {
  const type = KARMA_TYPES[Math.floor(Math.random() * KARMA_TYPES.length)];
  const size = Math.round(rand(...type.size));
  return {
    id,
    type,
    size,
    x: rand(size / 2, containerW - size / 2),
    y: containerH + size,          // start below viewport
    vx: rand(-0.5, 0.5),
    vy: rand(-0.9, -0.5),          // float upward
    wobble: rand(0, Math.PI * 2),  // phase for horizontal wobble
    wobbleAmp: rand(8, 20),
    wobbleFreq: rand(0.01, 0.025),
    opacity: 0,
    popping: false,
    popProgress: 0,
  };
};

// Particle on pop
const makeParticles = (x, y, color) =>
  Array.from({ length: 10 }, (_, i) => ({
    id: Math.random(),
    x, y,
    angle: (i / 10) * Math.PI * 2,
    speed: rand(2, 6),
    color,
    life: 1,
    size: rand(4, 9),
  }));

const KarmaBubbleGame = ({ handleTap, totalNavkars, malaSize = MALA_SIZE }) => {
  const { setPage } = useNav();
  const [topPadding] = useState(() => pageTopPaddingClass());
  const containerRef = useRef(null);
  const bubblesRef = useRef([]);
  const particlesRef = useRef([]);
  const nextIdRef = useRef(0);
  const frameRef = useRef(null);
  const lastSpawnRef = useRef(0);
  const totalNavkarsRef = useRef(totalNavkars);
  const prevMalaRef = useRef(Math.floor(totalNavkars / malaSize));
  const [scoreDisplay, setScoreDisplay] = useState(totalNavkars % malaSize);
  const [malaDisplay, setMalaDisplay] = useState(Math.floor(totalNavkars / malaSize));
  const [malaFlash, setMalaFlash] = useState(false);
  const canvasRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // Keep ref in sync so the animation loop reads latest
  totalNavkarsRef.current = totalNavkars;

  // Mala completion flash + clear bubbles
  useEffect(() => {
    const newMala = Math.floor(totalNavkars / malaSize);
    if (newMala > prevMalaRef.current) {
      prevMalaRef.current = newMala;
      bubblesRef.current = [];           // clear all bubbles
      setMalaFlash(true);
      setTimeout(() => setMalaFlash(false), 1200);
    }
    setScoreDisplay(totalNavkars % malaSize);
    setMalaDisplay(newMala);
  }, [totalNavkars, malaSize]);

  // Resize handler
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const { offsetWidth: w, offsetHeight: h } = containerRef.current;
      setDims({ w, h });
      if (canvasRef.current) {
        canvasRef.current.width = w;
        canvasRef.current.height = h;
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Spawn + animate loop
  useEffect(() => {
    if (!dims.w || !dims.h) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const loop = (ts) => {
      frameRef.current = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, dims.w, dims.h);

      // Spawn new bubble every 1.4s (max 14 alive)
      if (ts - lastSpawnRef.current > 1400 && bubblesRef.current.length < 14) {
        lastSpawnRef.current = ts;
        bubblesRef.current.push(makeBubble(nextIdRef.current++, dims.w, dims.h));
      }

      // Update & draw particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      for (const p of particlesRef.current) {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.life -= 0.05;
        p.speed *= 0.95;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Update & draw bubbles
      bubblesRef.current = bubblesRef.current.filter(b => {
        if (b.popping) {
          b.popProgress += 0.08;
          return b.popProgress < 1;
        }
        return b.y + b.size / 2 > -20;  // remove off top
      });

      for (const b of bubblesRef.current) {
        if (b.popping) {
          // Pop animation: scale out + fade
          const scale = 1 + b.popProgress * 0.5;
          const alpha = 1 - b.popProgress;
          ctx.globalAlpha = alpha;
          drawBubble(ctx, b, scale);
          ctx.globalAlpha = 1;
          continue;
        }

        // Float upward with sinusoidal wobble
        b.wobble += b.wobbleFreq;
        b.x += b.vx + Math.sin(b.wobble) * 0.6;
        b.y += b.vy;
        b.opacity = Math.min(1, b.opacity + 0.04);

        // Bounce off sides
        if (b.x - b.size / 2 < 0) { b.x = b.size / 2; b.vx = Math.abs(b.vx); }
        if (b.x + b.size / 2 > dims.w) { b.x = dims.w - b.size / 2; b.vx = -Math.abs(b.vx); }

        ctx.globalAlpha = b.opacity;
        drawBubble(ctx, b, 1);
        ctx.globalAlpha = 1;
      }
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [dims]);

  const drawBubble = (ctx, b, scale) => {
    const r = (b.size / 2) * scale;
    ctx.save();
    ctx.translate(b.x, b.y);

    // Shadow
    ctx.shadowColor = b.type.color + '66';
    ctx.shadowBlur = 12;

    // Bubble body
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.05, 0, 0, r);
    grad.addColorStop(0, b.type.bg);
    grad.addColorStop(1, b.type.color + 'AA');
    ctx.fillStyle = grad;
    ctx.fill();

    // Border
    ctx.lineWidth = 2;
    ctx.strokeStyle = b.type.color;
    ctx.stroke();

    // Shine highlight
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(-r * 0.28, -r * 0.28, r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();

    // Emoji
    ctx.shadowBlur = 0;
    ctx.font = `${r * 0.7}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.type.emoji, 0, r * 0.05);

    // Label beneath
    ctx.font = `bold ${Math.max(8, r * 0.3)}px sans-serif`;
    ctx.fillStyle = b.type.color;
    ctx.fillText(b.type.label, 0, r * 0.7);

    ctx.restore();
  };

  const handleCanvasTap = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touches = e.touches || e.changedTouches;
    const clientX = touches ? touches[0].clientX : e.clientX;
    const clientY = touches ? touches[0].clientY : e.clientY;
    const tapX = clientX - rect.left;
    const tapY = clientY - rect.top;

    // Check hit — test top-most (last) bubble first
    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const b = bubblesRef.current[i];
      if (b.popping) continue;
      const dx = tapX - b.x;
      const dy = tapY - b.y;
      if (Math.sqrt(dx * dx + dy * dy) <= b.size / 2) {
        b.popping = true;
        b.popProgress = 0;
        particlesRef.current.push(...makeParticles(b.x, b.y, b.type.color));
        handleTap();   // count one Navkar
        break;
      }
    }
  }, [handleTap]);

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col" ref={containerRef}>
      {/* Header */}
      <div className={`${topPadding} bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 flex items-center justify-between`}>
        <button
          onClick={() => setPage('jaap')}
          className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="text-center">
          <div className="text-white font-bold text-sm">Karma Bubble</div>
          <div className="text-orange-100 text-[10px]">Pop karma, earn navkars 📿</div>
        </div>
        <div className="w-12" />
      </div>

      {/* Scoreboard */}
      <div className="flex items-center justify-center gap-6 py-2 bg-white border-b border-orange-100 shadow-sm">
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

      {/* Hint row */}
      <div className="flex gap-2 justify-center py-1.5 flex-wrap px-3 bg-amber-50 border-b border-orange-100">
        {KARMA_TYPES.map(k => (
          <span key={k.key} className="text-[10px] font-medium px-2 py-0.5 rounded-full border" style={{ color: k.color, borderColor: k.color + '55', background: k.bg }}>
            {k.emoji} {k.hint}
          </span>
        ))}
      </div>

      {/* Canvas game area */}
      <div className="relative flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ touchAction: 'none' }}
          onClick={handleCanvasTap}
          onTouchStart={handleCanvasTap}
        />

        {/* Mala completion flash overlay */}
        {malaFlash && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 animate-pulse">
            <div className="bg-orange-600/90 rounded-3xl px-8 py-6 text-center shadow-2xl">
              <div className="text-4xl mb-2">🪔</div>
              <div className="text-white font-bold text-xl">Mala {malaDisplay} Complete!</div>
              <div className="text-orange-200 text-sm mt-1">Jai Jinendra 🙏</div>
            </div>
          </div>
        )}

        {/* Empty state hint */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          <div className="text-5xl mb-3 opacity-20">📿</div>
          <p className="text-gray-300 text-sm text-center px-8 opacity-60">
            Bubbles will float up.<br />Tap them to pop karma &amp; earn navkars.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KarmaBubbleGame;
