import React, { useState } from 'react';
import { PACHKAN_DATASET } from '../lib/pachkanData';

export const PachkanModal = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState(PACHKAN_DATASET[0]);

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'બધા (All)' },
    { id: 'Morning', label: 'સવાર (Morning)' },
    { id: 'Day', label: 'દિવસે (Day)' },
    { id: 'Fast', label: 'તપ / ઉપવાસ (Fast)' },
    { id: 'Evening', label: 'સાંજ / ચૌવિહાર (Evening)' },
  ];

  const filteredItems = PACHKAN_DATASET.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.gujaratiText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-amber-50">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📿</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-400 font-serif">જૈન પચ્ચક્ખાણ (Pachkan Sutras)</h2>
              <p className="text-xs sm:text-sm text-amber-200/70">મૂળ ગુરુદેવ મુખેથી બોલાતા પવિત્ર પચ્ચક્ખાણ સૂત્રો</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-amber-500/10 bg-slate-900/90 space-y-3">
          <input
            type="text"
            placeholder="શોધો (Search Pachkan by name, text...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-amber-500/20 rounded-xl text-amber-100 placeholder-amber-500/40 focus:outline-none focus:border-amber-400/60 text-sm"
          />
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800/80 text-amber-200/70 hover:bg-slate-800 hover:text-amber-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body (Split view on large screens) */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Left Column: Pachkan List */}
          <div className="md:col-span-5 space-y-2 max-h-[60vh] md:max-h-none overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-amber-200/50 text-sm">કોઈ પચ્ચક્ખાણ મળ્યું નથી</div>
            ) : (
              filteredItems.map((item) => {
                const isActive = activeItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-400 text-amber-200 shadow-md'
                        : 'bg-slate-950/50 border-amber-500/10 hover:border-amber-500/30 text-amber-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-300 text-base font-serif">{item.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                        પૃષ્ઠ {item.page}
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/60 line-clamp-1">{item.subtitle}</p>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Sutra Details */}
          <div className="md:col-span-7 bg-slate-950/80 border border-amber-500/20 rounded-xl p-5 flex flex-col justify-between">
            {activeItem ? (
              <div className="space-y-4">
                <div className="border-b border-amber-500/20 pb-3 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-amber-300 font-serif">{activeItem.title}</h3>
                    <p className="text-xs text-amber-200/70 mt-0.5">{activeItem.subtitle}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    {activeItem.category}
                  </span>
                </div>

                {/* Original Gujarati Sutra Text */}
                <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-xl relative">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/70 block mb-2">
                    મૂળ પાઠ (Original Gujarati Sutra)
                  </span>
                  <p className="text-base sm:text-lg leading-relaxed text-amber-100 font-serif whitespace-pre-line">
                    {activeItem.gujaratiText}
                  </p>
                </div>

                {/* Meaning */}
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">અર્થ (Meaning)</h4>
                  <p className="text-sm text-amber-100/90 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-amber-500/10">
                    {activeItem.meaningGu}
                  </p>
                </div>

                {/* Rules */}
                {activeItem.rules && activeItem.rules.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">નિયમો અને વિધિ (Rules & Guidelines)</h4>
                    <ul className="space-y-1">
                      {activeItem.rules.map((rule, idx) => (
                        <li key={idx} className="text-xs text-amber-200/80 flex items-start space-x-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-amber-200/40">
                <span>📿</span>
                <p className="text-sm mt-2">પચ્ચક્ખાણ પસંદ કરો</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-amber-500/20 bg-slate-950 flex justify-between items-center text-xs text-amber-200/60">
          <span>સૂત્ર સ્રોત: જૈન શાસન પંચાંગ પચ્ચક્ખાણ પાઠ</span>
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
