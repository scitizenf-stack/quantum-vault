import { useState, useEffect, useRef } from 'react';

const ORACLE = 'https://app.youthballot.org';
const HEADERS = { 'X-API-Key': 'qv_live_d54cf7079c6c809ba2d0378839559e2d' };

// Primary hook: fetches /api/dashboard from Oracle — single source of truth
export function useOracleDashboard(pollingInterval = 30000) {
  const [data, setData]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState(null);
  const cacheRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${ORACLE}/api/dashboard`, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();

      // Raw shape: { prices:{BTC,ETH,SOL,XRP,XAU,USDC}, blockchain:{...}, health:{...}, _ts }
      // Normalize to a flat object for easy use
      const prices = raw.prices || {};
      const blockchain = raw.blockchain || {};
      const normalized = {
        // prices
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
        // blockchain/market
        total_market_cap:     blockchain.totalMcap,
        mcap_change_24h:      blockchain.mcapChange,
        btc_dominance:        blockchain.btcDom,
        eth_dominance:        blockchain.ethDom,
        active_coins:         blockchain.activeCoins,
        trending:             blockchain.trending,
        // meta
        health:               raw.health,
        timestamp:            raw._ts || Date.now(),
        _raw:                 raw,
      };

      cacheRef.current = normalized;
      setData(normalized);
      setError(null);
    } catch (err) {
      console.warn('Oracle /api/dashboard failed:', err.message);
      setError(err.message);
      if (cacheRef.current) setData(cacheRef.current); // serve stale cache
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

// Stripe balance from Oracle proxy
export function useStripeBalance() {
  const [data, setData]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const fetchStripe = async () => {
      try {
        const res = await fetch(`${ORACLE}/api/stripe/balance`, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStripe();
  }, []);

  return { data, isLoading, error };
}