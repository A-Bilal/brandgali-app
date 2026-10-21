import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * The brands this person follows, saved on the phone.
 * (Later, push notifications will also tag these in OneSignal as
 * `follow_<brandId>`, the same tags the website already uses.)
 */
const STORAGE_KEY = 'brandgali:follows:v1';

type FollowsState = {
  followedIds: string[];
  isFollowing: (id: string) => boolean;
  toggleFollow: (id: string) => void;
};

const FollowsContext = createContext<FollowsState | null>(null);

export function FollowsProvider({ children }: { children: ReactNode }) {
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setFollowedIds(JSON.parse(saved));
      })
      .catch(() => {});
  }, []);

  const toggleFollow = useCallback((id: string) => {
    setFollowedIds((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<FollowsState>(
    () => ({
      followedIds,
      isFollowing: (id) => followedIds.includes(id),
      toggleFollow,
    }),
    [followedIds, toggleFollow],
  );

  return <FollowsContext.Provider value={value}>{children}</FollowsContext.Provider>;
}

export function useFollows() {
  const ctx = useContext(FollowsContext);
  if (!ctx) throw new Error('useFollows must be used inside <FollowsProvider>');
  return ctx;
}
