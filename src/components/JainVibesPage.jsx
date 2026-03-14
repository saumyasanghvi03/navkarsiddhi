"use client";

import React, { useState } from 'react';
import { useNav } from '../lib/navContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const SUGGESTION_CHIPS = [
  'What does Namo Arihantanam mean?',
  'What does Namo Siddhanam mean?',
  'How many malas should I do daily?',
  'What is the significance of 108 beads?',
  'How do I focus during meditation?',
  'What are the five Jain principles?',
];

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const JainVibesPage = () => {
  const { setPage } = useNav();

  const [vibe, setVibe] = useState('');
  const [vibeLoading, setVibeLoading] = useState(false);
  const [vibeError, setVibeError] = useState('');

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState('');

  const fetchVibe = async () => {
    setVibeLoading(true);
    setVibeError('');
    try {
      const res = await fetch('/api/ai/vibe', { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVibe(data.vibe);
    } catch (err) {
      setVibeError(err instanceof Error ? err.message : 'Could not generate vibe. Please try again.');
    } finally {
      setVibeLoading(false);
    }
  };

  const askGuru = async () => {
    if (!question.trim()) return;
    setAskLoading(true);
    setAskError('');
    setAnswer('');
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnswer(data.answer);
    } catch (err) {
      setAskError(err instanceof Error ? err.message : 'Could not get an answer. Please try again.');
    } finally {
      setAskLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-16 pb-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-orange-900 mb-2">
            Jain Vibes ✨
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            AI-powered spiritual guidance rooted in Jain philosophy and the Navkar Mantra.
          </p>
        </div>

        {/* Daily Vibe */}
        <div className="mb-6 bg-white rounded-xl p-5 border border-orange-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🌅</span>
            <h2 className="text-sm font-bold text-gray-900">Today&apos;s Jain Vibe</h2>
          </div>

          {!vibe && !vibeLoading && (
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Tap below for your daily Jain-inspired spiritual affirmation.
            </p>
          )}

          {vibeLoading && (
            <div className="flex items-center gap-2 text-xs text-orange-600 mb-4">
              <SpinnerIcon />
              <span>Channelling your vibe…</span>
            </div>
          )}

          {vibe && !vibeLoading && (
            <p className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
              {vibe}
            </p>
          )}

          {vibeError && (
            <p className="text-xs text-red-500 mb-3">{vibeError}</p>
          )}

          <button
            onClick={fetchVibe}
            disabled={vibeLoading}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {vibeLoading
              ? <><SpinnerIcon /><span>Loading…</span></>
              : vibe ? '🔄 New Vibe' : '✨ Get My Vibe'}
          </button>
        </div>

        {/* Ask the Guru */}
        <div className="mb-6 bg-white rounded-xl p-5 border border-orange-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧘</span>
            <h2 className="text-sm font-bold text-gray-900">Ask the Guru</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            Ask anything about the Navkar Mantra, Jain philosophy, or your meditation practice.
          </p>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setQuestion(chip)}
                className="text-[10px] bg-orange-50 text-orange-700 px-2 py-1 rounded-full border border-orange-200 hover:bg-orange-100 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                askGuru();
              }
            }}
            placeholder="Type your question…"
            className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none h-20 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            maxLength={500}
          />

          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-400">{question.length}/500</span>
            <button
              onClick={askGuru}
              disabled={askLoading || !question.trim()}
              className="inline-flex items-center gap-1.5 bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {askLoading
                ? <><SpinnerIcon /><span>Asking…</span></>
                : '🙏 Ask'}
            </button>
          </div>

          {askError && (
            <p className="text-xs text-red-500 mt-3">{askError}</p>
          )}

          {answer && (
            <div className="mt-4 bg-orange-50 rounded-lg p-4 border border-orange-100">
              <p className="text-[10px] font-semibold text-orange-700 uppercase tracking-wide mb-2">
                Guru says
              </p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {answer}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setPage('jaap')}
            className="text-orange-600 text-xs font-medium hover:underline"
          >
            Back to Jaap
          </button>
        </div>

      </div>
    </div>
  );
};

export default JainVibesPage;
