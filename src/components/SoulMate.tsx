"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SoulMateMode, SoulMateMessage, SOULMATE_MODES, getSoulMateConversation } from '@/lib/companion/soulMate';

interface SoulMateProps {
  mode: SoulMateMode;
  onAction: (type: string, duration?: number) => void;
  onBack: () => void;
}

export default function SoulMate({ mode, onAction, onBack }: SoulMateProps) {
  const meta = SOULMATE_MODES[mode];
  const steps = getSoulMateConversation(mode);
  const [stepIdx, setStepIdx] = useState(0);
  const [messages, setMessages] = useState<SoulMateMessage[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{ text: steps[0].message, isUser: false, timestamp: Date.now() }]);
      setTimeout(() => setShowOptions(true), 600);
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, showOptions, showActions]);

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
            if (nextStep.finalActions) {
              setShowActions(true);
            }
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

  const currentStep = steps[stepIdx];

  return (
    <div className="px-4 py-6 max-w-md mx-auto flex flex-col" style={{ height: 'calc(100dvh - 3.5rem)' }}>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-sm text-orange-600 hover:text-orange-800">&larr;</button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">{meta.label}</h3>
            <p className="text-[10px] text-gray-400">{meta.description}</p>
          </div>
        </div>
      </div>

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

        {messages.length > 0 && !showOptions && !showActions && stepIdx < steps.length && (
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

      {showOptions && currentStep && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          {currentStep.options.map((opt) => (
            <button key={opt} onClick={() => handleOption(opt)}
              className="w-full text-left px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all">
              {opt}
            </button>
          ))}
        </div>
      )}

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
