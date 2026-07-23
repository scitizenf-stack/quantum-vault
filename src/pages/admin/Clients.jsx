import React, { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { elephoneCall, normalizeList } from '@/lib/useElephone';
import { toast } from 'sonner';

export default function Clients() {
  const { canAdmin } = useRBAC();
  const qc = useQueryClient();
  const { data: rawAccounts, isLoading } = useQuery({
    queryKey: ['elephone-accounts'],
    queryFn: () => elephoneCall('GET', 'TradingAccount'),
    refetchInterval: 30000,
  });
  const accounts = useMemo(() => normalizeList(rawAccounts), [rawAccounts]);

  const totalAum = accounts.reduce((s, a) => s + (a.balance_usd || 0), 0);
  const activeCount = accounts.filter(a => a.status === 'active').length;
  const totalReturned = accounts.reduce((s, a) => s + (a.total_profit_returned || 0), 0);

  const suspend = async (a) => {
    try {
      await elephoneCall('PATCH', 'TradingAccount', { id: a.id, body: { status: 'suspended' } });
      toast.success(`${a.account_number || 'Account'} suspended`);
      qc.invalidateQueries({ queryKey: ['elephone-accounts'] });
    } catch (e) { toast.error(`Suspend failed: ${e.message}`); }
  };

  if (!canAdmin()) return <AccessDenied section="Clients" />;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Client Accounts</h1>
        <p className="text-xs text-muted-foreground">All TradingAccount records from ElePhone · admin only</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card border border-border p-3"><p className="text-[10px] text-muted-foreground uppercase">Total AUM</p><p className="text-lg font-mono font-bold">${totalAum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
        <div className="rounded-xl bg-card border border-border p-3"><p className="text-[10px] text-muted-foreground uppercase">Active Accounts</p><p className="text-lg font-mono font-bold text-accent">{activeCount}</p></div>
        <div className="rounded-xl bg-card border border-border p-3"><p className="text-[10px] text-muted-foreground uppercase">Profit Returned (all time)</p><p className="text-lg font-mono font-bold text-yellow-400">${totalReturned.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
        <div className="rounded-xl bg-card border border-border p-3"><p className="text-[10px] text-muted-foreground uppercase">Total Accounts</p><p className="text-lg font-mono font-bold">{accounts.length}</p></div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-12 text-center text-sm text-muted-foreground">No client accounts yet — approve applications to create accounts</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead className="sticky top-0 bg-secondary/90">
              <tr className="border-b border-border">
                {['Account #', 'Client', 'Balance', 'Auto-Trading', 'Keys Linked', 'Return Rate', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id} className="border-b border-border/40 hover:bg-secondary/20">
                  <td className="px-3 py-2 font-mono font-semibold">{a.account_number || '—'}</td>
                  <td className="px-3 py-2 text-muted-foreground">{a.client_name || a.user_id || '—'}</td>
                  <td className="px-3 py-2 font-mono">${(a.balance_usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2"><Badge variant={a.auto_trading_enabled ? 'default' : 'outline'} className="text-[9px]">{a.auto_trading_enabled ? 'ON' : 'OFF'}</Badge></td>
                  <td className="px-3 py-2"><Badge variant={a.exchange_keys_linked ? 'default' : 'outline'} className="text-[9px]">{a.exchange_keys_linked ? 'LINKED' : 'NO'}</Badge></td>
                  <td className="px-3 py-2 font-mono">{((a.client_return_rate || 0) * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2"><Badge variant={a.status === 'active' ? 'default' : a.status === 'suspended' ? 'destructive' : 'secondary'} className="text-[9px]">{a.status || '—'}</Badge></td>
                  <td className="px-3 py-2">
                    {a.status === 'active' && <Button size="sm" variant="destructive" className="h-6 text-[10px] px-2" onClick={() => suspend(a)}>Suspend</Button>}
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