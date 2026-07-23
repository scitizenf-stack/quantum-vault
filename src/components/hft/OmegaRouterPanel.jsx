import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Zap, Radio, Cpu, Wallet, AlertTriangle } from 'lucide-react';

const ORACLE = 'https://app.youthballot.org';
const POLL_MS = 10000;

const fmt$ = n => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
const fmtSOL = n => n != null ? `◎${Number(n).toFixed(6)}` : '—';

export default function OmegaRouterPanel() {
  const [dashboard, setDashboard] = useState(null);
  const [solPrice, setSolPrice] = useState(null);
  const [status, setStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      const [dashRes, priceRes] = await Promise.all([
        fetch(`${ORACLE}/api/dashboard`, { signal: AbortSignal.timeout(6000) }),
        fetch(`${ORACLE}/api/prices`, { signal: AbortSignal.timeout(6000) }),
      ]);
      if (!dashRes.ok) throw new Error(`Dashboard HTTP ${dashRes.status}`);
      const dash = await dashRes.json();
      setDashboard(dash);
      setLastUpdate(Date.now());
      setStatus('live');
      setError(null);
      if (priceRes.ok) {
        const prices = await priceRes.json();
        setSolPrice(prices?.SOL?.price ?? null);
      }
    } catch (e) {
      setStatus('degraded');
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  const executions = dashboard?.trades || dashboard?.executions || [];
  const walletBal = dashboard?.wallet?.sol ?? dashboard?.wallet?.balance ?? null;
  const portfolioUSD = walletBal != null && solPrice != null ? walletBal * solPrice : null;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-bold text-foreground">OMEGA Router</span>
        </div>
        <Badge className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono">
          Live Solana Mainnet — Real Capital
        </Badge>
        <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">
          Jito Atomic Arbitrage — Jupiter DEX
        </Badge>
        <div className="ml-auto flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span>Scan Rate: <span className="text-foreground font-semibold">4 Hz</span></span>
          <span>Jito Tip: <span className="text-foreground font-semibold">0.000025 SOL</span></span>
          <span className={`flex items-center gap-1 ${status === 'live' ? 'text-emerald-400' : 'text-yellow-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'}`} />
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Wallet / Portfolio Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card border-border p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Wallet className="w-3 h-3" /> Wallet Balance
          </div>
          <div className="text-sm font-bold text-foreground font-mono">{fmtSOL(walletBal)}</div>
          {portfolioUSD && <div className="text-xs text-muted-foreground mt-0.5">{fmt$(portfolioUSD)}</div>}
        </Card>
        <Card className="bg-card border-border p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Zap className="w-3 h-3" /> SOL Price
          </div>
          <div className="text-sm font-bold text-foreground font-mono">{fmt$(solPrice)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">via Oracle</div>
        </Card>
        <Card className="bg-card border-border p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Cpu className="w-3 h-3" /> Executions
          </div>
          <div className="text-sm font-bold text-foreground font-mono">{executions.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">This session</div>
        </Card>
        <Card className="bg-card border-border p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Radio className="w-3 h-3" /> Last Ping
          </div>
          <div className="text-sm font-bold text-foreground font-mono">
            {lastUpdate ? `${Math.floor((Date.now() - lastUpdate) / 1000)}s ago` : '—'}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">10s poll</div>
        </Card>
      </div>

      {/* Executions feed */}
      {executions.length === 0 ? (
        <Card className="bg-card border-border p-8 flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-emerald-400 block animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
          </div>
          <p className="text-sm font-semibold text-foreground mt-1">OMEGA Router: Awaiting first trade signal</p>
          <p className="text-xs text-muted-foreground">
            Router is live on Solana Mainnet — scanning at 4 Hz for atomic arbitrage opportunities via Jupiter DEX.
            Executions will stream here in real time.
          </p>
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-yellow-400 mt-1">
              <AlertTriangle className="w-3 h-3" /> {error}
            </div>
          )}
        </Card>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="sticky top-0 bg-secondary/90 z-10">
              <tr className="border-b border-border">
                {['Time','Pair','Side','Qty','Price','Total','P&L','Status'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {executions.map((t, i) => {
                const pnl = t.pnl ?? t.profit ?? null;
                const side = (t.side || t.type || '').toUpperCase();
                return (
                  <tr key={i} className="border-b border-border/40 hover:bg-secondary/20">
                    <td className="px-3 py-2 text-[10px] font-mono text-muted-foreground">
                      {t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-3 py-2 text-xs font-mono">{t.pair || t.symbol || '—'}</td>
                    <td className="px-3 py-2">
                      <Badge variant={side === 'BUY' ? 'default' : 'destructive'} className="text-[10px]">{side || '—'}</Badge>
                    </td>
                    <td className="px-3 py-2 text-xs font-mono">{t.qty ?? t.amount ?? '—'}</td>
                    <td className="px-3 py-2 text-xs font-mono">{t.price ? fmt$(t.price) : '—'}</td>
                    <td className="px-3 py-2 text-xs font-mono">{t.total ? fmt$(t.total) : '—'}</td>
                    <td className={`px-3 py-2 text-xs font-mono font-bold ${pnl != null ? (pnl >= 0 ? 'text-accent' : 'text-destructive') : 'text-muted-foreground'}`}>
                      {pnl != null ? `${pnl >= 0 ? '+' : ''}${fmt$(pnl)}` : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">
                        {t.status || 'FILLED'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}