/**
 * useMeshStream — React hook for Omega Mesh WebSocket real-time feeds
 * Supports multiple channel subscriptions with auto-reconnect
 */
import { useEffect, useRef, useState, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_OMEGA_API_KEY;
const WS_BASE = 'wss://mesh.quantumvaultsolutions.com/api/ws';

export function useMeshStream(channels = ['ticker', 'orderbook', 'trades']) {
  const [feed, setFeed] = useState({});
  const [status, setStatus] = useState('connecting'); // connecting | live | reconnecting | error
  const [lastTick, setLastTick] = useState(null);
  const wsRef = useRef(null);
  const retryRef = useRef(0);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    setStatus('connecting');

    const channelParam = channels.join(',');
    const ws = new WebSocket(
      `${WS_BASE}/stream?token=${API_KEY}&channels=${channelParam}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      retryRef.current = 0;
      setStatus('live');
      // Subscribe message
      ws.send(JSON.stringify({ action: 'subscribe', channels }));
    };

    ws.onmessage = (e) => {
      if (!mountedRef.current) return;
      try {
        const msg = JSON.parse(e.data);
        setLastTick(msg);
        setFeed(prev => ({
          ...prev,
          [msg.channel || msg.type || 'data']: msg,
        }));
      } catch {}
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setStatus('reconnecting');
      const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
      retryRef.current += 1;
      setTimeout(connect, delay);
    };

    ws.onerror = () => {
      setStatus('error');
      ws.close();
    };
  }, [channels.join(',')]); // eslint-disable-line

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { feed, status, lastTick, send };
}

// Lightweight ticker-only hook
export function useTickerStream(symbols = []) {
  const [tickers, setTickers] = useState({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const mountedRef = useRef(true);
  const retryRef = useRef(0);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    const symbolParam = symbols.join(',');
    const ws = new WebSocket(
      `${WS_BASE}/ticker?token=${API_KEY}&symbols=${symbolParam}`
    );
    wsRef.current = ws;

    ws.onopen = () => { setConnected(true); retryRef.current = 0; };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.symbol) {
          setTickers(prev => ({ ...prev, [msg.symbol]: msg }));
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      if (!mountedRef.current) return;
      const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
      retryRef.current += 1;
      setTimeout(connect, delay);
    };

    ws.onerror = () => ws.close();
  }, [symbols.join(',')]); // eslint-disable-line

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => { mountedRef.current = false; wsRef.current?.close(); };
  }, [connect]);

  return { tickers, connected };
}