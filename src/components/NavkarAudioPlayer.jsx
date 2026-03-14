"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Background Navkar chanting audio player.
 * Uses Web Audio API to generate a soothing Om drone at 136.1Hz (Om frequency)
 * with a gentle breath cycle. Provides play/pause and volume control.
 *
 * This is separate from AdaptiveAudio (which is biofeedback-driven).
 */

const NavkarAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showVolume, setShowVolume] = useState(false);
  const contextRef = useRef(null);
  const gainRef = useRef(null);
  const nodesRef = useRef([]);

  const createAudio = useCallback(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);

    // Fundamental: 136.1Hz (Om frequency used in Tibetan/Jain meditation)
    const fundamental = 136.1;

    // Main drone oscillator
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = fundamental;
    const g1 = ctx.createGain();
    g1.gain.value = 0.4;
    osc1.connect(g1);
    g1.connect(master);

    // Octave below — warm foundation
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = fundamental / 2;
    const g2 = ctx.createGain();
    g2.gain.value = 0.3;
    osc2.connect(g2);
    g2.connect(master);

    // Fifth above — subtle harmonic
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = fundamental * 1.5;
    const g3 = ctx.createGain();
    g3.gain.value = 0.1;
    osc3.connect(g3);
    g3.connect(master);

    // Breath LFO — slow modulation for organic feel
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08; // ~12.5s cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);

    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();

    contextRef.current = ctx;
    gainRef.current = master;
    nodesRef.current = [osc1, osc2, osc3, lfo];
  }, [volume]);

  const handleToggle = () => {
    if (isPlaying) {
      // Stop
      if (contextRef.current) {
        contextRef.current.close();
        contextRef.current = null;
        gainRef.current = null;
        nodesRef.current = [];
      }
      setIsPlaying(false);
      setShowVolume(false);
    } else {
      // Start
      createAudio();
      setIsPlaying(true);
    }
  };

  // Update volume when slider changes
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.setTargetAtTime(volume, gainRef.current.context.currentTime, 0.1);
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (contextRef.current) {
        contextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center transition-all
          ${isPlaying
            ? 'bg-orange-200 text-orange-800'
            : 'bg-white/70 text-gray-500 hover:bg-orange-50'}
          border border-orange-200 shadow-sm
        `}
        title={isPlaying ? 'Stop Audio' : 'Play Navkar Audio'}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </button>

      {isPlaying && (
        <div className="absolute bottom-12 right-0 bg-white rounded-xl shadow-lg border border-orange-100 p-3 w-44 z-50">
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1.5 accent-orange-500"
            />
            <span className="text-[10px] text-gray-400 w-6 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavkarAudioPlayer;

