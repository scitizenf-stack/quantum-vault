import React from 'react';
import { cn } from '@/lib/utils';

function TickerItem({ label, price, change }) {
  const up = change >= 0;
  return (
    <span className="inline-flex items-center gap-2 px-6 whitespace-nowrap">
      <span className="text-xs font-bold text-muted-foreground tracking-widest">{label}</span>
      <span className="text-sm font-semibold font-mono">
        {price != null ? `$${Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '…'}
      </span>
      {change != null && (
        <span className={cn('text-xs font-semibold', up ? 'text-accent' : 'text-destructive')}>
          {up ? '+' : ''}{Number(change).toFixed(2)}%
        </span>
      )}
      <span className="text-border mx-2">|</span>
    </span>
  );
}

export default function TickerBar({ data }) {
  if (!data) {
    return (
      <div className="w-full rounded-lg bg-card border border-border px-4 py-2.5 text-xs text-muted-foreground animate-pulse">
        Loading market prices…
      </div>
    );
  }

  const items = [
    { label: 'BTC',  price: data.btc_usd,  change: data.btc_change_24h },
    { label: 'ETH',  price: data.eth_usd,  change: data.eth_change_24h },
    { label: 'SOL',  price: data.sol_usd,  change: data.sol_change_24h },
    { label: 'XRP',  price: data.xrp_usd,  change: data.xrp_change_24h },
    { label: 'PAXG', price: data.gold_usd, change: data.gold_change_24h },
    { label: 'GOLD', price: data.gold_usd, change: data.gold_change_24h },
  ];

  const ticker = [...items, ...items]; // duplicate for seamless loop

  return (
    <div className="w-full rounded-lg bg-card border border-border overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 px-3 py-2.5 bg-primary/10 border-r border-border">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-bold text-accent uppercase tracking-widest">Live</span>
          </span>
        </div>
        <div className="flex-1 overflow-hidden py-2.5">
          <div
            className="flex animate-ticker"
            style={{ width: 'max-content' }}
          >
            {ticker.map((item, i) => (
              <TickerItem key={i} {...item} />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 28s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}