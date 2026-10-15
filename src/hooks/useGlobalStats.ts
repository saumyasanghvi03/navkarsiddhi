import { useState, useEffect } from 'react';
import { CountryData, subscribeGlobalCount, subscribeHeatmapData } from '../lib/globalStats';
import { isFirebaseConfigured } from '../lib/firebase';
import { isNativeShell } from '../lib/nativeWidgetBridge';
import { apiUrl } from '../lib/apiBase';

interface GlobalStats {
  globalCount: number | null;
  heatmapData: CountryData[];
  isLoading: boolean;
}

export const useGlobalStats = (): GlobalStats => {
  const [globalCount, setGlobalCount] = useState<number | null>(null);
  const [heatmapData, setHeatmapData] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In native shell (Android WebView), Firebase WebSocket is unreliable.
    // Use a simple REST fetch instead, with a refresh on visibility change.
    if (isNativeShell()) {
      const fetchStats = async () => {
        try {
          const res = await fetch(apiUrl('/api/navkar'));
          if (!res.ok) return;
          const data = await res.json();
          if (typeof data.total === 'number') setGlobalCount(data.total);
          if (Array.isArray(data.countries)) setHeatmapData(data.countries);
        } catch { /* silent */ } finally {
          setIsLoading(false);
        }
      };

      fetchStats();

      const onVisible = () => { if (document.visibilityState === 'visible') fetchStats(); };
      document.addEventListener('visibilitychange', onVisible);
      return () => document.removeEventListener('visibilitychange', onVisible);
    }

    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }

    const unsubCount = subscribeGlobalCount((count) => {
      setGlobalCount(count);
      setIsLoading(false);
    });

    const unsubHeatmap = subscribeHeatmapData(setHeatmapData);

    return () => {
      unsubCount();
      unsubHeatmap();
    };
  }, []);

  return { globalCount, heatmapData, isLoading };
};
