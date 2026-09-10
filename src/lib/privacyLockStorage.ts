/**
 * Privacy Lock Storage — Local-first secure PIN & Biometric lock manager.
 * No plaintext PIN storage. Uses Web Crypto API SHA-256 hash.
 */

export type LockMode = 'OFF' | 'PIN' | 'BIOMETRIC';
export type AutoLockOption = 'IMMEDIATELY' | '1M' | '5M' | '15M' | 'NEVER';

const LOCK_MODE_KEY = 'navkar_privacy_mode';
const PIN_HASH_KEY = 'navkar_pin_hash';
const AUTO_LOCK_KEY = 'navkar_auto_lock';
const LAST_ACTIVE_KEY = 'navkar_last_active';

// Compute SHA-256 hash of plaintext PIN
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getLockMode(): LockMode {
  if (typeof window === 'undefined') return 'OFF';
  return (localStorage.getItem(LOCK_MODE_KEY) as LockMode) || 'OFF';
}

export function setLockMode(mode: LockMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCK_MODE_KEY, mode);
}

export function getStoredPinHash(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PIN_HASH_KEY);
}

export async function savePin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
  setLockMode('PIN');
}

export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = getStoredPinHash();
  if (!storedHash) return false;
  const hash = await hashPin(pin);
  return hash === storedHash;
}

export function getAutoLockOption(): AutoLockOption {
  if (typeof window === 'undefined') return 'IMMEDIATELY';
  return (localStorage.getItem(AUTO_LOCK_KEY) as AutoLockOption) || 'IMMEDIATELY';
}

export function setAutoLockOption(option: AutoLockOption): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTO_LOCK_KEY, option);
}

export function updateLastActive(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

export function shouldLockApp(): boolean {
  if (typeof window === 'undefined') return false;
  const mode = getLockMode();
  if (mode === 'OFF') return false;

  const autoLock = getAutoLockOption();
  if (autoLock === 'NEVER') return false;
  if (autoLock === 'IMMEDIATELY') return true;

  const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
  if (!lastActiveStr) return true;

  const lastActive = parseInt(lastActiveStr, 10);
  const now = Date.now();
  const elapsedMinutes = (now - lastActive) / (1000 * 60);

  if (autoLock === '1M' && elapsedMinutes >= 1) return true;
  if (autoLock === '5M' && elapsedMinutes >= 5) return true;
  if (autoLock === '15M' && elapsedMinutes >= 15) return true;

  return false;
}

export function removePin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PIN_HASH_KEY);
  setLockMode('OFF');
}
