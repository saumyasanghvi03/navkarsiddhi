import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface CountryData {
  code: string;
  count: number;
}

/**
 * Atomically increment the global navkar counter and the per-country counter.
 * Safe to call fire-and-forget; errors are swallowed silently.
 */
export const incrementGlobalNavkar = async (countryCode: string = 'UNKNOWN'): Promise<void> => {
  if (!db) return;

  const globalRef = doc(db, 'navkar_stats', 'global');
  const countryRef = doc(db, 'navkar_heatmap', countryCode);

  try {
    const [globalSnap, countrySnap] = await Promise.all([
      getDoc(globalRef),
      getDoc(countryRef),
    ]);

    const writes: Promise<void>[] = [];

    writes.push(
      globalSnap.exists()
        ? updateDoc(globalRef, { total_navkars: increment(1) })
        : setDoc(globalRef, { total_navkars: 1 })
    );

    writes.push(
      countrySnap.exists()
        ? updateDoc(countryRef, { count: increment(1) })
        : setDoc(countryRef, { count: 1, country_code: countryCode })
    );

    await Promise.all(writes);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[GlobalStats] Failed to increment navkar counter:', err);
    }
  }
};

/**
 * Subscribe to the real-time global navkar count.
 * Returns the unsubscribe function.
 */
export const subscribeGlobalCount = (
  callback: (count: number) => void
): Unsubscribe => {
  if (!db) return () => {};
  const globalRef = doc(db, 'navkar_stats', 'global');
  return onSnapshot(
    globalRef,
    (snap) => callback(snap.exists() ? (snap.data()?.total_navkars ?? 0) : 0),
    () => {}
  );
};

/**
 * Subscribe to the real-time per-country heatmap data.
 * Returns the unsubscribe function.
 */
export const subscribeHeatmapData = (
  callback: (data: CountryData[]) => void
): Unsubscribe => {
  if (!db) return () => {};
  const heatmapRef = collection(db, 'navkar_heatmap');
  return onSnapshot(
    heatmapRef,
    (snap) => {
      const data: CountryData[] = snap.docs.map((d) => ({
        code: d.id,
        count: (d.data()?.count as number) ?? 0,
      }));
      callback(data);
    },
    () => {}
  );
};
