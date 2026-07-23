import { useState, useEffect, useRef } from 'react';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,tether-gold&vs_currencies=usd&include_24hr_change=true';
const VPS_PRICES    = 'https://app.youthballot.org/api/prices';
const VPS_DASHBOARD = 'https://app.youthballot.org/api/dashboard';
const VPS_HEADERS   = { 'X-API-Key': 'qv_live_d54cf7079c6c809ba2d0378839559e2d' };

function mapCoinGeckoShape(raw) {
  return {
    btc_usd:         raw.bitcoin?.usd,
    btc_change_24h:  raw.bitcoin?.usd_24h_change,
    eth_usd:         raw.ethereum?.usd,
    eth_change_24h:  raw.ethereum?.usd_24h_change,
    sol_usd:         raw.solana?.usd,
    sol_change_24h:  raw.solana?.usd_24h_change,
    xrp_usd:         raw.ripple?.usd,
    xrp_change_24h:  raw.ripple?.usd_24h_change,
    gold_usd:        raw['tether-gold']?.usd,
    gold_change_24h: raw['tether-gold']?.usd_24h_change,
  };
}

export function useVpsDashboard(pollingInterval = 30000) {
  const [data, setData]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await fetch(VPS_DASHBOARD, { headers: VPS_HEADERS, signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const payload = json.success && json.data ? json.data : json;
      setData(payload);
      setError(null);
    } catch (err) {
      console.warn('VPS Dashboard fetch failed:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, pollingInterval);
    return () => clearInterval(intervalRef.current);
  }, [pollingInterval]);

  return { data, isLoading, error };
}

export function useVpsPrices(pollingInterval = 30000) {
  const [data, setData]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSuccess, setLastSuccess] = useState(null);
  const cacheRef    = useRef(null);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    // 1st priority: Direct CoinGecko (fastest, most reliable)
    try {
      const res = await fetch(COINGECKO_URL, { mode: 'cors', signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const raw = await res.json();
        const mapped = mapCoinGeckoShape(raw);
        if (mapped.btc_usd) {
          cacheRef.current = mapped;
          setData(mapped);
          setLastSuccess(Date.now());
          setIsLoading(false);
          return;
        }
      }
    } catch (_) {}

    // 2nd: VPS /api/prices proxy (CoinGecko shape)
    try {
      const res = await fetch(VPS_PRICES, { headers: VPS_HEADERS, signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const raw = await res.json();
        const mapped = mapCoinGeckoShape(raw);
        if (mapped.btc_usd) {
          cacheRef.current = mapped;
          setData(mapped);
          setLastSuccess(Date.now());
          setIsLoading(false);
          return;
        }
      }
    } catch (_) {}

    // 3rd: Oracle /api/dashboard prices block
    try {
      const res = await fetch(VPS_DASHBOARD, { headers: VPS_HEADERS, signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const raw = await res.json();
        const payload = raw.success && raw.data ? raw.data : raw;
        const prices = payload.prices || {};
        const mapped = {
          btc_usd:         prices.BTC?.price,
          btc_change_24h:  prices.BTC?.change,
          eth_usd:         prices.ETH?.price,
          eth_change_24h:  prices.ETH?.change,
          sol_usd:         prices.SOL?.price,
          sol_change_24h:  prices.SOL?.change,
          xrp_usd:         prices.XRP?.price,
          xrp_change_24h:  prices.XRP?.change,
          gold_usd:        prices.XAU?.price,
          gold_change_24h: prices.XAU?.change,
          usdc_usd:        prices.USDC?.price,
        };
        if (mapped.btc_usd) {
          cacheRef.current = mapped;
          setData(mapped);
          setLastSuccess(Date.now());
          setIsLoading(false);
          return;
        }
      }
    } catch (_) {}

    // All failed — serve stale cache
    if (cacheRef.current) setData(cacheRef.current);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, pollingInterval);
    return () => clearInterval(intervalRef.current);
  }, [pollingInterval]);

  return { data, isLoading, lastSuccess };
}