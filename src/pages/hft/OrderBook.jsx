import React, { useState, useEffect } from 'react';
import { useVpsPrices } from '@/lib/useVpsData';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';

function makeBook(mid) {
  const spread = mid * 0.001; // ±0.1%
  const bids = Array.from({ length: 12 }, (_, i) => ({
    price: +(mid - spread * (i + 1) * (0.5 + Math.random() * 0.5)).toFixed(2),
    size: +(0.05 + Math.random() * 2).toFixed(4),
  }));
  const asks = Array.from({ length: 12 }, (_, i) => ({
    price: +(mid + spread * (i + 1) * (0.5 + Math.random() * 0.5)).toFixed(2),
    size: +(0.05 + Math.random() * 2).toFixed(4),
  }));
  return { bids, asks };
}

export default function OrderBook() {
  const { canAdmin } = useRBAC();
  const { data: prices } = useVpsPrices(5000);
  const liveMid = prices?.sol_usd;
  const [book, setBook] = useState(null);

  useEffect(() => {
    if (!liveMid) return;
    setBook(makeBook(liveMid));
    const t = setInterval(() => setBook(makeBook(liveMid)), 5000);
    return () => clearInterval(t);
  }, [liveMid]);

  if (!canAdmin()) return <AccessDenied section="Order Book" />;

  const maxSize = book ? Math.max(...book.bids.map(b => b.size), ...book.asks.map(a => a.size)) : 1;
  const spread = book ? (book.asks[0].price - book.bids[0].price).toFixed(2) : '—';

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-2.5 text-xs text-yellow-300 font-semibold">
        ⚠ Simulated order book depth — mid price is live SOL/USDC from Oracle
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Order Book</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Live SOL/USDC · mid{' '}
            {liveMid ? (
              <span className="text-foreground font-mono font-semibold">${liveMid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            ) : <span className="text-muted-foreground">loading...</span>}
            {liveMid && <span className="ml-2 text-accent font-semibold">· LIVE PRICE</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">SIMULATED</Badge>
          {book && <span className="text-xs text-muted-foreground">Spread: <span className="text-foreground font-mono">${spread}</span></span>}
        </div>
      </div>

      {!book ? (
        <div className="text-center text-muted-foreground text-sm py-16">Waiting for price data...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-border bg-accent/5">
              <div className="flex justify-between text-[10px] font-semibold text-accent">
                <span>Price (USDC)</span><span>Size (SOL)</span>
              </div>
            </div>
            {book.bids.map((b, i) => (
              <div key={i} className="relative px-3 py-1.5 hover:bg-accent/5">
                <div className="absolute inset-y-0 right-0 bg-accent/10" style={{ width: `${(b.size / maxSize) * 100}%` }} />
                <div className="relative flex justify-between text-xs font-mono">
                  <span className="text-accent">{b.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <span className="text-muted-foreground">{b.size.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-border bg-destructive/5">
              <div className="flex justify-between text-[10px] font-semibold text-destructive">
                <span>Price (USDC)</span><span>Size (SOL)</span>
              </div>
            </div>
            {book.asks.map((a, i) => (
              <div key={i} className="relative px-3 py-1.5 hover:bg-destructive/5">
                <div className="absolute inset-y-0 right-0 bg-destructive/10" style={{ width: `${(a.size / maxSize) * 100}%` }} />
                <div className="relative flex justify-between text-xs font-mono">
                  <span className="text-destructive">{a.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <span className="text-muted-foreground">{a.size.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}