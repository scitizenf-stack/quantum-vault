import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, Info, Zap, Brain } from 'lucide-react';

const typeConfig = {
  bullish:  { icon: TrendingUp,    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  bearish:  { icon: TrendingDown,  color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
  warning:  { icon: AlertTriangle, color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20' },
  signal:   { icon: Zap,           color: 'text-primary',     bg: 'bg-primary/10 border-primary/20' },
  info:     { icon: Info,          color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  anomaly:  { icon: Brain,         color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
};

export default function InsightCard({ insight }) {
  const cfg = typeConfig[insight.type] || typeConfig.info;
  const Icon = cfg.icon;
  const conf = insight.confidence != null ? Math.round(insight.confidence * 100) : null;

  return (
    <div className={cn('rounded-xl border p-4 flex gap-3', cfg.bg)}>
      <div className={cn('w-8 h-8 rounded-lg bg-card flex items-center justify-center flex-shrink-0 mt-0.5')}>
        <Icon className={cn('w-4 h-4', cfg.color)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug">{insight.title}</p>
          {conf != null && (
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full bg-card border border-border whitespace-nowrap', cfg.color)}>
              {conf}% conf
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.summary || insight.description}</p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {insight.symbol && (
            <span className="text-[10px] font-mono text-foreground/70 bg-card px-2 py-0.5 rounded border border-border">{insight.symbol}</span>
          )}
          {insight.timeframe && (
            <span className="text-[10px] text-muted-foreground">{insight.timeframe}</span>
          )}
          {insight.created_at && (
            <span className="text-[10px] text-muted-foreground ml-auto">{new Date(insight.created_at).toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}