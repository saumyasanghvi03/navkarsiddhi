"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { LINE_COLORS } from '../utils/constants';
import { useNav } from '../lib/navContext';

/**
 * Full-screen focus mode for distraction-free jaap.
 * Shows only: mantra text, counter, and minimal controls.
 */

const MANTRA_LINE_TEXT = [
  { en: 'Namo Arihantanam', hi: 'णमो अरिहंताणं', gu: 'નમો અરિહંતાણં' },
  { en: 'Namo Siddhanam', hi: 'णमो सिद्धाणं', gu: 'નમો સિદ્ધાણં' },
  { en: 'Namo Ayariyanam', hi: 'णमो आयरियाणं', gu: 'નમો આયરિયાણં' },
  { en: 'Namo Uvajjhayanam', hi: 'णमो उवज्झायाणं', gu: 'નમો ઉવજ્ઝાયાણં' },
  { en: 'Namo Loye Savva Sahunam', hi: 'णमो लोए सव्व साहूणं', gu: 'નમો લોએ સવ્વ સાહૂણં' },
  { en: 'Eso Pancha Namukkaro', hi: 'एसो पंच णमुक्कारो', gu: 'એસો પંચ ણમુક્કારો' },
  { en: 'Savva Pavappanasano', hi: 'सव्व पावप्पणासणो', gu: 'સવ્વ પાવપ્પણાસણો' },
  { en: 'Mangalanam Cha Savvesim', hi: 'मंगलाणं च सव्वेसिं', gu: 'મંગલાણં ચ સવ્વેસિં' },
  { en: 'Padhamam Havai Mangalam', hi: 'पढमं हवइ मंगलं', gu: 'પઢમં હવઈ મંગલં' },
];

const REFLECTIONS = [
  'Today I dedicate this jaap to kshamā (forgiveness).',
  'May this sadhana cultivate ahimsā (non-violence) in me.',
  'I seek samyaktva (right faith) through this practice.',
  'May my jaap bring peace to all beings.',
  'With each Navkar, I release attachment and aversion.',
];

const FocusMode = ({ totalNavkars, onTap, currentIndex, currentWord, currentWordHindi, currentWordGujarati, currentLineIndex, isClearing, onExit }) => {
  const { language } = useNav();

  // Get the display word based on selected language
  const displayWord = language === 'hindi' ? currentWordHindi
    : language === 'gujarati' ? currentWordGujarati
    : currentWord;
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');

  const malaCount = Math.floor(totalNavkars / 108);
  const navkarsInMala = totalNavkars % 108;

  // Show reflection after every complete Navkar
  useEffect(() => {
    if (totalNavkars > 0 && totalNavkars % 108 === 0) {
      setReflectionText(REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)]);
      setShowReflection(true);
      const timer = setTimeout(() => setShowReflection(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [totalNavkars]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center"
      onClick={onTap}
      style={{ touchAction: 'manipulation', cursor: 'pointer' }}
    >
      {/* Exit button */}
      <button
        onClick={e => { e.stopPropagation(); onExit(); }}
        className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors p-2 z-50"
        title="Exit Focus Mode"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter - top center */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/50">
        <div className="text-center">
          <div className="text-3xl font-bold text-white/80 font-serif">{navkarsInMala}</div>
          <div className="text-[10px] uppercase tracking-wider">of 108</div>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="text-center">
          <div className="text-3xl font-bold text-white/80 font-serif">{malaCount}</div>
          <div className="text-[10px] uppercase tracking-wider">Malas</div>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="text-center">
          <div className="text-3xl font-bold text-white/80 font-serif">{totalNavkars}</div>
          <div className="text-[10px] uppercase tracking-wider">Total</div>
        </div>
      </div>

      {/* Mantra display */}
      <div className="flex flex-col items-center gap-4 px-4">
        {currentIndex === -1 && !isClearing && (
          <span className="text-lg text-white/40 tracking-widest animate-pulse select-none font-serif">
            Tap to Begin
          </span>
        )}
        {currentIndex >= 0 && (
          <div
            className="text-4xl sm:text-6xl md:text-7xl font-bold select-none text-center transition-all duration-300"
            style={{ color: LINE_COLORS[currentLineIndex] || '#fff' }}
          >
            {displayWord}
          </div>
        )}
      </div>

      {/* Full mantra text - subtle below */}
      <div className="absolute bottom-20 left-0 right-0 px-6">
        <div className="max-w-md mx-auto space-y-0.5 opacity-20">
          {MANTRA_LINE_TEXT.map((line, i) => (
            <p
              key={i}
              className={`text-center text-xs transition-opacity ${
                i === currentLineIndex ? 'opacity-100 text-white/80' : 'text-white/30'
              }`}
            >
              {language === 'hindi' ? line.hi : language === 'gujarati' ? line.gu : line.en}
            </p>
          ))}
        </div>
      </div>

      {/* Reflection overlay */}
      {showReflection && (
        <div className="absolute bottom-40 left-0 right-0 px-6 text-center animate-fade-in">
          <p className="text-white/60 text-sm font-serif italic max-w-sm mx-auto leading-relaxed">
            {reflectionText}
          </p>
        </div>
      )}

      {/* Mala progress ring at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 18 }).map((_, i) => {
            const segmentSize = 6; // 108 / 18 = 6 Navkars per segment
            const filled = navkarsInMala >= (i + 1) * segmentSize;
            return (
              <div
                key={i}
                className={`w-3 h-1 rounded-full transition-all duration-300 ${
                  filled ? 'bg-orange-400' : 'bg-white/10'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
