import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Download, Play } from 'lucide-react';
import { toast } from 'sonner';

const DAILY_RATE = 0.0003517;
const PERIOD_DAYS = 30;
const call = (entity, method, id, body) => base44.functions.invoke('elephoneApi', { entity, method, id, body });
const extractList = (d) => {
  const data = d?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

function Metric({ label, value, color }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-mono font-bold ${color || ''}`}>{value}</p>
    </div>
  );
}

export default function Profits() {
  const { canAdmin } = useRBAC();
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);

  const { data: strategies = [] } = useQuery({ queryKey: ['hft-strategies'], queryFn: () => base44.entities.Strategy.list() });
  const { data: acctsResp, isLoading } = useQuery({ queryKey: ['elephone-accounts'], queryFn: () => call('TradingAccount', 'GET'), refetchInterval: 30000 });

  if (!canAdmin()) return <AccessDenied section="Profits" />;

  const accounts = extractList(acctsResp).filter(a => a.status === 'active');
  const grossProfit = strategies.reduce((s, st) => s + (st.pnl || 0), 0);
  const clientRows = accounts.map(a => {
    const balance = a.balance || 0;
    const allocated = balance * DAILY_RATE * PERIOD_DAYS;
    const totalAllocated = (a.total_allocated || 0) + allocated;
    const ownerNet = grossProfit - totalAllocated;
    return { id: a.id, name: a.full_name || a.name || a.user_id || 'Client', balance, allocated, totalAllocated, ownerNet };
  });
  const totalAllocatedThisPeriod = clientRows.reduce((s, r) => s + r.allocated, 0);
  const totalAllocated = clientRows.reduce((s, r) => s + r.totalAllocated, 0);
  const ownerNet = grossProfit - totalAllocatedThisPeriod;

  const runDistribution = async () => {
    setRunning(true);
    try {
      await Promise.all(clientRows.map(r => call('TradingAccount', 'PATCH', r.id, { last_distribution: r.allocated, total_allocated: r.totalAllocated }).catch(() => null)));
      toast.success(`Distribution run complete · ${clientRows.length} accounts updated`);
      qc.invalidateQueries({ queryKey: ['elephone-accounts'] });
    } catch (e) { toast.error(`Distribution failed: ${e.message}`); }
    finally { setRunning(false); }
  };

  const exportCsv = () => {
    const rows = [['Client', 'Balance', 'Allocated This Period', 'Total Allocated', 'Owner Net from Client'],
      ...clientRows.map(r => [r.name, r.balance.toFixed(2), r.allocated.toFixed(2), r.totalAllocated.toFixed(2), r.ownerNet.toFixed(2)])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `profit-report-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <DollarSign className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Profit Command Center</h1>
          <p className="text-xs text-muted-foreground">Owner financial view · PRIVATE</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Gross Profit" value={`$${grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="text-accent" />
        <Metric label="Client Obligations" value={`$${totalAllocatedThisPeriod.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="text-yellow-400" />
        <Metric label="OWNER NET" value={`$${ownerNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color={ownerNet >= 0 ? 'text-accent' : 'text-destructive'} />
        <Metric label="Active Traders" value={accounts.length} />
      </div>

      <div className="rounded-xl bg-card border border-border p-5 space-y-1">
        <h2 className="text-sm font-semibold mb-2">Split Formula</h2>
        <p className="text-xs text-muted-foreground font-mono">Vanguard S&P 500: 10.7% / yr</p>
        <p className="text-xs text-muted-foreground font-mono">Client Rate: 10.7% + 20% = 12.84% / yr (0.03517% / day)</p>
        <p className="text-xs text-muted-foreground font-mono">Client Share = balance × daily_rate × period_days ({PERIOD_DAYS}d)</p>
        <p className="text-xs text-muted-foreground font-mono">Owner Net = gross_profit − Σ(client shares)</p>
      </div>

      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Per-Client Profit</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={exportCsv} disabled={clientRows.length === 0}><Download className="w-3.5 h-3.5" /> Export CSV</Button>
            <Button size="sm" className="gap-1.5 text-xs" onClick={runDistribution} disabled={running || clientRows.length === 0}><Play className="w-3.5 h-3.5" /> {running ? 'Running...' : 'Run Distribution'}</Button>
          </div>
        </div>
        {isLoading ? <Skeleton className="h-32 w-full" /> : clientRows.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No active trader accounts — approve clients in Client Approvals to populate.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[640px]">
              <thead className="sticky top-0 bg-secondary/90">
                <tr className="border-b border-border">
                  {['Client', 'Balance', 'Allocated This Period', 'Total Allocated', 'Owner Net from Client'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {clientRows.map(r => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-secondary/20">
                    <td className="px-3 py-2 font-mono">{r.name}</td>
                    <td className="px-3 py-2 font-mono">${r.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 font-mono text-yellow-400">${r.allocated.toFixed(2)}</td>
                    <td className="px-3 py-2 font-mono">${r.totalAllocated.toFixed(2)}</td>
                    <td className={`px-3 py-2 font-mono font-bold ${r.ownerNet >= 0 ? 'text-accent' : 'text-destructive'}`}>${r.ownerNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border bg-secondary/30 font-bold">
                  <td className="px-3 py-2">TOTAL</td>
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2 font-mono text-yellow-400">${totalAllocatedThisPeriod.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono">${totalAllocated.toFixed(2)}</td>
                  <td className={`px-3 py-2 font-mono ${ownerNet >= 0 ? 'text-accent' : 'text-destructive'}`}>${ownerNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}