"use client";

import React, { useState, useEffect } from 'react';
import { EmiEntry } from '@/lib/companion/types';
import { getEmiEntries, saveEmiEntries, clearAllEmiData } from '@/lib/companion/storage';
import { validateEmiEntry, sortEmiEntries, getUpcomingWeek, getOverdue, isOverdue, daysUntilDue, generateId } from '@/lib/companion/emiCalculations';

type View = 'list' | 'add' | 'edit';

export default function EmiTracker() {
  const [entries, setEntries] = useState<EmiEntry[]>([]);
  const [view, setView] = useState<View>('list');
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => { try { setEntries(getEmiEntries()); } catch {} }, []);

  const save = (updated: EmiEntry[]) => { setEntries(updated); saveEmiEntries(updated); };
  const resetForm = () => { setLabel(''); setAmount(''); setDueDate(''); setError(null); };

  const handleAdd = () => {
    const err = validateEmiEntry(label, parseFloat(amount), dueDate);
    if (err) { setError(err); return; }
    save([...entries, { id: generateId(), label: label.trim(), amount: parseFloat(amount), dueDate, isPaid: false, createdAt: Date.now() }]);
    resetForm(); setView('list');
  };

  const handleEdit = () => {
    if (!editId) return;
    const err = validateEmiEntry(label, parseFloat(amount), dueDate);
    if (err) { setError(err); return; }
    save(entries.map(e => e.id === editId ? { ...e, label: label.trim(), amount: parseFloat(amount), dueDate } : e));
    resetForm(); setEditId(null); setView('list');
  };

  const startEdit = (e: EmiEntry) => {
    setLabel(e.label); setAmount(String(e.amount)); setDueDate(e.dueDate);
    setEditId(e.id); setError(null); setView('edit');
  };

  const togglePaid = (id: string) => {
    save(entries.map(e => e.id === id ? { ...e, isPaid: !e.isPaid, paidDate: !e.isPaid ? new Date().toISOString().slice(0, 10) : undefined } : e));
  };

  const handleDelete = (id: string) => save(entries.filter(e => e.id !== id));

  const handleClearAll = () => { clearAllEmiData(); setEntries([]); setConfirmClear(false); };

  const sorted = sortEmiEntries(entries);
  const upcoming = getUpcomingWeek(entries);
  const overdue = getOverdue(entries);

  if (view === 'add' || view === 'edit') {
    return (
      <div className="px-4 py-6 max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{view === 'add' ? 'Add EMI' : 'Edit EMI'}</h3>
            <button onClick={() => { resetForm(); setView('list'); }} className="text-gray-400 hover:text-gray-600 text-sm">Back</button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Label</label>
              <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Car EMI, Home Loan"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-300 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="15000"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-300 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-300 focus:outline-none" />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <button onClick={view === 'add' ? handleAdd : handleEdit}
            className="w-full mt-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium text-sm hover:bg-orange-600 transition-colors">
            {view === 'add' ? 'Add EMI' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-4">
      <div className="bg-amber-50 rounded-xl p-3">
        <p className="text-xs text-amber-700">Your EMI data is stored only on this device in localStorage. It is NOT encrypted, NOT backed up, and NOT sent to any server.</p>
      </div>
      {overdue.length > 0 && (
        <div className="bg-red-50 rounded-xl p-3">
          <p className="text-sm text-red-700 font-medium">{overdue.length} overdue EMI{overdue.length > 1 ? 's' : ''}</p>
        </div>
      )}
      {upcoming.length > 0 && (
        <div className="bg-orange-50 rounded-xl p-3">
          <p className="text-sm text-orange-700">{upcoming.length} EMI{upcoming.length > 1 ? 's' : ''} due within 7 days</p>
        </div>
      )}
      {sorted.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No EMIs tracked yet.</p>
          <p className="text-gray-400 text-xs mt-1">Add one to stay on top of due dates.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(entry => {
            const od = isOverdue(entry);
            const days = daysUntilDue(entry);
            return (
              <div key={entry.id} className={`bg-white rounded-xl border p-4 ${entry.isPaid ? 'border-green-200 opacity-70' : od ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${entry.isPaid ? 'line-through text-gray-400' : 'text-gray-800'}`}>{entry.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{entry.amount.toLocaleString('en-IN')} · Due {entry.dueDate}</p>
                    {!entry.isPaid && (
                      <p className={`text-xs mt-0.5 ${od ? 'text-red-500 font-medium' : days <= 3 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {od ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : `${days} days left`}
                      </p>
                    )}
                    {entry.isPaid && <p className="text-xs text-green-600 mt-0.5">Paid{entry.paidDate ? ` on ${entry.paidDate}` : ''}</p>}
                  </div>
                  <div className="flex gap-1.5 ml-2 flex-shrink-0">
                    <button onClick={() => togglePaid(entry.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${entry.isPaid ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                      {entry.isPaid ? 'Undo' : 'Paid'}
                    </button>
                    <button onClick={() => startEdit(entry)} className="px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-500">Edit</button>
                    <button onClick={() => handleDelete(entry.id)} className="px-2 py-1 rounded-lg text-xs bg-red-50 text-red-400">Del</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <button onClick={() => { resetForm(); setView('add'); }}
        className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-medium text-sm hover:bg-orange-600 transition-colors">+ Add EMI</button>
      {entries.length > 0 && (confirmClear ? (
        <div className="flex gap-2">
          <button onClick={handleClearAll} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-medium">Yes, clear all</button>
          <button onClick={() => setConfirmClear(false)} className="flex-1 py-2 bg-gray-200 text-gray-600 rounded-xl text-xs font-medium">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setConfirmClear(true)} className="w-full py-2 text-red-400 text-xs hover:text-red-600 transition-colors">Clear all EMI data</button>
      ))}
    </div>
  );
}
