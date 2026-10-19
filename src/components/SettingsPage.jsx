"use client";

import React, { useState, useEffect } from 'react';
import { useNav, LANGUAGES } from '../lib/navContext';
import { syncUserProfile } from '../lib/nativeWidgetBridge';

const LANGS = [
  { id: 'english',  label: 'English',  native: 'English',   flag: '🇮🇳' },
  { id: 'hindi',    label: 'हिंदी',     native: 'Hindi',     flag: '🕉️'  },
  { id: 'gujarati', label: 'ગુજરાતી',  native: 'Gujarati',  flag: '🙏'  },
];

const UI = {
  title:      { english: 'App Settings',       hindi: 'ऐप सेटिंग्स',     gujarati: 'એપ સેટિંગ્સ'     },
  profile:    { english: 'Your Profile',        hindi: 'आपकी प्रोफ़ाइल',  gujarati: 'તમારી પ્રોફાઇલ'  },
  name:       { english: 'Name',               hindi: 'नाम',              gujarati: 'નામ'              },
  name_ph:    { english: 'Your name',          hindi: 'आपका नाम',         gujarati: 'તમારું નામ'       },
  city:       { english: 'City',               hindi: 'शहर',              gujarati: 'શહેર'             },
  city_ph:    { english: 'e.g. Ahmedabad',     hindi: 'जैसे अहमदाबाद',   gujarati: 'દા.ત. અમદાવાદ'   },
  lang:       { english: 'App Language',       hindi: 'ऐप भाषा',         gujarati: 'એપ ભાષા'         },
  save:       { english: 'Save Changes',       hindi: 'बदलाव सहेजें',    gujarati: 'ફેરફાર સાચવો'    },
  saved:      { english: 'Saved ✓',            hindi: 'सहेजा ✓',         gujarati: 'સાચવ્યું ✓'      },
  back:       { english: '← Back',             hindi: '← वापस',          gujarati: '← પાછળ'          },
  reset:      { english: 'Reset Onboarding',   hindi: 'ऑनबोर्डिंग रीसेट', gujarati: 'ઑનબોર્ડિંગ રીસેટ' },
};

const u = (key, lang) => UI[key]?.[lang] ?? UI[key]?.english ?? '';

const SettingsPage = () => {
  const { language, setLanguage, setPage } = useNav();
  const lang = language;

  const [name, setName]   = useState('');
  const [city, setCity]   = useState('');
  const [selLang, setSelLang] = useState(lang);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      setName(localStorage.getItem('navkar_user_name') || '');
      setCity(localStorage.getItem('navkar_user_city') || '');
      setSelLang(localStorage.getItem('navkar_tts_lang') || lang);
    } catch (_) {}
  }, [lang]);

  const handleSave = () => {
    const trimName = name.trim();
    const trimCity = city.trim();
    try { localStorage.setItem('navkar_user_name', trimName); } catch (_) {}
    try { localStorage.setItem('navkar_user_city', trimCity); } catch (_) {}
    try { localStorage.setItem('navkar_tts_lang',  selLang);  } catch (_) {}
    setLanguage(selLang);
    syncUserProfile(trimName, selLang, '');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetOnboarding = () => {
    try { localStorage.removeItem('navkar_onboarded'); } catch (_) {}
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-16 pb-12 px-4">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setPage('vibes')} className="text-sm text-orange-600 hover:text-orange-800">
            {u('back', lang)}
          </button>
          <h1 className="text-lg font-serif font-bold text-orange-900 flex-1 text-center pr-10">
            ⚙️ {u('title', lang)}
          </h1>
        </div>

        {/* Profile section */}
        <section className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 mb-4">
          <h2 className="text-sm font-bold text-orange-800 mb-4">{u('profile', lang)}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">{u('name', lang)}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={u('name_ph', lang)}
                maxLength={24}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">{u('city', lang)}</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder={u('city_ph', lang)}
                maxLength={32}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
              />
            </div>
          </div>
        </section>

        {/* Language section */}
        <section className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 mb-4">
          <h2 className="text-sm font-bold text-orange-800 mb-3">{u('lang', lang)}</h2>
          <div className="flex flex-col gap-2">
            {LANGS.map(lg => (
              <button
                key={lg.id}
                onClick={() => setSelLang(lg.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  selLang === lg.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-orange-200'
                }`}
              >
                <span className="text-xl">{lg.flag}</span>
                <div>
                  <div className="text-sm font-bold text-gray-800">{lg.label}</div>
                  <div className="text-[10px] text-gray-400">{lg.native}</div>
                </div>
                {selLang === lg.id && <span className="ml-auto text-orange-500 font-bold text-sm">✓</span>}
              </button>
            ))}
          </div>
        </section>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 rounded-2xl text-sm font-bold shadow-md hover:from-orange-700 hover:to-amber-600 transition-all mb-4"
        >
          {saved ? u('saved', lang) : u('save', lang)}
        </button>

        {/* Reset onboarding */}
        <div className="text-center">
          <button
            onClick={handleResetOnboarding}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            {u('reset', lang)}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
