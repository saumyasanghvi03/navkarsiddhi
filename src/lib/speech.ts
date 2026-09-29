// Navkar Mantra pronunciation via the browser's built-in SpeechSynthesis API
// — no new infrastructure, just reads the mantra text already used for the
// per-word cycling display, in the language currently selected there.
import { MANTRA_WORDS, MANTRA_WORDS_HINDI, MANTRA_WORDS_GUJARATI } from '../utils/constants';

const MANTRA_TEXT: Record<string, string> = {
  english: MANTRA_WORDS.join(' '),
  hindi: MANTRA_WORDS_HINDI.join(' '),
  gujarati: MANTRA_WORDS_GUJARATI.join(' '),
};

// Gujarati has little to no dedicated TTS voice support on most devices —
// browsers fall back silently to a default voice rather than erroring, so
// this is a best-effort locale hint rather than a hard requirement.
const LANG_CODES: Record<string, string> = {
  english: 'en-IN',
  hindi: 'hi-IN',
  gujarati: 'gu-IN',
};

export const isSpeechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

export const speakMantra = (language: string, onEnd?: () => void): boolean => {
  if (!isSpeechSupported()) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(MANTRA_TEXT[language] || MANTRA_TEXT.english);
    utterance.lang = LANG_CODES[language] || LANG_CODES.english;
    utterance.rate = 0.8;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (_) {
    return false;
  }
};

export const stopMantraSpeech = (): void => {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch (_) {
    /* ignore */
  }
};
