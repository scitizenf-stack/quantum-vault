import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { meshApi } from '@/lib/meshClient';
import { useQueryClient } from '@tanstack/react-query';

export default function StrategyCard({ strategy }) {
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const queryClient = useQueryClient();

  const handleToggle = async (val) => {
    setToggling(true);
    await meshApi.hftToggleStrategy(strategy.id, val);
    queryClient.invalidateQueries({ queryKey: ['hft-strategies'] });
    setToggling(false);
  };

  const pnl = strategy.pnl_today ?? 0;
  const isPos = pnl >= 0;

  const riskColors = {
    low:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    high:   'bg-destructive/15 text-destructive border-destructive/30',
  };

  return (
    <div className={cn('rounded-xl bg-card border transition-all', strategy.active ? 'border-primary/30' : 'border-border')}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', strategy.active ? 'bg-primary/15' : 'bg-secondary')}>
              <Zap className={cn('w-4 h-4', strategy.active ? 'text-primary' : 'text-muted-foreground')} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{strategy.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{strategy.type} · {strategy.symbol}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className={cn('text-sm font-mono font-bold', isPos ? 'text-emerald-400' : 'text-destructive')}>
                {isPos ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-muted-foreground">Today P&L</p>
            </div>
            <Switch checked={!!strategy.active} onCheckedChange={handleToggle} disabled={toggling} />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <Badge className={cn('text-[10px] border', riskColors[strategy.risk_level] || riskColors.medium)}>
            {strategy.risk_level?.toUpperCase()} RISK
          </Badge>
          <span className="text-[10px] font-mono text-muted-foreground">
            Trades: <span className="text-foreground">{strategy.trades_today ?? 0}</span>
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            Fill Rate: <span className="text-foreground">{strategy.fill_rate ?? '—'}%</span>
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            Latency: <span className={cn(strategy.latency_us < 100 ? 'text-emerald-400' : 'text-yellow-400')}>{strategy.latency_us ?? '—'}µs</span>
          </span>
        </div>
      </div>

      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-4 py-2 border-t border-border text-[10px] text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
      >
        {expanded ? <><ChevronUp className="w-3 h-3" /> Hide params</> : <><ChevronDown className="w-3 h-3" /> Strategy params</>}
      </button>

      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          {Object.entries(strategy.params || {}).map(([k, v]) => (
            <div key={k} className="bg-secondary/40 rounded-lg px-3 py-2">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{k.replace(/_/g, ' ')}</p>
              <p className="text-xs font-mono font-medium mt-0.5">{String(v)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}