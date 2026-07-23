import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';
import { Pause, Play, DollarSign } from 'lucide-react';
import { elephone } from '@/lib/elephoneClient';
import { toast } from 'sonner';
import AdjustBalanceModal from '@/components/clients/AdjustBalanceModal';

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const STATUS_CLASS = { active: 'text-accent', suspended: 'text-orange-400', closed: 'text-destructive' };

export default function Clients() {
  const { canAdmin } = useRBAC();
  const qc = useQueryClient();
  const [adjustTarget, setAdjustTarget] = useState(null);

  const { data: accounts = [], isLoading } = useQuery({ queryKey: ['elephone-accounts'], queryFn: () => elephone.list('TradingAccount'), refetchInterval: 60000 });

  if (!canAdmin()) return <AccessDenied section="Clients" />;

  const aum = accounts.reduce((s, a) => s + (a.balance_usd || 0), 0);
  const active = accounts.filter(a => a.status === 'active').length;
  const suspended = accounts.filter(a => a.status === 'suspended').length;
  const totalReturned = accounts.reduce((s, a) => s + (a.total_profit_returned || 0), 0);

  const setStatus = async (a, status) => {
    try { await elephone.update('TradingAccount', a.id, { status }); toast.success(`${a.account_number} → ${status}`); qc.invalidateQueries({ queryKey: ['elephone-accounts'] }); }
    catch (e) { toast.error(`Failed: ${e.message}`); }
  };

  const forceSplit = async (a) => {
    const amount = (a.balance_usd || 0) * 0.0105;
    const now = new Date().toISOString();
    try {
      await elephone.create('ProfitSplit', { trading_account_id: a.id, user_id: a.user_id, period_start: now, period_end: now, client_amount: amount, status: 'processed', processed_at: now });
      await elephone.update('TradingAccount', a.id, { total_profit_returned: (a.total_profit_returned || 0) + amount, last_split_at: now });
      toast.success(`Distributed ${fmt(amount)} to ${a.account_number}`);
      qc.invalidateQueries({ queryKey: ['elephone-accounts'] });
      qc.invalidateQueries({ queryKey: ['elephone-splits'] });
    } catch (e) { toast.error(`Split failed: ${e.message}`); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Client Accounts</h1>
        <p className="text-xs text-muted-foreground">TradingAccount records from ElePhone · auto-refresh 60s</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Total AUM', fmt(aum), true], ['Active', active, false], ['Suspended', suspended, false], ['Profit Returned', fmt(totalReturned), true]].map(([l, v, s]) => (
          <div key={l} className="rounded-xl bg-card border border-border p-3"><p className="text-[10px] text-muted-foreground uppercase">{s && '🔒 '}{l}</p><p className="text-lg font-mono font-bold">{v}</p></div>
        ))}
      </div>

      {isLoading ? <div className="space-y-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div> : accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-12 text-center text-sm text-muted-foreground">No client accounts</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-xs min-w-[820px]">
            <thead className="sticky top-0 bg-secondary/90"><tr className="border-b border-border">{['Account #', 'Status', 'Balance', 'Deposited', 'Auto-Trade', 'Keys', 'Last Split', 'Actions'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id} className="border-b border-border/40 hover:bg-secondary/20">
                  <td className="px-3 py-2 font-mono font-semibold">{a.account_number || a.id?.slice(-8)}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] font-semibold ${STATUS_CLASS[a.status] || 'text-muted-foreground'}`}>{a.status}</span></td>
                  <td className="px-3 py-2 font-mono">{fmt(a.balance_usd)}</td>
                  <td className="px-3 py-2 font-mono">{fmt(a.total_deposited)}</td>
                  <td className="px-3 py-2"><span className={`w-2 h-2 rounded-full inline-block ${a.auto_trading_enabled ? 'bg-accent' : 'bg-muted-foreground/40'}`} /></td>
                  <td className="px-3 py-2"><span className={`w-2 h-2 rounded-full inline-block ${a.exchange_keys_linked ? 'bg-accent' : 'bg-muted-foreground/40'}`} /></td>
                  <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{a.last_split_at ? new Date(a.last_split_at).toLocaleDateString() : '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {a.status === 'active' ? (
                        <button onClick={() => setStatus(a, 'suspended')} className="p-1 hover:bg-orange-500/10 rounded" title="Suspend"><Pause className="w-3.5 h-3.5 text-orange-400" /></button>
                      ) : (
                        <button onClick={() => setStatus(a, 'active')} className="p-1 hover:bg-accent/10 rounded" title="Reactivate"><Play className="w-3.5 h-3.5 text-accent" /></button>
                      )}
                      <button onClick={() => setAdjustTarget(a)} className="p-1 hover:bg-secondary rounded" title="Adjust Balance"><DollarSign className="w-3.5 h-3.5 text-primary" /></button>
                      <button onClick={() => forceSplit(a)} className="p-1 hover:bg-secondary rounded" title="Force Distribution"><DollarSign className="w-3.5 h-3.5 text-yellow-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdjustBalanceModal account={adjustTarget} onClose={() => setAdjustTarget(null)} onConfirm={async (amount, reason) => {
        try { await elephone.update('TradingAccount', adjustTarget.id, { balance_usd: amount, admin_note: reason }); toast.success('Balance updated'); qc.invalidateQueries({ queryKey: ['elephone-accounts'] }); setAdjustTarget(null); }
        catch (e) { toast.error(`Failed: ${e.message}`); }
      }} />
    </div>
  );
}