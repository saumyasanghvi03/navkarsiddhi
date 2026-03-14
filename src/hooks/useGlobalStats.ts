import { useState, useEffect } from 'react';
import { CountryData, subscribeGlobalCount, subscribeHeatmapData } from '../lib/globalStats';
import { isFirebaseConfigured } from '../lib/firebase';

interface GlobalStats {
  globalCount: number | null;
  heatmapData: CountryData[];
  isLoading: boolean;
}

export const useGlobalStats = (): GlobalStats => {
  const [globalCount, setGlobalCount] = useState<number | null>(null);
  const [heatmapData, setHeatmapData] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

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
