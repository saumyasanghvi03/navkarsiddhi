"use client";

import React, { useState } from 'react';
import { syncUserProfile } from '../lib/nativeWidgetBridge';

const LANGS = [
  { id: 'english', label: 'English', flag: '🇮🇳', sub: 'English (India)' },
  { id: 'hindi',   label: 'हिंदी',   flag: '🕉️',  sub: 'Hindi' },
  { id: 'gujarati',label: 'ગુજરાતી', flag: '🙏',  sub: 'Gujarati' },
];

const OnboardingScreen = ({ onDone }) => {
  const [name, setName]   = useState('');
  const [lang, setLang]   = useState('english');
  const [step, setStep]   = useState(0); // 0=name, 1=lang

  const handleNameNext = () => {
    if (name.trim().length === 0) { setStep(1); return; }
    setStep(1);
  };

  const handleFinish = () => {
    const trimmed = name.trim();
    try { localStorage.setItem('navkar_user_name', trimmed); } catch (_) {}
    try { localStorage.setItem('navkar_tts_lang', lang); } catch (_) {}
    syncUserProfile(trimmed, lang);
    onDone({ name: trimmed, lang });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#faf7f2] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="text-5xl mb-2">📿</div>
      <h1 className="text-xl font-serif font-bold text-orange-600 mb-1">Navkar Siddhi</h1>
      <p className="text-xs text-gray-400 mb-8">Jai Jinendra 🙏</p>

      {step === 0 ? (
        /* ── Step 1: Name ───────────────────────────────────── */
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-1">What should I call you?</p>
            <p className="text-xs text-gray-400">I'll use your name when I check in on you.</p>
          </div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleNameNext()}
            placeholder="Your name"
            maxLength={24}
            autoFocus
            className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 bg-white text-center font-semibold"
          />
          <button
            onClick={handleNameNext}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md"
          >
            {name.trim() ? 'Continue →' : 'Skip →'}
          </button>
        </div>
      ) : (
        /* ── Step 2: TTS Language ────────────────────────────── */
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-1">
              {name.trim() ? `Hey ${name.trim()} 💛` : 'One more thing 💛'}
            </p>
            <p className="text-xs text-gray-400">Which language should I speak in?</p>
            <p className="text-[10px] text-gray-300 mt-0.5">Voice reminders will use this</p>
          </div>

          <div className="flex flex-col gap-2">
            {LANGS.map(l => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                  lang === l.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <span className="text-xl">{l.flag}</span>
                <div>
                  <div className="text-sm font-bold text-gray-800">{l.label}</div>
                  <div className="text-[10px] text-gray-400">{l.sub}</div>
                </div>
                {lang === l.id && (
                  <span className="ml-auto text-orange-500 text-base">✓</span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleFinish}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md mt-1"
          >
            Begin Sadhana 🪔
          </button>
        </div>
      )}

      {/* Step dots */}
      <div className="flex gap-2 mt-8">
        <span className={`w-2 h-2 rounded-full ${step === 0 ? 'bg-orange-500' : 'bg-orange-200'}`} />
        <span className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-orange-500' : 'bg-orange-200'}`} />
      </div>
    </div>
  );
};

export default OnboardingScreen;
