import React, { useState, useEffect, useMemo } from 'react';
import { TEMPLE_DATASET, buildTempleMapsUrl } from '../lib/templeData';
import { submitTemple, subscribeToCommunityTemples, flagTemple, TempleSubmissionError } from '../lib/templeSubmissions';

export const TempleFinderModal = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [communityTemples, setCommunityTemples] = useState([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [form, setForm] = useState({ name: '', area: '', address: '', notes: '' });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToCommunityTemples(setCommunityTemples);
    return unsubscribe;
  }, [isOpen]);

  const filteredSeed = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TEMPLE_DATASET.filter((t) => {
      if (cityFilter !== 'All' && t.city !== cityFilter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.area.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q)
      );
    });
  }, [search, cityFilter]);

  const filteredCommunity = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return communityTemples;
    return communityTemples.filter((t) =>
      t.name.toLowerCase().includes(q) || t.area.toLowerCase().includes(q)
    );
  }, [search, communityTemples]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    setSubmitting(true);
    try {
      await submitTemple(form);
      setForm({ name: '', area: '', address: '', notes: '' });
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof TempleSubmissionError ? err.message : 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlag = async (id) => {
    try {
      await flagTemple(id);
    } catch (_) { /* ignore */ }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-amber-50">

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🛕</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-400 font-serif">Derasar Finder</h2>
              <p className="text-xs sm:text-sm text-amber-200/70">Shwetambar Jain temples across Mumbai &amp; Thane</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search + filters */}
        <div className="p-3 border-b border-amber-500/10 bg-slate-900/90 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or area…"
            className="flex-1 min-w-[160px] px-3 py-1.5 bg-slate-950 border border-amber-500/30 rounded-lg text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400"
          />
          {['All', 'Mumbai', 'Thane'].map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cityFilter === city
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-750'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredSeed.length === 0 && filteredCommunity.length === 0 && (
            <p className="text-xs text-amber-200/60 text-center py-6">No temples match your search.</p>
          )}

          {filteredSeed.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/15 flex flex-col gap-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-amber-200">
                  {t.name} {t.isLandmark && <span className="text-[10px] ml-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Landmark</span>}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-200/70 border border-amber-500/10 whitespace-nowrap">
                  {t.city}
                </span>
              </div>
              <p className="text-xs text-amber-100/80">{t.area}</p>
              <p className="text-[11px] text-amber-200/50">{t.address}</p>
              {t.timings && <p className="text-[11px] text-emerald-300/80">🕐 {t.timings}</p>}
              {t.notes && <p className="text-[11px] text-amber-200/50 italic">{t.notes}</p>}
              <a
                href={buildTempleMapsUrl(t)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 self-start text-[11px] font-semibold text-amber-400 hover:underline"
              >
                📍 Open in Maps
              </a>
            </div>
          ))}

          {filteredCommunity.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Community Submitted</h4>
              <div className="space-y-3">
                {filteredCommunity.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-amber-500/20 flex flex-col gap-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-amber-200/90">{t.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/40 text-amber-300/80 border border-amber-500/20 whitespace-nowrap">
                        Unverified
                      </span>
                    </div>
                    <p className="text-xs text-amber-100/70">{t.area}</p>
                    <p className="text-[11px] text-amber-200/50">{t.address}</p>
                    {t.notes && <p className="text-[11px] text-amber-200/50 italic">{t.notes}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <a
                        href={buildTempleMapsUrl(t)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-amber-400 hover:underline"
                      >
                        📍 Open in Maps
                      </a>
                      <button
                        onClick={() => handleFlag(t.id)}
                        className="text-[11px] font-semibold text-red-400/80 hover:text-red-300"
                      >
                        🚩 Report incorrect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit a temple */}
        <div className="border-t border-amber-500/20 bg-slate-950/80">
          {!showSubmitForm ? (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="w-full py-3 text-xs font-bold text-amber-300 hover:bg-slate-900 transition-colors"
            >
              ➕ Know a temple that's missing? Add it
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Submit a Temple</span>
                <button type="button" onClick={() => setShowSubmitForm(false)} className="text-amber-300 text-xs">✕</button>
              </div>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Temple name"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-amber-500/20 rounded-lg text-amber-100 focus:outline-none focus:border-amber-400"
              />
              <input
                required
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                placeholder="Area / locality"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-amber-500/20 rounded-lg text-amber-100 focus:outline-none focus:border-amber-400"
              />
              <input
                required
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Full address"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-amber-500/20 rounded-lg text-amber-100 focus:outline-none focus:border-amber-400"
              />
              <input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Timings or notes (optional)"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-amber-500/20 rounded-lg text-amber-100 focus:outline-none focus:border-amber-400"
              />
              {submitError && <p className="text-[11px] text-red-400">{submitError}</p>}
              {submitSuccess && <p className="text-[11px] text-emerald-400">Added — thank you! It'll show as unverified until the community confirms it.</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Temple'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-amber-500/20 bg-slate-950 flex justify-between items-center text-xs text-amber-200/60">
          <span>Shwetambar seed dataset — growing via community submissions</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors border border-amber-500/30 font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
