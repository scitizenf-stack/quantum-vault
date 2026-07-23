import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const typeColors = {
  stock: 'bg-primary/10 text-primary',
  crypto: 'bg-chart-3/10 text-chart-3',
  etf: 'bg-accent/10 text-accent',
  bond: 'bg-chart-4/10 text-chart-4',
  commodity: 'bg-chart-5/10 text-chart-5',
};

export default function TopAssets({ assets = [] }) {
  const sorted = [...assets]
    .map(a => ({ ...a, totalValue: (a.quantity || 0) * (a.current_price || 0) }))
    .sort((a, b) => b.totalValue - a.totalValue);

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Top Holdings</h3>
        <Link to="/portfolio" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
          View all
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No assets yet</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((asset) => {
            const isPositive = (asset.change_24h || 0) >= 0;
            return (
              <div key={asset.symbol} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold font-mono text-foreground">
                  {asset.symbol?.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{asset.name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", typeColors[asset.type] || 'bg-secondary text-muted-foreground')}>
                      {asset.type?.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {(asset.quantity || 0).toLocaleString(undefined, { maximumFractionDigits: 6 })} @ ${(asset.current_price || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {asset.walletAddress && (
                    <p className="text-[9px] text-muted-foreground/70 font-mono truncate mt-0.5" title={asset.walletAddress}>
                      {asset.walletAddress}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold font-mono">${asset.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <div className={cn("flex items-center gap-0.5 justify-end text-xs", isPositive ? "text-accent" : "text-destructive")}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="font-mono">{isPositive ? '+' : ''}{(asset.change_24h || 0).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}