import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert } from 'lucide-react';

export default function AccessLogs() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['access-logs'],
    queryFn: () => base44.entities.AccessLog.list('-created_date', 50),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Access Logs</h1>
        <p className="text-xs text-muted-foreground mt-1">Authentication and access history</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 rounded" />)}</div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-10 flex flex-col items-center gap-3 text-center">
          <ShieldAlert className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm font-medium">No access logs recorded</p>
          <p className="text-xs text-muted-foreground max-w-sm">Access events will appear here once they are logged to the AccessLog entity.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Timestamp', 'IP Address', 'Location', 'Device', 'Action', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{l.created_date ? new Date(l.created_date).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono">{l.ip || '—'}</td>
                  <td className="px-4 py-3 text-xs">{l.location || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{l.device || '—'}</td>
                  <td className="px-4 py-3 text-xs font-medium">{l.action}</td>
                  <td className="px-4 py-3">
                    <Badge variant={l.status === 'success' ? 'default' : 'destructive'} className="text-[10px]">{l.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}