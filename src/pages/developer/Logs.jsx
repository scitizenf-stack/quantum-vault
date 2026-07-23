import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Download, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Logs() {
  const { canView, canAdmin } = useRBAC();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['access-logs-full'],
    queryFn: () => base44.entities.AccessLog.list('-created_date', 100),
    refetchInterval: 30000,
  });

  if (!canAdmin()) return <AccessDenied section="Logs" />;

  const shown = logs.filter(l => {
    const matchSearch = !search || (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.ip || '').includes(search);
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportCsv = () => {
    const rows = [['Timestamp', 'Action', 'IP', 'Location', 'Device', 'Status']];
    shown.forEach(l => rows.push([
      l.created_date ? new Date(l.created_date).toISOString() : '',
      l.action, l.ip || '', l.location || '', l.device || '', l.status
    ]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'access_logs.csv';
    a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Logs</h1>
          <p className="text-xs text-muted-foreground mt-1">Last 100 access events · auto-refresh 30s</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCsv}>
          <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Input placeholder="Search action or IP..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        {['all', 'success', 'failed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 rounded" />)}</div>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-10 flex flex-col items-center gap-3 text-center">
          <ShieldAlert className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm font-medium">No access events found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Timestamp', 'Action', 'IP', 'Location', 'Device', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map(l => (
                <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{l.created_date ? new Date(l.created_date).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 font-medium">{l.action}</td>
                  <td className="px-4 py-3 font-mono">{l.ip || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.location || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[120px]">{l.device || '—'}</td>
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