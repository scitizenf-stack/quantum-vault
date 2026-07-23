import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function MarketDepthChart({ midPrice }) {
  const data = useMemo(() => {
    if (!midPrice) return [];
    const levels = [];
    for (let i = 1; i <= 15; i++) {
      const bidPrice = +(midPrice - midPrice * 0.001 * i).toFixed(2);
      const askPrice = +(midPrice + midPrice * 0.001 * i).toFixed(2);
      levels.push({ price: bidPrice, side: 'bid', size: +(0.5 + Math.random() * 3).toFixed(2) });
      levels.push({ price: askPrice, side: 'ask', size: +(0.5 + Math.random() * 3).toFixed(2) });
    }
    return levels.sort((a, b) => a.price - b.price);
  }, [midPrice]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <p className="text-sm font-bold">Market Depth</p>
      {!midPrice ? (
        <p className="text-xs text-muted-foreground text-center py-8">Waiting for price...</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="price" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => v.toLocaleString('en-US', { minimumFractionDigits: 0 })} />
            <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} formatter={(v, n, p) => [v, p.payload.side === 'bid' ? 'Bid' : 'Ask']} labelFormatter={l => `$${l}`} />
            <Bar dataKey="size" radius={[2, 2, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.side === 'bid' ? '#10b981' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}