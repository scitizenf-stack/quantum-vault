import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { meshApi } from '@/lib/meshClient';
import { Shield, RefreshCw, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const SEV_CONFIG = {
  high:   { label: 'HIGH',   icon: AlertTriangle, color: 'text-destructive',  bg: 'bg-destructive/10',  border: 'border-destructive/30' },
  medium: { label: 'MED',    icon: AlertCircle,   color: 'text-yellow-400',   bg: 'bg-yellow-500/10',   border: 'border-yellow-500/30' },
  low:    { label: 'LOW',    icon: Info,          color: 'text-accent',       bg: 'bg-accent/10',       border: 'border-accent/30' },
  info:   { label: 'INFO',   icon: Info,          color: 'text-muted-foreground', bg: 'bg-secondary/40', border: 'border-border' },
};

function EventRow({ evt }) {
  const sev = (evt.severity || 'info').toLowerCase();
  const cfg = SEV_CONFIG[sev] || SEV_CONFIG.info;
  const Icon = cfg.icon;
  return (
    <div className={cn('flex items-start gap-3 px-3 py-2.5 rounded-lg border text-xs', cfg.bg, cfg.border)}>
      <Icon className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', cfg.color)} />
      <div className="flex-1 min-w-0">
        <p className="truncate">{evt.message || evt.action || 'Unknown event'}</p>
        {evt.ip && <p className="text-muted-foreground font-mono mt-0.5">{evt.ip}</p>}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0', cfg.color, cfg.border)}>{cfg.label}</Badge>
        {evt.timestamp && (
          <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
            {new Date(evt.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SecurityEventFeed({ compact = false }) {
  const { data: raw, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => meshApi.getSecurityEvents(),
    refetchInterval: 20000,
  });

  const events = raw?.events || raw || [];
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : null;

  return (
    <div className="rounded-xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Security Event Feed</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
        </div>
        <button onClick={() => refetch()} className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {lastUpdated && (
        <p className="text-[10px] text-muted-foreground font-mono">Last updated: {lastUpdated}</p>
      )}

      {isLoading ? (
        <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No security events</p>
      ) : (
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {(compact ? events.slice(0, 8) : events).map((evt, i) => (
            <EventRow key={i} evt={evt} />
          ))}
        </div>
      )}
    </div>
  );
}