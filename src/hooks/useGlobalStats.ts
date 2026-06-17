import { useState, useEffect } from 'react';
import { CountryData, CityData, subscribeGlobalCount, subscribeHeatmapData, subscribeIndiaCityData } from '../lib/globalStats';
import { isFirebaseConfigured } from '../lib/firebase';

interface GlobalStats {
  globalCount: number | null;
  heatmapData: CountryData[];
  indiaCityData: CityData[];
  isLoading: boolean;
}

export const useGlobalStats = (): GlobalStats => {
  const [globalCount, setGlobalCount] = useState<number | null>(null);
  const [heatmapData, setHeatmapData] = useState<CountryData[]>([]);
  const [indiaCityData, setIndiaCityData] = useState<CityData[]>([]);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubCount = subscribeGlobalCount((count) => {
      setGlobalCount(count);
      setIsLoading(false);
    });

    const unsubHeatmap = subscribeHeatmapData(setHeatmapData);
    const unsubCities = subscribeIndiaCityData(setIndiaCityData);

    return () => {
      unsubCount();
      unsubHeatmap();
      unsubCities();
    };
  }, []);

  return { globalCount, heatmapData, indiaCityData, isLoading };
};
