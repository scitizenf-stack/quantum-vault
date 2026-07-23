import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Lock, Play } from 'lucide-react';
import { elephone } from '@/lib/elephoneClient';
import { toast } from 'sonner';

const MONTHLY_RATE = 0.0105;
const fmt = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

export default function ProfitEngine() {
  const { canAdmin } = useRBAC();
  const qc = useQueryClient();
  const [grossInput, setGrossInput] = useState('');
  const [running, setRunning] = useState(false);

  const { data: trades = [] } = useQuery({ queryKey: ['hft-trades'], queryFn: () => base44.entities.Trade.list('-created_date', 500) });
  const { data: accounts = [], isLoading: aLoading } = useQuery({ queryKey: ['elephone-accounts'], queryFn: () => elephone.list('TradingAccount'), refetchInterval: 60000 });
  const { data: splits = [] } = useQuery({ queryKey: ['elephone-splits'], queryFn: () => elephone.list('ProfitSplit'), refetchInterval: 60000 });

  if (!canAdmin()) return <AccessDenied section="Profit Engine" />;

  const grossProfit = trades.filter(t => (t.pnl || 0) > 0).reduce((s, t) => s + t.pnl, 0);
  const clientObligations = splits.reduce((s, sp) => s + (sp.client_amount || 0), 0);
  const ownerNet = grossProfit - clientObligations;
  const activeAccounts = accounts.filter(a => a.status === 'active');
  const aum = accounts.reduce((s, a) => s + (a.balance_usd || 0), 0);

  const gross = parseFloat(grossInput) || 0;
  const preview = activeAccounts.map(a => ({ name: a.account_number || a.id, balance: a.balance_usd || 0, owed: (a.balance_usd || 0) * MONTHLY_RATE }));
  const totalOwed = preview.reduce((s, p) => s + p.owed, 0);
  const operatorTake = gross - totalOwed;
  const operatorPct = gross > 0 ? (operatorTake / gross) * 100 : 0;

  const execute = async () => {
    setRunning(true);
    let ok = 0, fail = 0;
    const now = new Date().toISOString();
    const periodStart = new Date(); periodStart.setDate(1); periodStart.setHours(0, 0, 0, 0);
    for (const a of activeAccounts) {
      const clientAmount = (a.balance_usd || 0) * MONTHLY_RATE;
      try {
        await elephone.create('ProfitSplit', { trading_account_id: a.id, user_id: a.user_id, period_start: periodStart.toISOString(), period_end: now, client_amount: clientAmount, status: 'processed', processed_at: now });
        await elephone.update('TradingAccount', a.id, { total_profit_returned: (a.total_profit_returned || 0) + clientAmount, last_split_at: now });
        ok++;
      } catch { fail++; }
    }
    setRunning(false);
    toast.success(`Distribution complete — ${ok} processed${fail ? ` · ${fail} failed` : ''}`);
    qc.invalidateQueries({ queryKey: ['elephone-splits'] });
    qc.invalidateQueries({ queryKey: ['elephone-accounts'] });
  };

  const cards = [
    { label: 'Total Gross Profit', value: fmt(grossProfit), sensitive: true },
    { label: 'Client Obligations', value: fmt(clientObligations), sensitive: true },
    { label: 'Owner Net Revenue', value: fmt(ownerNet), sensitive: true },
    { label: 'Active Clients', value: activeAccounts.length },
    { label: 'Total Client AUM', value: fmt(aum), sensitive: true },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Profit Engine</h1>
        <p className="text-xs text-muted-foreground">Owner-only financial view · never exposed in ElePhone</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 text-xs space-y-1">
        <p className="font-semibold">Split Formula</p>
        <p className="text-muted-foreground">Vanguard S&P 500 baseline: 10.5% / yr · Client premium +20% = 12.6% / yr = 1.05% / month</p>
        <p className="text-muted-foreground">Client return = balance × 1.05% · Owner retains gross − all client returns</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl bg-card border border-border p-3">
            <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">{c.sensitive && <Lock className="w-3 h-3" />}{c.label}</p>
            <p className="text-lg font-mono font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-bold">Monthly Profit Distribution</p>
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-xs text-muted-foreground">Gross Trading Profit This Period ($)</label>
          <input type="number" value={grossInput} onChange={e => setGrossInput(e.target.value)} placeholder="0.00" className="text-xs bg-input border border-border rounded-lg px-3 py-2 font-mono w-40 outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="rounded-lg bg-secondary/40 p-2"><p className="text-[9px] text-muted-foreground uppercase">Gross</p><p className="font-mono font-bold">{fmt(gross)}</p></div>
          <div className="rounded-lg bg-secondary/40 p-2"><p className="text-[9px] text-muted-foreground uppercase">Client Accounts</p><p className="font-mono font-bold">{activeAccounts.length}</p></div>
          <div className="rounded-lg bg-secondary/40 p-2"><p className="text-[9px] text-muted-foreground uppercase">Client Returns</p><p className="font-mono font-bold text-yellow-400">{fmt(totalOwed)}</p></div>
          <div className="rounded-lg bg-accent/10 p-2"><p className="text-[9px] text-muted-foreground uppercase">🔒 Operator Take</p><p className="font-mono font-bold text-accent">{fmt(operatorTake)} ({operatorPct.toFixed(1)}%)</p></div>
        </div>
        {preview.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-secondary/40"><tr>{['Account', 'Balance', 'Return Owed'].map(h => <th key={h} className="text-left px-3 py-1.5 text-[10px] text-muted-foreground">{h}</th>)}</tr></thead>
              <tbody>
                {preview.map((p, i) => (
                  <tr key={i} className="border-t border-border/30"><td className="px-3 py-1.5 font-mono">{p.name}</td><td className="px-3 py-1.5 font-mono">{fmt(p.balance)}</td><td className="px-3 py-1.5 font-mono text-yellow-400">{fmt(p.owed)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Button onClick={execute} disabled={running || activeAccounts.length === 0} className="gap-1.5"><Play className="w-3.5 h-3.5" /> {running ? 'Processing...' : 'Execute Distribution'}</Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <p className="text-sm font-bold">Profit Split History <span className="text-[10px] text-muted-foreground font-normal">(🔒 Owner Net — admin only)</span></p>
        {aLoading ? <Skeleton className="h-20" /> : splits.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No distributions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[640px]">
              <thead className="bg-secondary/40"><tr>{['Client', 'Period', 'Client Amount', 'Owner Net', 'Status'].map(h => <th key={h} className="text-left px-3 py-1.5 text-[10px] text-muted-foreground">{h}</th>)}</tr></thead>
              <tbody>
                {splits.map(sp => (
                  <tr key={sp.id} className="border-t border-border/30">
                    <td className="px-3 py-1.5 font-mono">{sp.trading_account_id?.slice(-8) || '—'}</td>
                    <td className="px-3 py-1.5 font-mono text-[10px]">{sp.period_end ? new Date(sp.period_end).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-1.5 font-mono">{fmt(sp.client_amount)}</td>
                    <td className="px-3 py-1.5 font-mono text-accent">🔒 {fmt((sp.gross_profit || 0) - (sp.client_amount || 0))}</td>
                    <td className="px-3 py-1.5"><Badge variant="outline" className="text-[9px]">{sp.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}