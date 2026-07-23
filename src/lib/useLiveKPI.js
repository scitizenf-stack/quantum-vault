/**
 * useLiveKPI — polls a meshApi method every 30s.
 * Returns: { data, isLoading, isStale }
 * "isStale" = last fetch errored but we have cached data.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export function useLiveKPI(fetchFn, interval = 30000) {
  const [data, setData]       = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isStale, setStale]   = useState(false);
  const cacheRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const result = await fetchFn();
      cacheRef.current = result;
      setData(result);
      setStale(false);
    } catch {
      if (cacheRef.current) {
        setData(cacheRef.current);
        setStale(true);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    load();
    const t = setInterval(load, interval);
    return () => clearInterval(t);
  }, [load, interval]);

  return { data, isLoading, isStale };
}