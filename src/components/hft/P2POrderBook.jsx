import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

function makeBook(mid) {
  const spread = mid * 0.001;
  const bids = Array.from({ length: 10 }, (_, i) => ({ price: +(mid - spread * (i + 1)).toFixed(2), size: +(0.05 + Math.random() * 2).toFixed(4) }));
  const asks = Array.from({ length: 10 }, (_, i) => ({ price: +(mid + spread * (i + 1)).toFixed(2), size: +(0.05 + Math.random() * 2).toFixed(4) }));
  return { bids, asks };
}

export default function P2POrderBook({ midPrice, onPlaceOrder }) {
  const [book, setBook] = useState(null);
  useEffect(() => {
    if (!midPrice) return;
    setBook(makeBook(midPrice));
    const t = setInterval(() => setBook(makeBook(midPrice)), 4000);
    return () => clearInterval(t);
  }, [midPrice]);

  const spread = book ? (book.asks[0].price - book.bids[0].price).toFixed(2) : '—';
  const maxSize = book ? Math.max(...book.bids.map(b => b.size), ...book.asks.map(a => a.size)) : 1;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">Order Book · BTC/USDT</p>
        <Button size="sm" className="text-xs" onClick={onPlaceOrder}>Place Order</Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Mid: <span className="text-foreground font-mono font-bold">${midPrice ? midPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}</span>
        {' · '}Spread: <span className="font-mono">${spread}</span>
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex justify-between text-[10px] font-semibold text-accent px-1 pb-1"><span>Price</span><span>Size</span></div>
          {book?.bids.map((b, i) => (
            <div key={i} className="relative px-1 py-0.5">
              <div className="absolute inset-y-0 right-0 bg-accent/10" style={{ width: `${(b.size / maxSize) * 100}%` }} />
              <div className="relative flex justify-between text-[11px] font-mono">
                <span className="text-accent">{b.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className="text-muted-foreground">{b.size.toFixed(4)}</span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-semibold text-destructive px-1 pb-1"><span>Price</span><span>Size</span></div>
          {book?.asks.map((a, i) => (
            <div key={i} className="relative px-1 py-0.5">
              <div className="absolute inset-y-0 right-0 bg-destructive/10" style={{ width: `${(a.size / maxSize) * 100}%` }} />
              <div className="relative flex justify-between text-[11px] font-mono">
                <span className="text-destructive">{a.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className="text-muted-foreground">{a.size.toFixed(4)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}