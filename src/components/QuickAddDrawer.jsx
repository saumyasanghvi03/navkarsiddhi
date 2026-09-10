import React, { useState } from 'react';
import { getQuickAddPrefs, recordQuickAddUsage, recordTimeOfDayCount } from '../lib/tapStorage';

export default function QuickAddDrawer({ isOpen, onClose, onAddNavkars }) {
  const [customInput, setCustomInput] = useState('');
  const [prefs, setPrefs] = useState(() => getQuickAddPrefs());

  if (!isOpen) return null;

  const handleAdd = (count) => {
    if (!count || count <= 0) return;
    const updated = recordQuickAddUsage(count);
    setPrefs(updated);
    recordTimeOfDayCount(count);
    onAddNavkars(count);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0) {
      handleAdd(val);
      setCustomInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-orange-100 p-6 flex flex-col gap-4 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-orange-100 pb-3">
          <div>
            <h3 className="text-lg font-serif font-bold text-orange-950 flex items-center gap-2">
              <span>⚡</span> Quick Add Navkars
            </h3>
            <p className="text-xs text-gray-500">
              Bulk add counts to your daily practice log
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm font-bold flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Preset quick buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          {prefs.map((num) => (
            <button
              key={num}
              onClick={() => handleAdd(num)}
              className="py-3 px-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200/60 text-orange-900 font-bold text-sm shadow-sm transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
            >
              <span>+{num}</span>
              <span className="text-[10px] font-normal text-orange-700/70">
                {num === 108 ? '1 Mala' : `${num} Navkar`}
              </span>
            </button>
          ))}
        </div>

        {/* Special Mala Actions */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => handleAdd(108)}
            className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>📿</span> Complete Mala (+108)
          </button>
          <button
            onClick={() => handleAdd(540)}
            className="py-2.5 px-3 rounded-xl bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>🌟</span> 5 Malas (+540)
          </button>
        </div>

        {/* Custom count input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2 mt-2 pt-3 border-t border-gray-100">
          <input
            type="number"
            min="1"
            max="100000"
            placeholder="Custom count e.g. 500, 1008"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-orange-800 text-white font-semibold text-xs rounded-xl hover:bg-orange-900 transition-all shadow-sm"
          >
            Add Count
          </button>
        </form>
      </div>
    </div>
  );
}
