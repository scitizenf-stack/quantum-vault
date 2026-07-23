import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { meshApi } from '@/lib/meshClient';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

export default function ExecutionsPanel() {
  const { data: raw, isLoading } = useQuery({
    queryKey: ['hft-executions'],
    queryFn: () => meshApi.hftGetExecutions(),
    refetchInterval: 3000,
  });

  const executions = raw?.executions || raw || [];

  return (
    <div className="rounded-xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Executions</span>
        <span className="relative flex h-2 w-2 ml-auto">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
      ) : executions.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">No executions yet</p>
      ) : (
        <div className="space-y-1 max-h-56 overflow-y-auto">
          {executions.map((ex, i) => {
            const isBuy = (ex.side || '').toLowerCase() === 'buy';
            return (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-secondary/40 text-xs font-mono">
                <span className={cn('font-bold text-[10px] w-7 text-center rounded px-1 py-0.5',
                  isBuy ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive')}>
                  {isBuy ? 'BUY' : 'SELL'}
                </span>
                <span className="text-foreground flex-1">{ex.symbol || '—'}</span>
                <span className="text-muted-foreground">{ex.qty != null ? ex.qty : '—'}</span>
                <span className="text-foreground">{ex.price != null ? `$${Number(ex.price).toLocaleString()}` : '—'}</span>
                {ex.timestamp && (
                  <span className="text-[10px] text-muted-foreground">{new Date(ex.timestamp).toLocaleTimeString()}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}