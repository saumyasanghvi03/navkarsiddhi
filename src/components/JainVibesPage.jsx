"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useNav } from '../lib/navContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const QUICK_QUESTIONS = [
  "What does Namo Arihantanam mean?",
  "How many malas should I do daily?",
  "What is the significance of 108 beads?",
  "How do I focus during meditation?",
  "What are the five Jain principles?",
];

const MAX_TEXTAREA_HEIGHT = 80;

const GuruChat = ({ isOnline }) => {
  const [messages, setMessages] = useState([
    {
      role: 'guru',
      text: 'Jai Jinendra 🙏 I am your Jain spiritual guide. Ask me anything about the Navkar Mantra, Jain philosophy, or your meditation practice.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (question) => {
    const q = (question ?? input).trim();
    if (!q || loading || !isOnline) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) {
        throw new Error(`server_error_${res.status}`);
      }
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'guru', text: data.answer || data.error || 'Please try again. 🙏' }]);
    } catch (err) {
      const isServerError = err instanceof Error && err.message.startsWith('server_error');
      const errText = isServerError
        ? 'The server is temporarily unavailable. Please try again in a moment. 🙏'
        : 'Connection lost. Please check your network and try again. 🙏';
      setMessages(prev => [...prev, { role: 'guru', text: errText }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 400 }}>
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-2 space-y-3" style={{ maxHeight: 340 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'guru' && (
              <span className="mr-2 mt-0.5 text-base flex-shrink-0">🧘</span>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-orange-600 text-white rounded-br-sm'
                  : 'bg-orange-50 text-gray-800 border border-orange-100 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <span className="mr-2 mt-0.5 text-base">🧘</span>
            <div className="bg-orange-50 border border-orange-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick question chips */}
      <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={loading || !isOnline}
            className="flex-shrink-0 text-[10px] bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-2.5 py-1 hover:bg-orange-100 transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="px-4 pb-4 pt-1 flex items-end gap-2 border-t border-orange-100">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || !isOnline}
          placeholder={isOnline ? 'Ask about the Navkar Mantra…' : 'Reconnect to ask the Guru'}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-400 disabled:opacity-50 overflow-hidden"
          style={{ lineHeight: '1.4', maxHeight: MAX_TEXTAREA_HEIGHT }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, MAX_TEXTAREA_HEIGHT) + 'px';
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading || !isOnline}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-40"
        >
          {loading ? <SpinnerIcon /> : <SendIcon />}
        </button>
      </div>
    </div>
  );
};

const JainVibesPage = () => {
  const { setPage } = useNav();
  const isOnline = useOnlineStatus();

  const [vibe, setVibe] = useState('');
  const [vibeLoading, setVibeLoading] = useState(false);
  const [vibeError, setVibeError] = useState('');

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

        {/* Offline banner */}
        {!isOnline && (
          <div className="mb-5 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
            <span className="text-base">📵</span>
            <span>You&apos;re offline. AI features are unavailable — reconnect to get your vibe or ask the Guru.</span>
          </div>
        )}

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
            disabled={vibeLoading || !isOnline}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {vibeLoading
              ? <><SpinnerIcon /><span>Loading…</span></>
              : vibe ? '🔄 New Vibe' : '✨ Get My Vibe'}
          </button>
        </div>

        {/* Ask the Guru — AI Studio Embed */}
        <div className="mb-6 bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-orange-50">
            <span className="text-lg">🧘</span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Ask the Guru</h2>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">Jain spiritual AI guide</p>
            </div>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              AI
            </span>
          </div>
          <iframe
            src="https://ais-pre-7sh6uclubsolqfg7sbuifn-451774756844.asia-east1.run.app"
            title="Ask the Guru — AI Studio"
            allow="microphone; camera; clipboard-write; fullscreen"
            loading="lazy"
            className="w-full"
            style={{ height: 600, border: 'none' }}
          />
        </div>

        {/* Jain Vibes Playlist by JainZBharat */}
        <div className="mb-6 bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-4 pb-3">
            <span className="text-lg">🎵</span>
            <h2 className="text-sm font-bold text-gray-900">Jain Vibes Playlist</h2>
            <span className="ml-auto text-[10px] text-gray-400">by JainZBharat</span>
          </div>
          <iframe
            src="https://open.spotify.com/embed/playlist/4WsjlXMfJzb71wl6Krf4L4?utm_source=generator"
            title="Jain Vibes by JainZBharat"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full"
            style={{ height: 352, border: 'none' }}
          />
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
