import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useVpsPrices } from '@/lib/useVpsData';
import { useStripeBalance } from '@/lib/useOracleData';
import { Briefcase, TrendingUp, DollarSign, Layers, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const PRICE_MAP = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', XRP: 'xrp_usd', XAU: 'gold_usd', PAXG: 'gold_usd', USDC: 'usdc_usd' };

export default function Treasury() {
  const { canView } = useRBAC();
  const { data: prices, refetch } = useVpsPrices(30000);
  const stripe = useStripeBalance();
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
    refetchInterval: 30000,
  });

  if (!canView('treasury')) return <AccessDenied section="Treasury" />;

  const o = prices || {};
  const enriched = assets.map(a => {
    const livePrice = PRICE_MAP[a.symbol] ? o[PRICE_MAP[a.symbol]] : null;
    const price = livePrice || a.current_price || 0;
    return { ...a, price, value: (a.quantity || 0) * price };
  });

  const totalValue = enriched.reduce((s, a) => s + a.value, 0);
  const totalCost  = enriched.reduce((s, a) => s + (a.quantity || 0) * (a.avg_buy_price || 0), 0);
  const pnl        = totalValue - totalCost;
  const pnlPct     = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

  const stripeAvailable = stripe.data?.available != null ? stripe.data.available / 100 : 0;
  const grandTotal = totalValue + stripeAvailable;

  const byType = enriched.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + a.value; return acc; }, {});
  const pieData = Object.entries(byType).map(([name, value]) => ({ name, value: +value.toFixed(2) }));
  const barData = enriched.map(a => ({ name: a.symbol, value: +a.value.toFixed(2) })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Treasury</h1>
          <p className="text-sm text-muted-foreground mt-1">Capital allocation, proof of capital, and yield overview</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Capital', value: `$${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign },
          { label: 'Cost Basis', value: `$${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Layers },
          { label: 'Unrealized P&L', value: `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, up: pnl >= 0 },
          { label: 'Return', value: `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`, icon: Briefcase, up: pnlPct >= 0 },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            {isLoading ? <Skeleton className="h-7 w-28" /> :
              <p className={cn("text-xl font-bold font-mono", s.up === true ? "text-accent" : s.up === false ? "text-destructive" : "")}>{s.value}</p>
            }
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Allocation by Type</p>
          {isLoading ? <Skeleton className="h-48 w-full" /> :
            pieData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">No assets — add holdings in Wallet</p> :
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Holdings by Value</p>
          {isLoading ? <Skeleton className="h-48 w-full" /> :
            barData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">No data</p> :
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={40} />
                <Tooltip formatter={v => `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          }
        </div>
      </div>
    </div>
  );
}