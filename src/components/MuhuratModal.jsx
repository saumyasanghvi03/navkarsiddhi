import React, { useState } from 'react';
import { getChoghadiyaSlots, CHOGHADIYA_TYPES, HORA_NOTES } from '../lib/muhuratData';

export const MuhuratModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('day');
  const today = new Date();
  
  if (!isOpen) return null;

  const daySlots = getChoghadiyaSlots('06:30', '18:30', false, today);
  const nightSlots = getChoghadiyaSlots('18:30', '06:30', true, today);

  const activeSlots = activeTab === 'day' ? daySlots : nightSlots;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-amber-50">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🕐</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-400 font-serif">ચોઘડિયા અને મુહૂર્ત (Choghadiya & Muhurat)</h2>
              <p className="text-xs sm:text-sm text-amber-200/70">દિવસ અને રાત્રિના ચોઘડિયા, હોરા તથા શુભ સમય કોષ્ટક</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 border-b border-amber-500/10 bg-slate-900/90 flex space-x-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('day')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'day'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-amber-200/70 hover:bg-slate-750'
            }`}
          >
            ☀️ દિવસના ચોઘડિયા (Day)
          </button>
          <button
            onClick={() => setActiveTab('night')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'night'
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800 text-amber-200/70 hover:bg-slate-750'
            }`}
          >
            🌙 રાત્રિના ચોઘડિયા (Night)
          </button>
          <button
            onClick={() => setActiveTab('hora')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'hora'
                ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-amber-200/70 hover:bg-slate-750'
            }`}
          >
            ✨ હોરા માર્ગદર્શન (Hora)
          </button>
          <button
            onClick={() => setActiveTab('poonam')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'poonam'
                ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/20'
                : 'bg-slate-800 text-amber-200/70 hover:bg-slate-750'
            }`}
          >
            🌕 સાલાના પૂનમ તિથિઓ
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {(activeTab === 'day' || activeTab === 'night') && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-amber-300">
                  {activeTab === 'day' ? 'સૂર્યોદય થી સૂર્યાસ્ત સુધિના ૮ ચોઘડિયા' : 'સૂર્યાસ્ત થી સૂર્યોદય સુધિના ૮ રાત્રિ ચોઘડિયા'}
                </span>
                <span className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-amber-500/20 text-amber-200">
                  આજનો વાર: {['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'][today.getDay()]}વાર
                </span>
              </div>

              {/* Choghadiya Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {activeSlots.map((slot) => {
                  const isShubh = slot.quality === 'Shubh';
                  const isAshubh = slot.quality === 'Ashubh';

                  return (
                    <div
                      key={slot.index}
                      className="p-4 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: isShubh ? 'rgba(6, 78, 59, 0.4)' : isAshubh ? 'rgba(127, 29, 29, 0.3)' : 'rgba(120, 53, 15, 0.3)',
                        borderColor: slot.color
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-slate-300">#{slot.index}</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: slot.color }}
                        >
                          {slot.quality === 'Shubh' ? 'શુભ' : slot.quality === 'Ashubh' ? 'અશુભ' : 'મધ્યમ'}
                        </span>
                      </div>

                      <div className="my-2">
                        <h3 className="text-2xl font-bold font-serif text-white">{slot.nameGu}</h3>
                        <p className="text-xs text-slate-300 mt-1">{slot.description}</p>
                      </div>

                      <div className="pt-2 border-t border-white/10 text-xs font-mono text-amber-200/90 font-semibold">
                        ⏱️ {slot.startTime} - {slot.endTime}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quality Legend */}
              <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-xs text-amber-100">શુભ (અમૃત, શુભ, લાભ) - ઉત્તમ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-xs text-amber-100">મધ્યમ (ચલ) - સામાન્ય/યાત્રા</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-xs text-amber-100">અશુભ (ઉદ્વેગ, કાળ, રોગ) - ત્યાજ્ય</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hora' && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <h3 className="text-lg font-bold text-emerald-300 mb-2 font-serif">✨ દિવસ અને રાત્રિના હોરા માર્ગદર્શન</h3>
                <p className="text-sm text-emerald-100/90 leading-relaxed whitespace-pre-line">
                  {HORA_NOTES.shubhHora}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20">
                  <h4 className="font-bold text-amber-300 text-sm mb-2">ગૃહ/નક્ષત્ર શુભ ફળ</h4>
                  <ul className="space-y-1.5 text-xs text-amber-100/80">
                    <li>☀️ <b>સૂર્ય હોરા:</b> રાજકીય કાર્ય, સત્તા મેળવવા માટે</li>
                    <li>🌙 <b>ચંદ્ર હોરા:</b> તમામ શુભ કાર્યો, દ્રવ્ય સંચય</li>
                    <li>🧠 <b>બુધ હોરા:</b> વિધ્યા, બુદ્ધિ, અધ્યયન અનુષ્ઠાન</li>
                    <li>🎓 <b>ગુરુ હોરા:</b> દીક્ષા, તપ, જ્ઞાન અને વિવાહ માટે</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20">
                  <h4 className="font-bold text-amber-300 text-sm mb-2">અન્ય હોરા માર્ગદર્શન</h4>
                  <ul className="space-y-1.5 text-xs text-amber-100/80">
                    <li>💖 <b>શુક્ર હોરા:</b> પ્રવાસ, અલંકાર, મંગલ વિવાહ</li>
                    <li>🛡️ <b>શનિ હોરા:</b> સ્થિર કાર્યો, દ્રવ્ય સંગ્રહ</li>
                    <li>⚔️ <b>મંગળ હોરા:</b> યુદ્ધ, શસ્ત્ર, વાદ-વિવાદ</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'poonam' && (
            <div>
              <h3 className="text-lg font-bold text-amber-300 mb-3 font-serif">🌕 સાલાના પૂનમ તિથિઓ (Yearly Poonam Dates)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {HORA_NOTES.salanaPoonam2026.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/20 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-amber-300 text-sm block">{item.month}</span>
                      <span className="text-xs text-amber-200/60">{item.day}</span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-amber-500/20 bg-slate-950 flex justify-between items-center text-xs text-amber-200/60">
          <span>સ્રોત: મુહૂર્ત અને ચોઘડિયા કોષ્ટક dataset</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors border border-amber-500/30 font-medium"
          >
            બંધ કરો (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
