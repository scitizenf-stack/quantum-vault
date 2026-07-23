import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useVpsPrices } from '@/lib/useVpsData';
import { Skeleton } from '@/components/ui/skeleton';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const PRICE_MAP = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', XRP: 'xrp_usd', XAU: 'gold_usd', PAXG: 'gold_usd', USDC: 'usdc_usd' };
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function TreasuryAllocation() {
  const { canView } = useRBAC();
  const { data: prices } = useVpsPrices(30000);
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
    refetchInterval: 30000,
  });

  if (!canView('treasury')) return <AccessDenied section="Allocation" />;

  const o = prices || {};
  const enriched = assets.map(a => {
    const price = (PRICE_MAP[a.symbol] ? o[PRICE_MAP[a.symbol]] : null) || a.current_price || 0;
    return { ...a, value: (a.quantity || 0) * price };
  });

  const byType = enriched.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + a.value;
    return acc;
  }, {});
  const pieData = Object.entries(byType).map(([name, value]) => ({ name, value: +value.toFixed(2) }));
  const barData = enriched.map(a => ({ name: a.symbol, value: +a.value.toFixed(2) })).sort((a, b) => b.value - a.value);
  const total = enriched.reduce((s, a) => s + a.value, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Allocation</h1>
        <p className="text-xs text-muted-foreground mt-1">Live portfolio distribution from entity + oracle data</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[1,2].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
      ) : enriched.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-10 text-center">
          <p className="text-sm text-muted-foreground">No assets found. Add holdings in Wallet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-semibold mb-4 uppercase tracking-wider text-muted-foreground">By Asset Type</p>
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
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Holdings by Value</p>
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
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Allocation Detail</p>
              <p className="text-xs font-mono font-bold">Total: ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/30">
                {['Asset', 'Type', 'Qty', 'Value', 'Allocation'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody>
                {enriched.map(a => (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="px-4 py-3 text-xs font-medium">{a.name} ({a.symbol})</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.type}</td>
                    <td className="px-4 py-3 text-xs font-mono">{a.quantity}</td>
                    <td className="px-4 py-3 text-xs font-mono font-semibold">${a.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-3 text-xs font-mono">{total > 0 ? ((a.value / total) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}