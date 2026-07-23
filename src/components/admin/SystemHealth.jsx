import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { meshApi } from '@/lib/meshClient';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const statusConfig = {
  operational: { color: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Operational' },
  degraded:    { color: 'text-yellow-400',  dot: 'bg-yellow-400',  label: 'Degraded' },
  down:        { color: 'text-destructive', dot: 'bg-destructive', label: 'Down' },
};

export default function SystemHealth() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['system-health'],
    queryFn:  () => meshApi.getSystemHealth(),
    refetchInterval: 15000,
  });

  const services = data?.services || [];

  const operational = services.filter(s => s.status === 'operational').length;

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">System Health</h3>
        <div className="flex items-center gap-3">
          {isLoading ? <Skeleton className="h-4 w-24" /> :
            <span className="text-xs text-emerald-400 font-medium">{operational}/{services.length} Operational</span>
          }
          <button onClick={() => refetch()} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="space-y-2.5">
        {isLoading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-5 w-full" />) :
          services.map((svc) => {
            const cfg = statusConfig[svc.status] || statusConfig.operational;
            return (
              <div key={svc.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
                  <span className="text-xs text-foreground">{svc.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-muted-foreground">{svc.latency}</span>
                  <span className={cn('text-[10px] font-medium', cfg.color)}>{cfg.label}</span>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}