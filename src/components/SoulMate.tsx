"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SoulMateMode, SoulMateMessage, SOULMATE_MODES, getSoulMateConversation } from '@/lib/companion/soulMate';
import { isAIAvailable, getAIStatus, ensureAIReady, generateResponse } from '@/lib/soulMateAI';

interface SoulMateProps {
  mode: SoulMateMode;
  onAction: (type: string, duration?: number) => void;
  onBack: () => void;
}

const SYSTEM_PROMPTS: Partial<Record<SoulMateMode, string>> = {
  listen_to_me: `You are Soul Mate, a deeply compassionate listener in the Navkar Siddhi app.
The user wants to be heard — not fixed. Validate their feelings. Be warm and gentle.
Rooted in Jain values: ahimsa, karuna (compassion), equanimity.
Keep responses under 3 sentences. Never judge. Ask one follow-up question to show you're truly listening.`,
  help_me_think: `You are Soul Mate, a thoughtful thinking partner.
Help the user untangle their thoughts using Jain principles — anekantavada (many-sidedness), syadvada (conditional truths).
Ask clarifying questions. Offer frameworks, not answers. Under 3 sentences.`,
  calm_me_down: `You are Soul Mate, a grounding presence.
The user needs calm. Speak slowly and gently. Offer one concrete grounding technique.
Draw from Jain meditation traditions — kayotsarga (body stillness), preksha (perception). Under 3 sentences.`,
  give_me_strength: `You are Soul Mate, a source of courage.
The user needs strength. Remind them of their resilience using Jain philosophy — purushartha (self-effort), veerya (energy).
Be warm but direct. Under 3 sentences.`,
  help_me_decide: `You are Soul Mate, a wise decision advisor.
Help the user think through their choice using anekantavada (seeing all sides).
Don't decide for them — illuminate the angles. Under 3 sentences. Ask one question.`,
  reflect_with_me: `You are Soul Mate guiding evening reflection.
Help the user look at their day with compassion. Draw from pratikraman (self-reflection) tradition.
Be warm. Under 3 sentences.`,
  help_me_rest: `You are Soul Mate helping the user wind down for sleep.
Speak very softly and slowly. Use calming imagery. Guide toward stillness.
Under 3 sentences. End with something soothing.`,
};

export default function SoulMate({ mode, onAction, onBack }: SoulMateProps) {
  const meta = SOULMATE_MODES[mode];
  const steps = getSoulMateConversation(mode);

  // Scripted flow state
  const [stepIdx, setStepIdx] = useState(0);
  const [messages, setMessages] = useState<SoulMateMessage[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // AI state
  const [aiReady, setAiReady] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [downloadPct, setDownloadPct] = useState(-1);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-download AI model on mount when available
  useEffect(() => {
    if (!isAIAvailable()) return;
    let cancelled = false;
    getAIStatus().then((status) => {
      if (cancelled) return;
      if (status.modelReady) {
        setAiReady(true);
        setAiEnabled(true);
      } else {
        // Auto-start download
        setAiLoading(true);
        setDownloadPct(0);
        ensureAIReady((pct) => { if (!cancelled) setDownloadPct(pct); }).then((ready) => {
          if (cancelled) return;
          setAiReady(ready);
          setAiEnabled(ready);
          setAiLoading(false);
          if (ready) {
            setMessages(prev => [...prev, {
              text: "AI companion is ready! You can now type anything freely.",
              isUser: false, timestamp: Date.now(),
            }]);
          }
        });
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Start scripted conversation
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{ text: steps[0].message, isUser: false, timestamp: Date.now() }]);
      setTimeout(() => setShowOptions(true), 600);
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, showOptions, showActions]);

  // Scripted option handler (original logic)
  const handleOption = (option: string) => {
    const step = steps[stepIdx];
    const response = step.responses[option];
    if (!response) return;

    setShowOptions(false);
    setShowActions(false);

    const userMsg: SoulMateMessage = { text: option, isUser: true, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const botMsg: SoulMateMessage = { text: response, isUser: false, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);

      const nextIdx = stepIdx + 1;
      if (nextIdx < steps.length) {
        setTimeout(() => {
          const nextStep = steps[nextIdx];
          const nextMsg: SoulMateMessage = { text: nextStep.message, isUser: false, timestamp: Date.now() };
          setMessages(prev => [...prev, nextMsg]);
          setStepIdx(nextIdx);
          setTimeout(() => {
            if (nextStep.finalActions) setShowActions(true);
            setShowOptions(true);
          }, 600);
        }, 1200);
      } else {
        if (step.finalActions) {
          setTimeout(() => setShowActions(true), 800);
        }
      }
    }, 800);
  };

  // AI free-text handler
  const handleAISend = useCallback(async () => {
    const text = userInput.trim();
    if (!text || isGenerating) return;

    setUserInput('');
    setShowOptions(false);
    setIsGenerating(true);

    const userMsg: SoulMateMessage = { text, isUser: true, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    const history = [...conversationHistory, `User: ${text}`];
    setConversationHistory(history);

    const contextPrompt = [
      SYSTEM_PROMPTS[mode] || '',
      history.length > 2
        ? `\nConversation so far:\n${history.slice(-6).join('\n')}`
        : '',
    ].join('\n');

    const response = await generateResponse(text, contextPrompt);

    if (response) {
      const botMsg: SoulMateMessage = { text: response, isUser: false, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      setConversationHistory(prev => [...prev, `Soul Mate: ${response}`]);
    } else {
      const fallback: SoulMateMessage = {
        text: "I hear you. Let me think about that... (The AI companion needs a moment. Try one of the options below instead.)",
        isUser: false,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, fallback]);
      setShowOptions(true);
    }

    setIsGenerating(false);
  }, [userInput, isGenerating, conversationHistory, mode]);


  const currentStep = steps[stepIdx];

  return (
    <div className="px-4 py-6 max-w-md mx-auto flex flex-col" style={{ height: 'calc(100dvh - 3.5rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-sm text-orange-600 hover:text-orange-800">&larr;</button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">{meta.label}</h3>
            <p className="text-[10px] text-gray-400">{meta.description}</p>
          </div>
        </div>

        {/* AI status badge */}
        {isAIAvailable() && aiReady && (
          <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700">
            🧠 AI Ready
          </span>
        )}
      </div>

      {/* AI download progress card */}
      {aiLoading && (
        <div className="mb-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🧠</span>
            <span className="text-sm font-medium text-purple-800">
              {downloadPct < 100 ? 'Downloading AI Companion...' : 'Loading model...'}
            </span>
          </div>
          <div className="h-3 bg-white/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(downloadPct, 2)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-xs text-purple-600">{downloadPct}%</p>
            <p className="text-xs text-gray-500">One-time download · works offline after</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.isUser
                ? 'bg-orange-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {(isGenerating || (messages.length > 0 && !showOptions && !showActions && stepIdx < steps.length && !aiEnabled)) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI free-text input */}
      {aiEnabled && aiReady && (
        <div className="flex items-end gap-2 pt-2 border-t border-gray-100 mb-2">
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAISend();
              }
            }}
            placeholder="Type anything..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-orange-300 bg-white"
            disabled={isGenerating}
          />
          <button
            onClick={handleAISend}
            disabled={!userInput.trim() || isGenerating}
            className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-40"
          >
            {isGenerating ? '...' : 'Send'}
          </button>
        </div>
      )}

      {/* Scripted options (always available as fallback) */}
      {showOptions && currentStep && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          {aiEnabled && (
            <p className="text-[10px] text-gray-400 text-center mb-1">or choose a guided response:</p>
          )}
          {currentStep.options.map((opt) => (
            <button key={opt} onClick={() => handleOption(opt)}
              className="w-full text-left px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all">
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Final action buttons */}
      {showActions && currentStep?.finalActions && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          {currentStep.finalActions.map((action) => (
            <button key={action.label} onClick={() => onAction(action.type, action.duration)}
              className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors">
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
