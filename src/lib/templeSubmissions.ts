// Community-submitted temple entries for the Derasar Finder.
// Direct client Firestore reads/writes, same trust model as globalStats.ts
// (this app has no Supabase/admin-gated backend for this feature) — a
// submission goes live immediately as "unverified" and can be hidden by
// community flags, rather than sitting in an approval queue.

import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  runTransaction,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'temple_submissions';
const FLAG_HIDE_THRESHOLD = 3;
const SUBMIT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const LAST_SUBMIT_KEY = 'navkar_temple_last_submit';

export interface CommunityTemple {
  id: string;
  name: string;
  area: string;
  address: string;
  notes?: string;
  status: 'unverified' | 'hidden';
  flagCount: number;
  submittedAt: Date | null;
}

export class TempleSubmissionError extends Error {}

const isOnCooldown = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const last = Number(localStorage.getItem(LAST_SUBMIT_KEY) || '0');
    return Date.now() - last < SUBMIT_COOLDOWN_MS;
  } catch (_) {
    return false;
  }
};

const markSubmitted = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_SUBMIT_KEY, Date.now().toString());
  } catch (_) { /* ignore */ }
};

const looksLikeSpam = (value: string): boolean => /https?:\/\/|www\./i.test(value);

export const submitTemple = async ({
  name,
  area,
  address,
  notes,
}: {
  name: string;
  area: string;
  address: string;
  notes?: string;
}): Promise<void> => {
  if (!db) throw new TempleSubmissionError('Temple submissions are unavailable right now.');

  const trimmedName = name.trim();
  const trimmedArea = area.trim();
  const trimmedAddress = address.trim();

  if (!trimmedName || !trimmedArea || !trimmedAddress) {
    throw new TempleSubmissionError('Name, area, and address are all required.');
  }
  if (trimmedName.length > 150 || trimmedArea.length > 100 || trimmedAddress.length > 300) {
    throw new TempleSubmissionError('One of the fields is too long.');
  }
  if (looksLikeSpam(trimmedName) || looksLikeSpam(trimmedArea)) {
    throw new TempleSubmissionError('That submission looks like spam.');
  }
  if (isOnCooldown()) {
    throw new TempleSubmissionError('Please wait a few minutes before submitting another temple.');
  }

  await addDoc(collection(db, COLLECTION), {
    name: trimmedName,
    area: trimmedArea,
    address: trimmedAddress,
    notes: notes?.trim().slice(0, 300) || '',
    status: 'unverified',
    flagCount: 0,
    submittedAt: serverTimestamp(),
  });

  markSubmitted();
};

export const subscribeToCommunityTemples = (
  onChange: (temples: CommunityTemple[]) => void
): (() => void) => {
  if (!db) {
    onChange([]);
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION),
    where('status', '==', 'unverified'),
    orderBy('submittedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const temples: CommunityTemple[] = snapshot.docs.map((d) => {
      const data = d.data();
      const submittedAt = data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : null;
      return {
        id: d.id,
        name: data.name,
        area: data.area,
        address: data.address,
        notes: data.notes || undefined,
        status: data.status,
        flagCount: data.flagCount || 0,
        submittedAt,
      };
    });
    onChange(temples);
  }, () => onChange([]));
};

const FLAGGED_KEY = 'navkar_temple_flagged';

const hasAlreadyFlagged = (id: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const flagged: string[] = JSON.parse(localStorage.getItem(FLAGGED_KEY) || '[]');
    return flagged.includes(id);
  } catch (_) {
    return false;
  }
};

const rememberFlagged = (id: string) => {
  if (typeof window === 'undefined') return;
  try {
    const flagged: string[] = JSON.parse(localStorage.getItem(FLAGGED_KEY) || '[]');
    flagged.push(id);
    localStorage.setItem(FLAGGED_KEY, JSON.stringify(flagged.slice(-200)));
  } catch (_) { /* ignore */ }
};

export const flagTemple = async (id: string): Promise<void> => {
  if (!db) return;
  if (hasAlreadyFlagged(id)) return;

  const ref = doc(db, COLLECTION, id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const nextCount = (snap.data().flagCount || 0) + 1;
    tx.update(ref, {
      flagCount: nextCount,
      status: nextCount >= FLAG_HIDE_THRESHOLD ? 'hidden' : 'unverified',
    });
  });

  rememberFlagged(id);
};
