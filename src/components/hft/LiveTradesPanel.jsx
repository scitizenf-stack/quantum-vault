import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const MAX_ROWS = 50;

export default function LiveTradesPanel({ lastTick }) {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    if (!lastTick) return;
    if (lastTick.channel === 'trades' || lastTick.type === 'trade') {
      setTrades(prev => [lastTick, ...prev].slice(0, MAX_ROWS));
    }
  }, [lastTick]);

  return (
    <div className="rounded-xl bg-card border border-border flex flex-col h-full max-h-96">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <h3 className="text-xs font-semibold">Live Executions</h3>
        <span className="text-[10px] font-mono text-muted-foreground">{trades.length} recent</span>
      </div>
      <div className="overflow-y-auto flex-1 divide-y divide-border/40">
        {trades.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">Waiting for trades...</div>
        ) : trades.map((t, i) => {
          const isBuy = t.side === 'buy';
          return (
            <div key={i} className="flex items-center justify-between px-4 py-2 hover:bg-secondary/20 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                {isBuy
                  ? <ArrowUpRight className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  : <ArrowDownLeft className="w-3 h-3 text-destructive flex-shrink-0" />}
                <span className={cn('font-bold', isBuy ? 'text-emerald-400' : 'text-destructive')}>{t.symbol}</span>
              </div>
              <span className="text-foreground">{Number(t.price || 0).toLocaleString()}</span>
              <span className="text-muted-foreground">{Number(t.size || 0).toFixed(4)}</span>
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded', isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-destructive/10 text-destructive')}>
                {isBuy ? 'BUY' : 'SELL'}
              </span>
              <span className="text-muted-foreground text-[9px]">
                {t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : 'now'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}