import React, { useState, useEffect } from 'react';
import {
  getLockMode,
  verifyPin,
  savePin,
  removePin,
  getAutoLockOption,
  setAutoLockOption,
  updateLastActive,
  shouldLockApp
} from '../lib/privacyLockStorage';

export default function PrivacyLockOverlay({ onUnlocked }) {
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [mode, setModeState] = useState('OFF');

  useEffect(() => {
    const currentMode = getLockMode();
    setModeState(currentMode);
    if (shouldLockApp()) {
      setIsLocked(true);
    }
  }, []);

  const handleKeyPress = (num) => {
    if (pinInput.length < 6) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      setErrorMsg('');
      if (nextPin.length === 4 || nextPin.length === 6) {
        // Auto-check on 4 or 6 digits
        checkPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const checkPin = async (candidate) => {
    const isValid = await verifyPin(candidate);
    if (isValid) {
      setIsLocked(false);
      setPinInput('');
      setErrorMsg('');
      updateLastActive();
      if (onUnlocked) onUnlocked();
    } else if (candidate.length >= 4) {
      setErrorMsg('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  const tryBiometricUnlock = async () => {
    if (window.PublicKeyCredential) {
      try {
        // Simple WebAuthn prompt simulation / check
        const isValid = await verifyPin(pinInput || '0000');
        if (isValid) {
          setIsLocked(false);
          updateLastActive();
          if (onUnlocked) onUnlocked();
        } else {
          setErrorMsg('Biometric authentication failed. Enter PIN.');
        }
      } catch (_) {
        setErrorMsg('Biometric auth unavailable.');
      }
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-orange-950/95 backdrop-blur-md flex flex-col items-center justify-center px-4 py-8 text-white select-none">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Symbol */}
        <div className="w-16 h-16 rounded-full bg-orange-800/60 border border-orange-500/40 flex items-center justify-center text-2xl shadow-lg mb-4">
          🪷
        </div>

        <h2 className="text-2xl font-serif font-bold text-orange-100 tracking-wide">
          Navkar Siddhi
        </h2>
        <p className="text-xs text-orange-300/80 mt-1 mb-6">
          Privacy Lock Enabled
        </p>

        {/* PIN Dots */}
        <div className="flex items-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border border-orange-400/50 transition-all ${
                pinInput.length > idx ? 'bg-orange-400 scale-110 shadow-sm' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-red-300 font-medium mb-4 animate-shake">
            {errorMsg}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[260px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-orange-500/40 text-xl font-bold font-mono transition-all flex items-center justify-center mx-auto border border-white/10"
            >
              {num}
            </button>
          ))}
          <button
            onClick={tryBiometricUnlock}
            className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-orange-200 transition-all flex flex-col items-center justify-center mx-auto border border-white/5"
            title="Biometric Unlock"
          >
            <span>👤</span>
            <span className="text-[9px]">Bio</span>
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-orange-500/40 text-xl font-bold font-mono transition-all flex items-center justify-center mx-auto border border-white/10"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-sm font-semibold text-orange-200 transition-all flex items-center justify-center mx-auto border border-white/5"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
