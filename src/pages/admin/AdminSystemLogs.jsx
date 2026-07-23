import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';

const ORACLE = 'https://app.youthballot.org';
const API_KEY = 'qv_live_d54cf7079c6c809ba2d0378839559e2d';

const PAGE_SIZE = 20;
const lvlStyle = {
  success: 'text-accent bg-accent/10',
  failed: 'text-destructive bg-destructive/10',
  INFO: 'text-accent bg-accent/10',
  WARN: 'text-yellow-400 bg-yellow-500/10',
  ERROR: 'text-destructive bg-destructive/10',
};

export default function AdminSystemLogs() {
  const { canAdmin } = useRBAC();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);

  const { data: logs = [], isLoading: entityLoading } = useQuery({
    queryKey: ['access-logs-admin'],
    queryFn: () => base44.entities.AccessLog.list('-created_date', 200),
    refetchInterval: 15000,
  });

  const { data: omegaStatus } = useQuery({
    queryKey: ['omega-status-logs'],
    queryFn: () => fetch(`${ORACLE}/api/omega/status`, { headers: { 'X-API-Key': API_KEY }, signal: AbortSignal.timeout(6000) }).then(r => r.json()).catch(() => null),
    refetchInterval: 15000,
  });

  const omegaLogs = (omegaStatus?.recentLogs || []).slice(0, 50).map((l, i) => ({
    id: `omega-${i}`,
    created_date: l.ts || l.timestamp || new Date().toISOString(),
    action: l.message || l.log || l.status || JSON.stringify(l),
    status: l.status === 'STRIKE' ? 'success' : l.level === 'ERROR' ? 'failed' : 'success',
    ip: 'OMEGA',
    device: 'VPS Oracle',
  }));

  const isLoading = entityLoading;
  const allLogs = [...omegaLogs, ...logs];

  if (!canAdmin()) return <AccessDenied section="System Logs" />;

  const filtered = allLogs.filter(l =>
    (statusFilter === 'ALL' || l.status === statusFilter) &&
    (
      (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.ip || '').includes(search) ||
      (l.device || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">System Logs</h1>
        <p className="text-xs text-muted-foreground mt-1">{filtered.length} entries (incl. OMEGA logs) · auto-refresh 15s</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search action, IP, device..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {['ALL', 'success', 'failed'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
              className={`text-xs px-3 py-2 rounded-lg border transition-all capitalize ${statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0a0c10] border border-border rounded-xl p-4 space-y-1 font-mono text-xs max-h-[500px] overflow-y-auto">
        {isLoading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-6 w-full bg-secondary/30" />) :
          paged.length === 0 ? <p className="text-muted-foreground text-center py-6">No logs matching filters</p> :
          paged.map((l, i) => (
            <div key={i} className="flex gap-3 hover:bg-white/5 px-1 py-0.5 rounded items-start">
              <span className="text-muted-foreground shrink-0 text-[10px]">
                {l.created_date ? new Date(l.created_date).toLocaleString() : '—'}
              </span>
              <span className={`text-[10px] font-bold px-1.5 rounded shrink-0 ${lvlStyle[l.status] || ''}`}>{l.status?.toUpperCase()}</span>
              <span className="text-purple-400 shrink-0 hidden md:block">{l.ip || '—'}</span>
              <span className="text-gray-300 flex-1 truncate">{l.action} {l.device ? `· ${l.device}` : ''}</span>
            </div>
          ))
        }
      </div>

      {pages > 1 && (
        <div className="flex gap-2 justify-center">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="text-xs px-3 py-1.5 rounded border border-border disabled:opacity-30 hover:bg-secondary transition-colors">← Prev</button>
          <span className="text-xs text-muted-foreground py-1.5">Page {page + 1} / {pages}</span>
          <button disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)} className="text-xs px-3 py-1.5 rounded border border-border disabled:opacity-30 hover:bg-secondary transition-colors">Next →</button>
        </div>
      )}
    </div>
  );
}