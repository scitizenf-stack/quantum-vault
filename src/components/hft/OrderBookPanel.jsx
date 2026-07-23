import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function OrderBookPanel({ feed }) {
  const data = feed?.orderbook || feed?.data;
  const bids = useMemo(() => (data?.bids || []).slice(0, 12), [data]);
  const asks = useMemo(() => (data?.asks || []).slice(0, 12), [data]);
  const maxSize = useMemo(() => Math.max(...[...bids, ...asks].map(r => r[1] || 0), 1), [bids, asks]);
  const spread = bids[0] && asks[0] ? Math.abs(asks[0][0] - bids[0][0]).toFixed(2) : '—';

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold tracking-wide">Order Book</h3>
        <span className="text-[10px] font-mono text-muted-foreground">Spread: <span className="text-foreground">${spread}</span></span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        {/* Bids */}
        <div>
          <div className="flex justify-between text-muted-foreground mb-1 px-1">
            <span>BID</span><span>SIZE</span>
          </div>
          {bids.length === 0 ? <p className="text-center text-muted-foreground py-4">—</p> :
            bids.map(([price, size], i) => (
              <div key={i} className="relative flex justify-between px-1 py-0.5 rounded overflow-hidden">
                <div className="absolute inset-y-0 right-0 bg-emerald-500/10" style={{ width: `${(size / maxSize) * 100}%` }} />
                <span className="text-emerald-400 z-10">{Number(price).toLocaleString()}</span>
                <span className="text-muted-foreground z-10">{Number(size).toFixed(4)}</span>
              </div>
            ))
          }
        </div>
        {/* Asks */}
        <div>
          <div className="flex justify-between text-muted-foreground mb-1 px-1">
            <span>ASK</span><span>SIZE</span>
          </div>
          {asks.length === 0 ? <p className="text-center text-muted-foreground py-4">—</p> :
            asks.map(([price, size], i) => (
              <div key={i} className="relative flex justify-between px-1 py-0.5 rounded overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-destructive/10" style={{ width: `${(size / maxSize) * 100}%` }} />
                <span className="text-destructive z-10">{Number(price).toLocaleString()}</span>
                <span className="text-muted-foreground z-10">{Number(size).toFixed(4)}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}