import { useState, useEffect } from 'react';
import { CountryData, CityData, subscribeGlobalCount, subscribeHeatmapData, subscribeCityHeatmap } from '../lib/globalStats';
import { isFirebaseConfigured } from '../lib/firebase';
import { isNativeShell } from '../lib/nativeWidgetBridge';
import { apiUrl } from '../lib/apiBase';

interface GlobalStats {
  globalCount: number | null;
  heatmapData: CountryData[];
  cityData: CityData[];
  isLoading: boolean;
}

export const useGlobalStats = (): GlobalStats => {
  const [globalCount, setGlobalCount] = useState<number | null>(null);
  const [heatmapData, setHeatmapData] = useState<CountryData[]>([]);
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isNativeShell()) {
      const fetchStats = async () => {
        try {
          const res = await fetch(apiUrl('/api/navkar'));
          if (!res.ok) return;
          const data = await res.json();
          if (typeof data.total === 'number') setGlobalCount(data.total);
          if (Array.isArray(data.countries)) setHeatmapData(data.countries);
          if (Array.isArray(data.cities)) setCityData(data.cities);
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
    const unsubCity = subscribeCityHeatmap(setCityData);

    return () => {
      unsubCount();
      unsubHeatmap();
      unsubCity();
    };
  }, []);

  return { globalCount, heatmapData, cityData, isLoading };
};
