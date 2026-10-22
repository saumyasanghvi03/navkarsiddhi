"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { syncUserProfile } from '../lib/nativeWidgetBridge';
import { INDIA_CITIES, setUserCity } from '../lib/cityStorage';
import { apiUrl } from '../lib/apiBase';

const SORTED_CITIES = Object.entries(INDIA_CITIES).sort((a, b) => a[1].name.localeCompare(b[1].name));

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
  name_q:    { english: 'What should I call you?',              hindi: 'मैं आपको क्या कहूँ?',             gujarati: 'હું તમને શું કહું?' },
  name_sub:  { english: "I'll use your name when I check in.",  hindi: 'चेक-इन पर आपका नाम लूँगा।',      gujarati: 'ચેક-ઇन วखते નામ વાપરીશ.' },
  name_ph:   { english: 'Your name',                           hindi: 'आपका नाम',                        gujarati: 'તમારું નામ' },
  city_q:    { english: 'Which city are you in?',              hindi: 'आप किस शहर में हैं?',             gujarati: 'તમે ક્યા શહેરમાં છો?' },
  city_sub:  { english: 'See your city on the India Navkar Map.', hindi: 'भारत नवकार मैप पर अपना शहर देखें।', gujarati: 'ભારત નવકાર મૅપ પર તમારું શહેર જૂઓ.' },
  city_search:{ english: 'Search city or state…',              hindi: 'शहर या राज्य खोजें…',             gujarati: 'શહેર અથવા રાજ્ય શોધો…' },
  city_skip: { english: 'My city is not listed →',             hindi: 'मेरा शहर नहीं है →',              gujarati: 'મારૂ શહેર નથી →' },
  map_title: { english: 'JainZ are chanting across India 🇮🇳', hindi: 'जैन भारत भर में जाप कर रहे हैं 🇮🇳', gujarati: 'જૈનો ભારતભરમાં જાપ કરી રહ્યા છે 🇮🇳' },
  map_sub:   { english: 'Your city is now on the map.',        hindi: 'आपका शहर अब मैप पर है।',          gujarati: 'તમારૂ શહેર હવે મૅપ પર છે.' },
  map_next:  { english: 'Continue →',                         hindi: 'आगे बढ़ें →',                      gujarati: 'આગળ વધો →' },
  gender_q:  { english: 'How do you identify?',               hindi: 'आप क्या कहलाना पसंद करते हैं?',  gujarati: 'તમે કઈ ઓળખ પ્રેફર કરો છો?' },
  optional:  { english: '(optional)',                         hindi: '(वैकल्पिक)',                      gujarati: '(વૈકલ્પિક)' },
  lang_q:    { english: 'Choose your app language',           hindi: 'ऐप की भाषा चुनें',               gujarati: 'એપ ભાષા પસંદ કરો' },
  lang_sub:  { english: 'Mantra, UI & greetings will follow.',hindi: 'मंत्र, UI और अभिवादन इसी भाषा में।', gujarati: 'મંત્ર, UI અને શુભેચ્છા આ ભાષામાં.' },
  continue:  { english: 'Continue →', hindi: 'आगे बढ़ें →', gujarati: 'આગળ વધો →' },
  skip:      { english: 'Skip →',     hindi: 'छोड़ें →',    gujarati: 'છોડો →' },
  begin:     { english: 'Begin Sadhana 🪔', hindi: 'साधना शुरू करें 🪔', gujarati: 'સાધના શરૂ કરો 🪔' },
  allow_q:   { english: 'Allow Navkar Siddhi?', hindi: 'नवकार सिद्धि को अनुमति दें?', gujarati: 'નવકાર સિદ્ધિને પરવાનગી આપો?' },
  allow_sub: { english: 'Get reminders for Pacham, Aatham, Paryushan and every Jain parva — ahead of time.', hindi: 'पचम, आठम, पर्युषण और हर जैन पर्व की अग्रिम सूचना पाएं।', gujarati: 'પાંચમ, આઠમ, પર્યુષણ અને દરેક જૈન પર્વ માટે અગ્રિમ સૂચના મેળવો.' },
  allow_yes: { english: '🔔 Yes, allow notifications', hindi: '🔔 हाँ, सूचनाएं दें', gujarati: '🔔 હા, સૂચनाઓ આપો' },
  allow_no:  { english: 'Not now →', hindi: 'अभी नहीं →', gujarati: 'હमणாं નहीं →' },
};

const l = (key, lang) => L[key]?.[lang] ?? L[key]?.english ?? '';

// Steps: 0=name 1=city-picker 2=heatmap-preview 3=gender 4=language 5=allow(web)
const isWeb = typeof window !== 'undefined' && !window?.Capacitor?.isNativePlatform?.();

// ── Mini India heatmap (SVG) ────────────────────────────────────────────────
const BOUNDS = { minLat: 6.5, maxLat: 35.5, minLng: 68.0, maxLng: 97.5 };
const W = 280, H = 320;
const toXY = (lat, lng) => ({
  x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W,
  y: ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H,
});

function MiniHeatmap({ cityId, cityData }) {
  const cityMap = useMemo(() => {
    const m = {};
    cityData.forEach(d => { m[d.cityId] = d.count; });
    return m;
  }, [cityData]);

  const maxCount = useMemo(() => Math.max(...cityData.map(d => d.count), 1), [cityData]);

  const dots = useMemo(() =>
    Object.entries(INDIA_CITIES).map(([id, meta]) => {
      const { x, y } = toXY(meta.lat, meta.lng);
      const count = cityMap[id] || 0;
      return { id, meta, x, y, count };
    }), [cityMap]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
      {dots.map(({ id, meta, x, y, count }) => {
        const isUser = id === cityId;
        const intensity = count > 0 ? count / maxCount : 0;
        const r = count > 0 ? 5 + intensity * 12 : 3;
        const opacity = count > 0 ? 0.4 + intensity * 0.6 : 0.12;
        return (
          <g key={id}>
            {count > 0 && (
              <circle cx={x} cy={y} r={r * 2}
                fill={`rgba(251,191,36,${opacity * 0.18})`} />
            )}
            <circle cx={x} cy={y} r={isUser ? Math.max(r, 7) : r}
              fill={isUser ? 'rgba(52,211,153,0.9)' : `rgba(251,191,36,${opacity})`}
              stroke={isUser ? 'rgba(52,211,153,0.5)' : 'none'}
              strokeWidth={isUser ? 2 : 0}
            />
            {isUser && (
              <circle cx={x} cy={y} r={14}
                fill="none" stroke="rgba(52,211,153,0.4)" strokeWidth={1.5}
                style={{ animation: 'ping 1.5s ease-out infinite' }}
              />
            )}
            {(isUser || intensity > 0.4) && (
              <text x={x} y={y - (isUser ? 10 : r + 3)}
                textAnchor="middle" fill={isUser ? 'rgba(52,211,153,0.9)' : 'rgba(255,255,255,0.55)'}
                fontSize={isUser ? 9 : 7.5} fontFamily="sans-serif" fontWeight={isUser ? 'bold' : 'normal'}>
                {meta.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Main onboarding ─────────────────────────────────────────────────────────
const OnboardingScreen = ({ onDone }) => {
  const [name,    setName]    = useState('');
  const [cityId,  setCityId]  = useState('');   // INDIA_CITIES key
  const [gender,  setGender]  = useState('');
  const [lang,    setLang]    = useState('english');
  const [step,    setStep]    = useState(0);
  const [search,  setSearch]  = useState('');
  const [cityData, setCityData] = useState([]);
  const [globalCount, setGlobalCount] = useState(null);

  // Fetch heatmap data when step 2 is shown
  useEffect(() => {
    if (step !== 2) return;
    const fetch_ = async () => {
      try {
        const res = await fetch(apiUrl('/api/navkar'));
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.cities)) setCityData(data.cities);
        if (typeof data.total === 'number') setGlobalCount(data.total);
      } catch (_) {}
    };
    fetch_();
  }, [step]);

  const filteredCities = useMemo(() =>
    search.trim()
      ? SORTED_CITIES.filter(([, m]) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.state.toLowerCase().includes(search.toLowerCase()))
      : SORTED_CITIES,
    [search]);

  const finish = () => {
    const trimName = name.trim();
    const cityMeta = INDIA_CITIES[cityId];
    const cityDisplay = cityMeta ? cityMeta.name : cityId;
    try { localStorage.setItem('navkar_onboarded',    '1');          } catch (_) {}
    try { localStorage.setItem('navkar_onboarded_v2', '1');         } catch (_) {}
    try { localStorage.setItem('navkar_user_name',   trimName);     } catch (_) {}
    try { localStorage.setItem('navkar_user_city',   cityId || ''); } catch (_) {}
    try { localStorage.setItem('navkar_user_gender', gender);       } catch (_) {}
    try { localStorage.setItem('navkar_tts_lang',    lang);         } catch (_) {}
    if (cityId) setUserCity(cityId);
    syncUserProfile(trimName, lang, gender);
    onDone({ name: trimName, city: cityDisplay, gender, lang });
  };

  const handleFinish = () => {
    if (isWeb) setStep(5); else finish();
  };

  const handleAllow = async () => {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch (_) {}
    finish();
  };

  const TOTAL_STEPS = isWeb ? 6 : 5; // 0-5 on web, 0-4 on native
  const hey = name.trim()
    ? (lang === 'gujarati' ? `${name.trim()} 💛` : lang === 'hindi' ? `${name.trim()} 💛` : `Hey ${name.trim()} 💛`)
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-[#faf7f2] flex flex-col items-center justify-center px-6">
      {step !== 2 && (
        <>
          <div className="text-5xl mb-2">📿</div>
          <h1 className="text-xl font-serif font-bold text-orange-600 mb-1">Navkar Siddhi</h1>
          <p className="text-xs text-gray-400 mb-8">Jai Jinendra 🙏</p>
        </>
      )}

      {/* Step 0 — Name */}
      {step === 0 && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-1">{l('name_q', lang)}</p>
            <p className="text-xs text-gray-400">{l('name_sub', lang)}</p>
          </div>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setStep(1)}
            placeholder={l('name_ph', lang)} maxLength={24} autoFocus
            className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 bg-white text-center font-semibold"
          />
          <button onClick={() => setStep(1)}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md">
            {name.trim() ? l('continue', lang) : l('skip', lang)}
          </button>
        </div>
      )}

      {/* Step 1 — City picker */}
      {step === 1 && (
        <div className="w-full max-w-xs flex flex-col gap-3">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-1">{hey || l('city_q', lang)}</p>
            <p className="text-xs text-gray-400">{l('city_sub', lang)}</p>
          </div>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={l('city_search', lang)} autoFocus
            className="w-full border-2 border-orange-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 bg-white"
          />
          <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden max-h-52 overflow-y-auto">
            {filteredCities.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-6">No cities found</p>
            )}
            {filteredCities.map(([id, meta]) => (
              <button key={id} onClick={() => { setCityId(id); setSearch(''); setStep(2); }}
                className="w-full text-left px-4 py-2.5 hover:bg-orange-50 flex items-center gap-2.5 border-b border-orange-50 last:border-0">
                <span className="text-orange-400 text-sm">📍</span>
                <div>
                  <span className="text-sm font-medium text-gray-800 block">{meta.name}</span>
                  <span className="text-[10px] text-gray-400">{meta.state}</span>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(3)}
            className="text-xs text-gray-400 hover:text-orange-500 transition-colors text-center py-1">
            {l('city_skip', lang)}
          </button>
        </div>
      )}

      {/* Step 2 — Heatmap preview */}
      {step === 2 && cityId && (
        <div className="fixed inset-0 z-50 bg-[#03061a] flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 text-center px-6 pt-8 pb-3">
            <div className="text-3xl mb-2">🇮🇳</div>
            <p className="text-white font-bold text-base font-serif">{l('map_title', lang)}</p>
            <p className="text-emerald-400 text-xs mt-1">
              📍 {INDIA_CITIES[cityId]?.name} — {l('map_sub', lang)}
            </p>
            {globalCount !== null && (
              <p className="text-amber-400/80 text-xs mt-0.5 font-bold font-mono">
                {globalCount.toLocaleString('en-IN')} navkars across India
              </p>
            )}
          </div>

          {/* Map */}
          <div className="flex-1 min-h-0 px-4">
            <MiniHeatmap cityId={cityId} cityData={cityData} />
          </div>

          {/* Continue */}
          <div className="flex-shrink-0 px-6 pb-8 pt-3">
            <button onClick={() => setStep(3)}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md">
              {l('map_next', lang)}
            </button>
          </div>

          <style>{`
            @keyframes ping {
              0% { transform: scale(1); opacity: 0.7; }
              100% { transform: scale(2.2); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Step 3 — Gender (optional) */}
      {step === 3 && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-0.5">{l('gender_q', lang)}</p>
            <p className="text-xs text-gray-400">{l('optional', lang)}</p>
          </div>
          <div className="flex gap-3">
            {GENDERS.map(g => (
              <button key={g.id}
                onClick={() => setGender(gender === g.id ? '' : g.id)}
                className={`flex-1 flex flex-col items-center py-4 rounded-2xl border-2 transition-all ${
                  gender === g.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white'
                }`}>
                <span className="text-2xl mb-1">{g.emoji}</span>
                <span className={`text-xs font-bold ${gender === g.id ? 'text-orange-600' : 'text-gray-500'}`}>
                  {g.label[lang] ?? g.label.english}
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(4)}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md">
            {gender ? l('continue', lang) : l('skip', lang)}
          </button>
        </div>
      )}

      {/* Step 4 — Language */}
      {step === 4 && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-gray-800 mb-1">{l('lang_q', lang)}</p>
            <p className="text-xs text-gray-400">{l('lang_sub', lang)}</p>
          </div>
          <div className="flex flex-col gap-2">
            {LANGS.map(lg => (
              <button key={lg.id} onClick={() => setLang(lg.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                  lang === lg.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white'
                }`}>
                <span className="text-xl">{lg.flag}</span>
                <div>
                  <div className="text-sm font-bold text-gray-800">{lg.label}</div>
                  <div className="text-[10px] text-gray-400">{lg.script}</div>
                </div>
                {lang === lg.id && <span className="ml-auto text-orange-500 font-bold">✓</span>}
              </button>
            ))}
          </div>
          <button onClick={handleFinish}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md">
            {l('begin', lang)}
          </button>
        </div>
      )}

      {/* Step 5 — Allow notifications (web only) */}
      {step === 5 && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <div className="text-5xl mb-3">🔔</div>
            <p className="text-base font-bold text-gray-800 mb-1">{l('allow_q', lang)}</p>
            <p className="text-xs text-gray-400 leading-relaxed">{l('allow_sub', lang)}</p>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-orange-700 font-medium">📿 Pacham · Aatham · Paryushan · Diwali · and more</p>
          </div>
          <button onClick={handleAllow}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md">
            {l('allow_yes', lang)}
          </button>
          <button onClick={finish} className="w-full text-gray-400 text-sm py-2">
            {l('allow_no', lang)}
          </button>
        </div>
      )}

      {/* Progress dots — hide on heatmap step */}
      {step !== 2 && (
        <div className="flex gap-2 mt-8">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === i ? 'bg-orange-500 w-4' :
                (step === 2 && i === 1) ? 'bg-orange-500 w-2' :
                'bg-orange-200 w-2'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OnboardingScreen;
