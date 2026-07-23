import React, { useMemo } from 'react';

function genLevels(mid, side, n = 10) {
  const levels = [];
  let cumulative = 0;
  for (let i = 1; i <= n; i++) {
    const tick = mid * 0.0001;
    const price = side === 'bid' ? mid - tick * i : mid + tick * i;
    const size = Math.round((Math.random() * 2 + 0.2) * 100) / 100;
    cumulative += size;
    levels.push({ price, size, total: cumulative });
  }
  return levels;
}

const fmtP = (p) => p ? Number(p).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

export default function OrderBookPanel({ asset, price }) {
  const mid = price || 0;
  const bids = useMemo(() => genLevels(mid, 'bid'), [mid]);
  const asks = useMemo(() => genLevels(mid, 'ask'), [mid]);
  const spread = asks[0] && bids[0] ? asks[0].price - bids[0].price : 0;
  const maxTotal = Math.max(...bids.map(b => b.total), ...asks.map(a => a.total), 1);

  return (
    <div className="rounded-xl bg-card border border-border p-3 flex flex-col h-full">
      <h3 className="text-xs font-bold tracking-widest uppercase mb-2">Live Order Book</h3>
      <div className="text-[10px] font-mono text-muted-foreground grid grid-cols-3 px-1 mb-1">
        <span>PRICE</span><span className="text-right">SIZE</span><span className="text-right">TOTAL</span>
      </div>

      {/* Asks (red) — reversed so best ask sits at the spread */}
      <div className="space-y-0.5">
        {asks.slice().reverse().map((a, i) => (
          <div key={i} className="relative grid grid-cols-3 text-[11px] font-mono px-1 py-0.5">
            <div className="absolute right-0 top-0 h-full bg-destructive/10" style={{ width: `${(a.total / maxTotal) * 100}%` }} />
            <span className="relative text-destructive">{fmtP(a.price)}</span>
            <span className="relative text-right text-muted-foreground">{a.size}</span>
            <span className="relative text-right text-muted-foreground">{a.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="my-1.5 py-1 border-y border-border text-center">
        <span className="text-[10px] font-mono text-muted-foreground">SPREAD </span>
        <span className="text-[11px] font-mono font-bold text-primary">{fmtP(spread)}</span>
      </div>

      {/* Bids (green) */}
      <div className="space-y-0.5">
        {bids.map((b, i) => (
          <div key={i} className="relative grid grid-cols-3 text-[11px] font-mono px-1 py-0.5">
            <div className="absolute right-0 top-0 h-full bg-accent/10" style={{ width: `${(b.total / maxTotal) * 100}%` }} />
            <span className="relative text-accent">{fmtP(b.price)}</span>
            <span className="relative text-right text-muted-foreground">{b.size}</span>
            <span className="relative text-right text-muted-foreground">{b.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}