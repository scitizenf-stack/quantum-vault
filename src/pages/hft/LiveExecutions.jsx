import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import OmegaRouterPanel from '@/components/hft/OmegaRouterPanel';
import OmegaScanLog from '@/components/hft/OmegaScanLog';

export default function LiveExecutions() {
  const { canAdmin } = useRBAC();
  const [filterStrategy, setFilterStrategy] = useState('');
  const [filterPair, setFilterPair] = useState('');

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.list('-created_date', 100),
    refetchInterval: 10000,
  });

  if (!canAdmin()) return <AccessDenied section="Live Executions" />;

  const filtered = trades.filter(t =>
    (!filterStrategy || t.strategy?.toLowerCase().includes(filterStrategy.toLowerCase())) &&
    (!filterPair || t.pair?.toLowerCase().includes(filterPair.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* OMEGA Router Live Feed */}
      <OmegaRouterPanel />

      {/* OMEGA Scan Log */}
      <OmegaScanLog />

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-2.5 text-xs text-yellow-300 font-semibold">
        ⚠ Paper trading only — all trades below are marked PAPER (entity store)
      </div>

      <div>
        <h1 className="text-2xl font-bold">Live Executions</h1>
        <p className="text-xs text-muted-foreground mt-1">{trades.length} trades · auto-refresh 10s</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <input value={filterStrategy} onChange={e => setFilterStrategy(e.target.value)} placeholder="Filter by strategy..."
          className="text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-ring flex-1 min-w-32" />
        <input value={filterPair} onChange={e => setFilterPair(e.target.value)} placeholder="Filter by pair..."
          className="text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-ring flex-1 min-w-32" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-12 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm font-semibold">No trades found</p>
          <p className="text-xs text-muted-foreground">Trade records will appear here when strategies execute</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="sticky top-0 z-10 bg-secondary/90">
              <tr className="border-b border-border">
                {['Time','Strategy','Pair','Side','Qty','Price','Total','P&L','Status'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-3 py-2 text-[10px] font-mono text-muted-foreground">
                    {t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : new Date(t.created_date).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono">{t.strategy}</td>
                  <td className="px-3 py-2 text-xs font-mono">{t.pair}</td>
                  <td className="px-3 py-2">
                    <Badge variant={t.side === 'BUY' ? 'default' : 'destructive'} className="text-[10px]">{t.side}</Badge>
                  </td>
                  <td className="px-3 py-2 text-xs font-mono">{t.qty}</td>
                  <td className="px-3 py-2 text-xs font-mono">${(t.price || 0).toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs font-mono">${(t.total || 0).toLocaleString()}</td>
                  <td className={`px-3 py-2 text-xs font-mono font-bold ${(t.pnl || 0) >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-[10px] border-yellow-500/50 text-yellow-400">{t.status || 'PAPER'}</Badge>
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