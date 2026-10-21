import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { buildBrands, fetchRawData, lastCheckedAt, type Brand, type Category, type RawData } from './brandgali';

const CACHE_KEY = 'brandgali:data:v1';

type DataState = {
  brands: Brand[];
  categories: Category[];
  /** When the website's daily sale check last ran. */
  checkedAt: Date | null;
  status: 'loading' | 'ready' | 'error';
  /** True while a pull-to-refresh is running. */
  refreshing: boolean;
  /** True when we're showing saved data because the internet request failed. */
  offline: boolean;
  refresh: () => Promise<void>;
  getBrand: (id: string) => Brand | undefined;
};

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<RawData | null>(null);
  const [status, setStatus] = useState<DataState['status']>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const hasData = useRef(false);

  const load = useCallback(async () => {
    try {
      const fresh = await fetchRawData();
      hasData.current = true;
      setRaw(fresh);
      setOffline(false);
      setStatus('ready');
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh)).catch(() => {});
    } catch (err) {
      console.warn('Could not load BrandGali data', err);
      setOffline(true);
      // Keep showing whatever we already have; it's only an error if there's nothing at all.
      if (!hasData.current) setStatus('error');
    }
  }, []);

  useEffect(() => {
    (async () => {
      // Show the last saved copy instantly, then update it from the website.
      try {
        const saved = await AsyncStorage.getItem(CACHE_KEY);
        if (saved) {
          hasData.current = true;
          setRaw(JSON.parse(saved));
          setStatus('ready');
        }
      } catch {}
      await load();
    })();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    if (status === 'error') setStatus('loading');
    await load();
    setRefreshing(false);
  }, [load, status]);

  const value = useMemo<DataState>(() => {
    const brands = raw ? buildBrands(raw) : [];
    const byId = new Map(brands.map((b) => [b.id, b]));
    return {
      brands,
      categories: raw?.categories ?? [],
      checkedAt: lastCheckedAt(brands),
      status,
      refreshing,
      offline,
      refresh,
      getBrand: (id) => byId.get(id),
    };
  }, [raw, status, refreshing, offline, refresh]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useBrandData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useBrandData must be used inside <DataProvider>');
  return ctx;
}
