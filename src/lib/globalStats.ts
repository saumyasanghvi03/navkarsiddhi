import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface CountryData {
  code: string;
  count: number;
}

export interface CityData {
  cityId: string;
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
 * One-shot read for server-side use (API route / Admin SDK context).
 * Returns current total and per-country breakdown.
 */
export const getGlobalStats = async (): Promise<{ total: number; countries: CountryData[] }> => {
  if (!db) return { total: 0, countries: [] };
  try {
    const [globalSnap, heatmapSnap] = await Promise.all([
      getDoc(doc(db, 'navkar_stats', 'global')),
      getDocs(collection(db, 'navkar_heatmap')),
    ]);
    const total = globalSnap.exists() ? (globalSnap.data()?.total_navkars ?? 0) : 0;
    const countries: CountryData[] = heatmapSnap.docs.map((d) => ({
      code: d.id,
      count: (d.data()?.count as number) ?? 0,
    }));
    return { total, countries };
  } catch {
    return { total: 0, countries: [] };
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

// ---------------------------------------------------------------------------
// City-level heatmap (India)
// ---------------------------------------------------------------------------

export const incrementCityNavkar = async (cityId: string): Promise<void> => {
  if (!db || !cityId) return;
  const cityRef = doc(db, 'navkar_city_heatmap', cityId);
  try {
    const snap = await getDoc(cityRef);
    if (snap.exists()) {
      await updateDoc(cityRef, { count: increment(1) });
    } else {
      await setDoc(cityRef, { count: 1, city_id: cityId });
    }
  } catch { /* silent */ }
};

export const subscribeCityHeatmap = (
  callback: (data: CityData[]) => void
): Unsubscribe => {
  if (!db) return () => {};
  const ref = collection(db, 'navkar_city_heatmap');
  return onSnapshot(
    ref,
    (snap) => {
      const data: CityData[] = snap.docs.map((d) => ({
        cityId: d.id,
        count: (d.data()?.count as number) ?? 0,
      }));
      callback(data);
    },
    () => {}
  );
};

export const getCityHeatmap = async (): Promise<CityData[]> => {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'navkar_city_heatmap'));
    return snap.docs.map((d) => ({
      cityId: d.id,
      count: (d.data()?.count as number) ?? 0,
    }));
  } catch { return []; }
};
