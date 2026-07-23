import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useVpsPrices } from '@/lib/useVpsData';

const WALLET_ADDRESS = 'Eida3teSJATMJW7BBqFZUKdrNXbr5ek7kGGftegBsxmp';
const TRUNCATED = `${WALLET_ADDRESS.slice(0, 7)}...${WALLET_ADDRESS.slice(-6)}`;

function StatusDot({ status }) {
  if (status === 'green')    return <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />;
  if (status === 'red')      return <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />;
  if (status === 'yellow')   return <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />;
  return <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 animate-pulse" />;
}

function StatusRow({ label, status, detail }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2.5">
        <StatusDot status={status} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-[10px] text-muted-foreground font-mono">{detail}</span>
    </div>
  );
}

function useOraclePing() {
  const [status, setStatus] = useState('checking');
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    const check = async () => {
      const start = Date.now();
      try {
        const res = await fetch('https://quantumvaultsolutions.com/api/dashboard', {
          signal: AbortSignal.timeout(2000),
        });
        const ms = Date.now() - start;
        if (res.ok) { setStatus('green'); setLatency(ms); }
        else setStatus('red');
      } catch {
        setStatus('red');
        setLatency(null);
      }
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  return { status, latency };
}

export default function DataSourceStatus() {
  const prices = useVpsPrices(30000);
  const oracle = useOraclePing();

  const now = Date.now();
  const pricesAge = prices.lastSuccess ? now - prices.lastSuccess : null;
  const pricesLive = pricesAge != null && pricesAge < 60000;
  const pricesStatus = prices.isLoading ? 'checking' : pricesLive ? 'green' : prices.data?.btc_usd ? 'yellow' : 'red';
  const pricesDetail = prices.data?.btc_usd
    ? `BTC $${Math.round(prices.data.btc_usd).toLocaleString()} · ${pricesLive ? 'live' : 'stale'}`
    : 'no data';

  const oracleDetail = oracle.status === 'green'
    ? `${oracle.latency}ms`
    : oracle.status === 'checking' ? 'checking…' : 'unreachable';

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Data Sources</p>
      <StatusRow
        label="CoinGecko"
        status={pricesStatus}
        detail={pricesDetail}
      />
      <StatusRow
        label="VPS Oracle (quantumvaultsolutions.com)"
        status={oracle.status}
        detail={oracleDetail}
      />
      <StatusRow
        label="Wallet"
        status="green"
        detail={`${TRUNCATED}`}
      />
      <StatusRow
        label="Stripe"
        status="yellow"
        detail="PENDING — add STRIPE_SECRET_KEY to activate"
      />
    </div>
  );
}