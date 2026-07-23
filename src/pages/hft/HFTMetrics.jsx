import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import OmegaMetricsCard from '@/components/hft/OmegaMetricsCard';

export default function HFTMetrics() {
  const { canAdmin } = useRBAC();

  const { data: trades = [], isLoading: tLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.list('-created_date', 200),
    refetchInterval: 30000,
  });

  const { data: strategies = [], isLoading: sLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list(),
    refetchInterval: 30000,
  });

  if (!canAdmin()) return <AccessDenied section="HFT Metrics" />;

  const isLoading = tLoading || sLoading;

  const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const wins = trades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = trades.length ? ((wins / trades.length) * 100).toFixed(1) : 0;
  const avgPnl = trades.length ? (totalPnl / trades.length).toFixed(2) : 0;
  const totalFees = trades.reduce((s, t) => s + (t.fee || 0), 0);

  // Build equity curve from trades sorted chronologically
  const sorted = [...trades].sort((a, b) => new Date(a.timestamp || a.created_date) - new Date(b.timestamp || b.created_date));
  let running = 0;
  const equityCurve = sorted.map((t, i) => {
    running += t.pnl || 0;
    return { i: i + 1, equity: +running.toFixed(2) };
  });

  const stats = [
    { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? 'text-accent' : 'text-destructive' },
    { label: 'Win Rate', value: `${winRate}%`, color: 'text-primary' },
    { label: 'Total Trades', value: trades.length, color: 'text-foreground' },
    { label: 'Avg P&L/Trade', value: `$${avgPnl}`, color: +avgPnl >= 0 ? 'text-accent' : 'text-destructive' },
    { label: 'Total Fees', value: `$${totalFees.toFixed(2)}`, color: 'text-yellow-400' },
    { label: 'Active Strategies', value: strategies.filter(s => s.status === 'ACTIVE').length, color: 'text-foreground' },
    { label: 'Avg Win Rate (Strats)', value: strategies.length ? `${(strategies.reduce((s,st) => s + (st.winRate || 0), 0) / strategies.length).toFixed(1)}%` : '—', color: 'text-chart-3' },
    { label: 'Best Strategy', value: strategies.sort((a,b) => (b.pnl||0) - (a.pnl||0))[0]?.name || '—', color: 'text-foreground' },
  ];

  return (
    <div className="space-y-5">
      {/* OMEGA Performance Card */}
      <OmegaMetricsCard />

      <div>
        <h1 className="text-2xl font-bold">Metrics</h1>
        <p className="text-xs text-muted-foreground mt-1">Aggregated from Trade entity · paper trades only</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((m, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-1">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Equity Curve */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-sm font-semibold mb-4">Equity Curve (Paper P&L)</p>
        {equityCurve.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs py-8">No trade data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={equityCurve}>
              <XAxis dataKey="i" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => [`$${v}`, 'Equity']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Area type="monotone" dataKey="equity" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}