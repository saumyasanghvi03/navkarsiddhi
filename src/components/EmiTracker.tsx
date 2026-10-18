'use client';

import React, { useState, useEffect } from 'react';

interface Emi {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  paidThisMonth: boolean;
}

const STORAGE_KEY = 'navkar_emi_data';

function daysUntilDue(dueDay: number): number {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), dueDay);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
  const target = thisMonth >= now ? thisMonth : nextMonth;
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function dueColor(days: number): string {
  if (days <= 3) return 'text-red-600 dark:text-red-400';
  if (days <= 7) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

export default function EmiTracker() {
  const [emis, setEmis] = useState<Emi[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEmis(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (updated: Emi[]) => {
    setEmis(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  };

  const addEmi = () => {
    if (!name.trim() || !amount || !dueDay) return;
    const entry: Emi = {
      id: Date.now().toString(36),
      name: name.trim(),
      amount: Number(amount),
      dueDay: Math.min(31, Math.max(1, Number(dueDay))),
      paidThisMonth: false,
    };
    save([...emis, entry]);
    setName(''); setAmount(''); setDueDay(''); setShowForm(false);
  };

  const togglePaid = (id: string) => {
    save(emis.map(e => e.id === id ? { ...e, paidThisMonth: !e.paidThisMonth } : e));
  };

  const removeEmi = (id: string) => {
    save(emis.filter(e => e.id !== id));
  };

  const total = emis.reduce((s, e) => s + e.amount, 0);
  const unpaid = emis.filter(e => !e.paidThisMonth).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">💰 EMI Calm</h3>

      {emis.length > 0 && (
        <div className="flex gap-3 mb-3 text-xs">
          <span className="text-gray-500 dark:text-gray-400">Monthly: ₹{total.toLocaleString('en-IN')}</span>
          <span className="text-gray-500 dark:text-gray-400">Remaining: ₹{unpaid.toLocaleString('en-IN')}</span>
        </div>
      )}

      <div className="space-y-2 mb-3">
        {emis.map(e => {
          const days = daysUntilDue(e.dueDay);
          return (
            <div key={e.id} className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 rounded-lg px-3 py-2">
              <button onClick={() => togglePaid(e.id)} className="text-lg">
                {e.paidThisMonth ? '✅' : '⬜'}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${e.paidThisMonth ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                  {e.name}
                </p>
                <p className="text-xs text-gray-400">₹{e.amount.toLocaleString('en-IN')} · Due {e.dueDay}th</p>
              </div>
              {!e.paidThisMonth && (
                <span className={`text-xs font-medium ${dueColor(days)}`}>
                  {days === 0 ? 'TODAY' : days < 0 ? 'OVERDUE' : `${days}d`}
                </span>
              )}
              <button onClick={() => removeEmi(e.id)} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
            </div>
          );
        })}
      </div>

      {showForm ? (
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 space-y-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="EMI name" className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          <div className="flex gap-2">
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ Amount" type="number" className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            <input value={dueDay} onChange={e => setDueDay(e.target.value)} placeholder="Due day" type="number" min="1" max="31" className="w-20 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex gap-2">
            <button onClick={addEmi} className="text-xs px-3 py-1.5 rounded-full bg-green-500 text-white font-medium">Add</button>
            <button onClick={() => setShowForm(false)} className="text-xs px-3 py-1.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="text-xs text-green-600 dark:text-green-400 font-medium">+ Add EMI</button>
      )}

      <p className="text-[10px] text-gray-400 mt-3 text-center">Financial stress is karma too. Each navkar brings clarity 🙏</p>
    </div>
  );
}
