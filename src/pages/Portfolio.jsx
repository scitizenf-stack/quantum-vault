import React from 'react';
import { useVpsPrices } from '@/lib/useVpsData';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, CheckCircle, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AllocationDonut from '../components/dashboard/AllocationDonut';
import { Link } from 'react-router-dom';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import LiveBadge from '@/components/shared/LiveBadge';

const typeColors = {
  stock:     'bg-primary/10 text-primary border-primary/20',
  crypto:    'bg-chart-3/10 text-chart-3 border-chart-3/20',
  commodity: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
};

const PRICE_MAP  = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', XRP: 'xrp_usd', XAU: 'gold_usd', PAXG: 'gold_usd', USDC: 'usdc_usd' };
const CHANGE_MAP = { BTC: 'btc_change_24h', ETH: 'eth_change_24h', SOL: 'sol_change_24h', XRP: 'xrp_change_24h', XAU: 'gold_change_24h', PAXG: 'gold_change_24h' };

function fmt$(n, dec = 2) {
  return n != null ? `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })}` : '—';
}

function pnlClass(v) { return v >= 0 ? 'text-accent' : 'text-destructive'; }

export default function Portfolio() {
  const { canView } = useRBAC();
  const { data: prices, dataUpdatedAt, isError: pricesError, isLoading: pricesLoading } = useVpsPrices(30000);
  const { data: dbAssets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
  });

  const isLoading = pricesLoading || assetsLoading;
  const o = prices || {};

  const assets = dbAssets.map(a => {
    const pk = PRICE_MAP[a.symbol];
    const ck = CHANGE_MAP[a.symbol];
    const livePrice = pk ? o[pk] : null;
    const price = livePrice || a.current_price || 0;
    const value = (a.quantity || 0) * price;
    const avgCost = a.avg_buy_price || 0;
    const costBasis = (a.quantity || 0) * avgCost;
    const pnl = value - costBasis;
    const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return {
      ...a,
      current_price: price,
      change_24h: ck ? (o[ck] || 0) : 0,
      value,
      pnl,
      pnlPct,
    };
  }).sort((a, b) => b.value - a.value);

  const totalValue   = assets.reduce((s, a) => s + a.value, 0);
  const totalPnl     = assets.reduce((s, a) => s + a.pnl, 0);
  const totalCost    = assets.reduce((s, a) => s + (a.quantity || 0) * (a.avg_buy_price || 0), 0);
  const totalPnlPct  = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  if (!canView('portfolio')) return <AccessDenied section="Portfolio" />;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">Real holdings · live Oracle prices</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge timestamp={dataUpdatedAt} error={pricesError ? 'fetch failed' : null} />
          <Link to="/wallet">
            <Button size="sm" variant="outline"><Plus className="w-3.5 h-3.5 mr-1" /> Add Holding</Button>
          </Link>
        </div>
      </div>

      {/* KPI summary */}
      {assets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Value</p>
            <p className="text-2xl font-bold font-mono mt-1">{fmt$(totalValue)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total P&amp;L</p>
            <p className={cn("text-2xl font-bold font-mono mt-1", pnlClass(totalPnl))}>
              {totalPnl >= 0 ? '+' : ''}{fmt$(totalPnl)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Return</p>
            <p className={cn("text-2xl font-bold font-mono mt-1", pnlClass(totalPnlPct))}>
              {totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-12 flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-semibold">No holdings tracked</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Go to <strong>Wallet</strong> and click <strong>+ Add Holding</strong> to record your real assets.
          </p>
          <Link to="/wallet"><Button size="sm"><Plus className="w-3.5 h-3.5 mr-1" /> Go to Wallet</Button></Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 rounded-xl bg-card border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Asset', 'Qty', 'Avg Cost', 'Price', 'Value', 'P&L', 'P&L %', '24h'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 last:text-right whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assets.map(asset => {
                    const isUp24 = (asset.change_24h || 0) >= 0;
                    return (
                      <tr key={asset.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
                              {asset.symbol?.slice(0, 3)}
                            </div>
                            <div>
                              <p className="font-medium text-xs">{asset.name}</p>
                              <Badge variant="outline" className={cn("text-[9px] mt-0.5", typeColors[asset.type])}>
                                {asset.type?.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{(asset.quantity || 0).toFixed(6)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{fmt$(asset.avg_buy_price)}</td>
                        <td className="px-4 py-3 font-mono text-xs">{fmt$(asset.current_price)}</td>
                        <td className="px-4 py-3 font-mono text-xs font-medium">{fmt$(asset.value)}</td>
                        <td className={cn("px-4 py-3 font-mono text-xs font-medium", pnlClass(asset.pnl))}>
                          {asset.pnl >= 0 ? '+' : ''}{fmt$(asset.pnl)}
                        </td>
                        <td className={cn("px-4 py-3 font-mono text-xs", pnlClass(asset.pnlPct))}>
                          {asset.pnlPct >= 0 ? '+' : ''}{asset.pnlPct.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className={cn("flex items-center gap-1 justify-end text-xs font-mono", isUp24 ? "text-accent" : "text-destructive")}>
                            {isUp24 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isUp24 ? '+' : ''}{(asset.change_24h || 0).toFixed(2)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <AllocationDonut assets={assets} />
          </div>
        </>
      )}
    </div>
  );
}