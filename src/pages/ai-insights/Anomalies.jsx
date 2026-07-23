import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function Anomalies() {
  const { canView } = useRBAC();
  const qc = useQueryClient();

  const { data: logs = [], isLoading: lLoading } = useQuery({
    queryKey: ['access-logs-anomaly'],
    queryFn: () => base44.entities.AccessLog.list('-created_date', 200),
    refetchInterval: 30000,
  });

  const { data: transactions = [], isLoading: tLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 100),
  });

  if (!canView('ai-insights')) return <AccessDenied section="AI Insights" />;

  const isLoading = lLoading || tLoading;

  // Detect log anomalies: same action >5 times in 1h
  const hourBuckets = {};
  logs.forEach(l => {
    if (!l.created_date) return;
    const bucket = `${l.action}_${new Date(l.created_date).toISOString().slice(0, 13)}`;
    if (!hourBuckets[bucket]) hourBuckets[bucket] = [];
    hourBuckets[bucket].push(l);
  });
  const logAnomalies = Object.entries(hourBuckets)
    .filter(([, entries]) => entries.length > 5)
    .map(([key, entries]) => ({
      id: key, type: 'ACCESS_LOG', severity: entries.length > 10 ? 'HIGH' : 'MEDIUM',
      description: `Action "${entries[0].action}" occurred ${entries.length} times in 1h`,
      time: entries[0].created_date, acknowledged: false,
    }));

  // Detect high-value transactions
  const txAnomalies = transactions
    .filter(t => (t.total_amount || 0) > 1000)
    .map(t => ({
      id: t.id, type: 'TRANSACTION', severity: t.total_amount > 10000 ? 'HIGH' : 'MEDIUM',
      description: `Large transaction: ${t.type} ${t.asset_name} — $${t.total_amount?.toFixed(2)}`,
      time: t.created_date, acknowledged: t.acknowledged,
    }));

  const all = [...logAnomalies, ...txAnomalies].sort((a, b) => new Date(b.time) - new Date(a.time));

  const SEV_COLORS = { HIGH: 'bg-destructive/20 text-destructive', MEDIUM: 'bg-yellow-500/20 text-yellow-400', LOW: 'bg-muted text-muted-foreground' };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Anomaly Detection</h1>
        <p className="text-muted-foreground text-sm">Automated flags from AccessLog and Transaction entities</p>
      </div>

      <div className="space-y-2">
        {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />) :
          all.length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-8 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">No anomalies detected. System looks clean.</p>
            </div>
          ) : all.map(a => (
            <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <Badge className={SEV_COLORS[a.severity]}>{a.severity}</Badge>
                <div>
                  <p className="text-sm font-medium">{a.description}</p>
                  <p className="text-xs text-muted-foreground">{a.type} · {a.time ? format(new Date(a.time), 'MMM d HH:mm') : '—'}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}