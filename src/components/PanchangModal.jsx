import React, { useState } from 'react';
import { getPanchangForDate, PANCHANG_DATASET } from '../lib/panchangData';

export const PanchangModal = ({ isOpen, onClose }) => {
  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayISO);

  if (!isOpen) return null;

  const currentPanchang = getPanchangForDate(selectedDate);
  const isToday = selectedDate === todayISO;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-amber-50">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🗓️</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-400 font-serif">જૈન પંચાંગ (Jain Panchang)</h2>
              <p className="text-xs sm:text-sm text-amber-200/70">વિક્રમ સંવત ૨૦૮૨-૨૦૮૩ જૈન માસ, તિથિ અને ઉત્સવો</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Date Selector Bar */}
        <div className="p-3 border-b border-amber-500/10 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-amber-200/80 font-medium">તારીખ પસંદ કરો:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-amber-500/30 rounded-lg text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedDate(todayISO)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isToday
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-750'
              }`}
            >
              আজ (TODAY)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Main Card for Selected Date */}
          <div className="relative rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 border-2 border-amber-500/30 p-5 sm:p-6 shadow-xl">
            {isToday && (
              <span className="absolute top-4 right-4 text-xs font-extrabold px-3 py-1 bg-amber-500 text-slate-950 rounded-full shadow-lg">
                આજ (TODAY)
              </span>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-amber-500/20 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
                  વિક્રમ સંવત {currentPanchang.vikram_samvat}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-serif mt-0.5">
                  {currentPanchang.jain_month} {currentPanchang.tithi}
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-base sm:text-lg font-bold text-amber-100 font-mono">
                  {currentPanchang.gregorian_date}
                </span>
                <p className="text-xs text-amber-200/70">{currentPanchang.weekdayGu} ({currentPanchang.weekdayEn})</p>
              </div>
            </div>

            {/* Sun & Timing Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/10">
                <span className="text-[10px] text-amber-400/70 block uppercase font-bold">🌅 સૂર્યોદય (Sunrise)</span>
                <span className="text-base font-mono font-bold text-amber-200">{currentPanchang.sunrise}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/10">
                <span className="text-[10px] text-amber-400/70 block uppercase font-bold">🌇 સૂર્યાસ્ત (Sunset)</span>
                <span className="text-base font-mono font-bold text-amber-200">{currentPanchang.sunset}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/10">
                <span className="text-[10px] text-amber-400/70 block uppercase font-bold">🥛 નવકારસી</span>
                <span className="text-base font-mono font-bold text-amber-200">{currentPanchang.navkarsi}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/10">
                <span className="text-[10px] text-amber-400/70 block uppercase font-bold">☀️ પૌરસી</span>
                <span className="text-base font-mono font-bold text-amber-200">{currentPanchang.porsi}</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/10">
                <span className="text-amber-400 font-bold block mb-1">✨ નક્ષત્ર:</span>
                <span className="text-amber-100 font-medium">{currentPanchang.nakshatra}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/10">
                <span className="text-amber-400 font-bold block mb-1">🕊️ પક્ષ / વાર:</span>
                <span className="text-amber-100 font-medium">{currentPanchang.paksha === 'Sud' ? 'શુક્લ (સુદ) પક્ષ' : 'કૃષ્ણ (વદ) પક્ષ'} • {currentPanchang.weekdayGu}</span>
              </div>
            </div>

            {/* Events & Festivals */}
            {currentPanchang.events && currentPanchang.events.length > 0 && (
              <div className="mt-4 pt-3 border-t border-amber-500/20">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                  🎉 ધાર્મિક ઉત્સવો અને પર્વ (Events & Festivals):
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentPanchang.events.map((ev, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                    >
                      🚩 {ev}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Monthly Highlights Browser */}
          <div>
            <h4 className="text-sm font-bold text-amber-400 mb-2 font-serif">📅 પંચાંગ તિથિ સૂચિ (Panchang Highlights)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[30vh] overflow-y-auto pr-1">
              {Object.entries(PANCHANG_DATASET).map(([dateStr, item]) => {
                const isSelected = dateStr === selectedDate;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-950/60 border-amber-500/10 hover:border-amber-500/30 text-amber-100/70'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">{item.jain_month} {item.tithi}</span>
                      <span className="text-[11px] text-amber-200/60 font-mono">{item.gregorian_date} ({item.weekdayGu})</span>
                    </div>
                    {item.events.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                        {item.events[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-amber-500/20 bg-slate-950 flex justify-between items-center text-xs text-amber-200/60">
          <span>સ્રોત: શ્વેતાંબર પંચાંગ કૅલેન્ડર dataset</span>
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
