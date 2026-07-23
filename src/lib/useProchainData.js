import { useState, useEffect, useRef } from 'react';

const GLOBAL_URL = 'https://api.coingecko.com/api/v3/global';
const PING_URL   = 'https://api.coingecko.com/api/v3/ping';

export function useProchainData(pollingInterval = 30000) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const cacheRef = useRef(null);
  const intervalRef = useRef(null);
  const lastFetchRef = useRef(Date.now());

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [globalRes, pingRes] = await Promise.all([
        fetch(GLOBAL_URL, { headers: { 'Accept': 'application/json' } }),
        fetch(PING_URL, { headers: { 'Accept': 'application/json' } }),
      ]);
      if (!globalRes.ok) throw new Error(`Global HTTP ${globalRes.status}`);
      const globalJson = await globalRes.json();
      const pingJson   = pingRes.ok ? await pingRes.json() : null;

      const g = globalJson.data || {};
      const systemOnline = pingJson?.gecko_says?.includes('Moon') ?? false;

      const mapped = {
        total_market_cap_usd:    g.total_market_cap?.usd,
        market_cap_change_24h:   g.market_cap_change_percentage_24h_usd,
        active_cryptocurrencies: g.active_cryptocurrencies,
        btc_dominance:           g.market_cap_percentage?.btc,
        eth_dominance:           g.market_cap_percentage?.eth,
        system_online:           systemOnline,
      };
      cacheRef.current = mapped;
      setData(mapped);
      setIsStale(false);
      lastFetchRef.current = Date.now();
    } catch (err) {
      console.error('ProchainData (CoinGecko Global) failed:', err);
      if (cacheRef.current) {
        setData(cacheRef.current);
        setIsStale(Date.now() - lastFetchRef.current > 60000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, pollingInterval);
    return () => clearInterval(intervalRef.current);
  }, [pollingInterval]);

  return { data, isLoading, isStale };
}