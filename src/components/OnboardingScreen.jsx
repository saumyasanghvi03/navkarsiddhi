"use client";

import React, { useState } from 'react';
import { syncUserProfile } from '../lib/nativeWidgetBridge';

const LANGS = [
  { id: 'english',  label: 'English',   flag: '🇮🇳', sub: 'English (India)' },
  { id: 'hindi',    label: 'हिंदी',      flag: '🕉️',  sub: 'Hindi' },
  { id: 'gujarati', label: 'ગુજરાતી',   flag: '🙏',  sub: 'Gujarati' },
];

const GENDERS = [
  { id: 'male',   emoji: '👦', label: 'Male' },
  { id: 'female', emoji: '👧', label: 'Female' },
  { id: 'other',  emoji: '🌿', label: 'Other' },
];

const OnboardingScreen = ({ onDone }) => {
  const [name,   setName]   = useState('');
  const [gender, setGender] = useState('');
  const [lang,   setLang]   = useState('english');
  const [step,   setStep]   = useState(0); // 0=name 1=gender 2=lang

  const handleFinish = () => {
    const trimmed = name.trim();
    try { localStorage.setItem('navkar_user_name',   trimmed); } catch (_) {}
    try { localStorage.setItem('navkar_user_gender', gender);  } catch (_) {}
    try { localStorage.setItem('navkar_tts_lang',    lang);    } catch (_) {}
    syncUserProfile(trimmed, lang, gender);
    onDone({ name: trimmed, gender, lang });
  };

  const greeting = name.trim() ? `Hey ${name.trim()} 💛` : 'One more thing 💛';

  return (
    <div className="fixed inset-0 z-50 bg-[#faf7f2] flex flex-col items-center justify-center px-6">
      <div className="text-5xl mb-2">📿</div>
      <h1 className="text-xl font-serif font-bold text-orange-600 mb-1">Navkar Siddhi</h1>
      <p className="text-xs text-gray-400 mb-8">Jai Jinendra 🙏</p>

      {/* ── Step 1: Name ──────────────────────────────────────── */}
      {step === 0 && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-1">What should I call you?</p>
            <p className="text-xs text-gray-400">I'll use your name when I check in.</p>
          </div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setStep(1)}
            placeholder="Your name"
            maxLength={24}
            autoFocus
            className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 bg-white text-center font-semibold"
          />
          <button
            onClick={() => setStep(1)}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md"
          >
            {name.trim() ? 'Continue →' : 'Skip →'}
          </button>
        </div>
      )}

      {/* ── Step 2: Gender ────────────────────────────────────── */}
      {step === 1 && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-1">{greeting}</p>
            <p className="text-xs text-gray-400">How do you identify?</p>
          </div>
          <div className="flex gap-3">
            {GENDERS.map(g => (
              <button
                key={g.id}
                onClick={() => setGender(g.id)}
                className={`flex-1 flex flex-col items-center py-4 rounded-2xl border-2 transition-all ${
                  gender === g.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <span className="text-2xl mb-1">{g.emoji}</span>
                <span className={`text-xs font-bold ${gender === g.id ? 'text-orange-600' : 'text-gray-500'}`}>
                  {g.label}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md"
          >
            {gender ? 'Continue →' : 'Skip →'}
          </button>
        </div>
      )}

      {/* ── Step 3: Language ──────────────────────────────────── */}
      {step === 2 && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-1">{greeting}</p>
            <p className="text-xs text-gray-400">Which language should I speak in?</p>
          </div>
          <div className="flex flex-col gap-2">
            {LANGS.map(l => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                  lang === l.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white'
                }`}
              >
                <span className="text-xl">{l.flag}</span>
                <div>
                  <div className="text-sm font-bold text-gray-800">{l.label}</div>
                  <div className="text-[10px] text-gray-400">{l.sub}</div>
                </div>
                {lang === l.id && <span className="ml-auto text-orange-500 font-bold">✓</span>}
              </button>
            ))}
          </div>
          <button
            onClick={handleFinish}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md"
          >
            Begin Sadhana 🪔
          </button>
        </div>
      )}

      {/* Step dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map(i => (
          <span key={i} className={`w-2 h-2 rounded-full ${step === i ? 'bg-orange-500' : 'bg-orange-200'}`} />
        ))}
      </div>
    </div>
  );
};

export default OnboardingScreen;
