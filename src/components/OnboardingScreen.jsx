"use client";

import React, { useState } from 'react';
import { syncUserProfile } from '../lib/nativeWidgetBridge';

const LANGS = [
  { id: 'english',  label: 'English',  script: 'English',  flag: '🇮🇳' },
  { id: 'hindi',    label: 'हिंदी',    script: 'Hindi',    flag: '🕉️'  },
  { id: 'gujarati', label: 'ગુજરાતી', script: 'Gujarati', flag: '🙏'  },
];

const GENDERS = [
  { id: 'male',   emoji: '👦', label: { english: 'Male',   hindi: 'पुरुष',  gujarati: 'પુરૂષ'  } },
  { id: 'female', emoji: '👧', label: { english: 'Female', hindi: 'महिला',  gujarati: 'મહિલા'  } },
  { id: 'other',  emoji: '🌿', label: { english: 'Other',  hindi: 'अन्य',   gujarati: 'અન્ય'   } },
];

const L = {
  name_q:   { english: 'What should I call you?',             hindi: 'मैं आपको क्या कहूँ?',             gujarati: 'હું તમને શું કહું?' },
  name_sub: { english: "I'll use your name when I check in.", hindi: 'चेक-इन पर आपका नाम लूँगा।',      gujarati: 'ચેક-ઇन વखते નામ વાપરીશ.' },
  name_ph:  { english: 'Your name',                          hindi: 'आपका नाम',                        gujarati: 'તમારું નામ' },
  city_q:   { english: 'Which city are you in?',             hindi: 'आप किस शहर में हैं?',             gujarati: 'તમે ક્યા શહેરમાં છો?' },
  city_sub: { english: 'For local parva & muhurat timings.', hindi: 'स्थानीय पर्व और मुहूर्त के लिए।', gujarati: 'સ્થાનિક પર્વ અને મુહૂર્ત માટે.' },
  city_ph:  { english: 'e.g. Ahmedabad, Mumbai…',            hindi: 'जैसे अहमदाबाद, मुंबई…',           gujarati: 'દા.ત. અમદાવાદ, મુંબઈ…' },
  gender_q: { english: 'How do you identify?',               hindi: 'आप क्या कहलाना पसंद करते हैं?',  gujarati: 'તમે કઈ ઓળખ પ્રેફર કરો છો?' },
  optional: { english: '(optional)',                          hindi: '(वैकल्पिक)',                      gujarati: '(વૈકલ્પિક)' },
  lang_q:   { english: 'Choose your app language',           hindi: 'ऐप की भाषा चुनें',               gujarati: 'એપ ભાષા પસંદ કરો' },
  lang_sub: { english: 'Mantra, UI & greetings will follow.',hindi: 'मंत्र, UI और अभिवादन इसी भाषा में।', gujarati: 'મંત્ર, UI અને શુભેચ્છા આ ભાષામાં.' },
  continue: { english: 'Continue →', hindi: 'आगे बढ़ें →', gujarati: 'આગળ વધો →' },
  skip:     { english: 'Skip →',     hindi: 'छोड़ें →',    gujarati: 'છોડો →' },
  begin:    { english: 'Begin Sadhana 🪔', hindi: 'साधना शुरू करें 🪔', gujarati: 'સાધના શરૂ કરો 🪔' },
};

const l = (key, lang) => L[key]?.[lang] ?? L[key]?.english ?? '';

// 0=name, 1=city, 2=gender, 3=language
const STEPS = 4;

const OnboardingScreen = ({ onDone }) => {
  const [name,   setName]   = useState('');
  const [city,   setCity]   = useState('');
  const [gender, setGender] = useState('');
  const [lang,   setLang]   = useState('english');
  const [step,   setStep]   = useState(0);

  const handleFinish = () => {
    const trimName = name.trim();
    const trimCity = city.trim();
    try { localStorage.setItem('navkar_onboarded',   '1');       } catch (_) {}
    try { localStorage.setItem('navkar_user_name',   trimName);  } catch (_) {}
    try { localStorage.setItem('navkar_user_city',   trimCity);  } catch (_) {}
    try { localStorage.setItem('navkar_user_gender', gender);    } catch (_) {}
    try { localStorage.setItem('navkar_tts_lang',    lang);      } catch (_) {}
    syncUserProfile(trimName, lang, gender);
    onDone({ name: trimName, city: trimCity, gender, lang });
  };

  const hey = name.trim()
    ? (lang === 'gujarati' ? `${name.trim()} 💛` : lang === 'hindi' ? `${name.trim()} 💛` : `Hey ${name.trim()} 💛`)
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-[#faf7f2] flex flex-col items-center justify-center px-6">
      <div className="text-5xl mb-2">📿</div>
      <h1 className="text-xl font-serif font-bold text-orange-600 mb-1">Navkar Siddhi</h1>
      <p className="text-xs text-gray-400 mb-8">Jai Jinendra 🙏</p>

      {/* Step 0 — Name */}
      {step === 0 && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-1">{l('name_q', lang)}</p>
            <p className="text-xs text-gray-400">{l('name_sub', lang)}</p>
          </div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setStep(1)}
            placeholder={l('name_ph', lang)}
            maxLength={24}
            autoFocus
            className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 bg-white text-center font-semibold"
          />
          <button
            onClick={() => setStep(1)}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md"
          >
            {name.trim() ? l('continue', lang) : l('skip', lang)}
          </button>
        </div>
      )}

      {/* Step 1 — City */}
      {step === 1 && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-1">{hey || l('city_q', lang)}</p>
            <p className="text-xs text-gray-400">{l('city_sub', lang)}</p>
          </div>
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setStep(2)}
            placeholder={l('city_ph', lang)}
            maxLength={32}
            autoFocus
            className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 bg-white text-center font-semibold"
          />
          <button
            onClick={() => setStep(2)}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md"
          >
            {city.trim() ? l('continue', lang) : l('skip', lang)}
          </button>
        </div>
      )}

      {/* Step 2 — Gender (optional) */}
      {step === 2 && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-0.5">{l('gender_q', lang)}</p>
            <p className="text-xs text-gray-400">{l('optional', lang)}</p>
          </div>
          <div className="flex gap-3">
            {GENDERS.map(g => (
              <button
                key={g.id}
                onClick={() => setGender(gender === g.id ? '' : g.id)}
                className={`flex-1 flex flex-col items-center py-4 rounded-2xl border-2 transition-all ${
                  gender === g.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white'
                }`}
              >
                <span className="text-2xl mb-1">{g.emoji}</span>
                <span className={`text-xs font-bold ${gender === g.id ? 'text-orange-600' : 'text-gray-500'}`}>
                  {g.label[lang] ?? g.label.english}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(3)}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md"
          >
            {gender ? l('continue', lang) : l('skip', lang)}
          </button>
        </div>
      )}

      {/* Step 3 — Language */}
      {step === 3 && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-1">{l('lang_q', lang)}</p>
            <p className="text-xs text-gray-400">{l('lang_sub', lang)}</p>
          </div>
          <div className="flex flex-col gap-2">
            {LANGS.map(lg => (
              <button
                key={lg.id}
                onClick={() => setLang(lg.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                  lang === lg.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white'
                }`}
              >
                <span className="text-xl">{lg.flag}</span>
                <div>
                  <div className="text-sm font-bold text-gray-800">{lg.label}</div>
                  <div className="text-[10px] text-gray-400">{lg.script}</div>
                </div>
                {lang === lg.id && <span className="ml-auto text-orange-500 font-bold">✓</span>}
              </button>
            ))}
          </div>
          <button
            onClick={handleFinish}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md"
          >
            {l('begin', lang)}
          </button>
        </div>
      )}

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {Array.from({ length: STEPS }, (_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              step === i ? 'bg-orange-500 w-4' : 'bg-orange-200 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingScreen;
