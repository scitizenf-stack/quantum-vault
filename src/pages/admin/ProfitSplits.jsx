import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { elephoneCall, normalizeList } from '@/lib/useElephone';
import { toast } from 'sonner';

const VANGUARD_BASELINE = 0.105;
const CLIENT_PREMIUM = 0.20;
const CLIENT_ANNUAL_RATE = 0.126;
const CLIENT_MONTHLY_RATE = 0.0105;

export default function ProfitSplits() {
  const { canAdmin } = useRBAC();
  const qc = useQueryClient();
  const [gross, setGross] = useState('');
  const [processing, setProcessing] = useState(false);

  const { data: rawAccounts } = useQuery({ queryKey: ['elephone-accounts'], queryFn: () => elephoneCall('GET', 'TradingAccount') });
  const accounts = useMemo(() => normalizeList(rawAccounts).filter(a => a.status === 'active'), [rawAccounts]);
  const { data: rawSplits, isLoading } = useQuery({ queryKey: ['elephone-splits'], queryFn: () => elephoneCall('GET', 'ProfitSplit') });
  const splits = useMemo(() => normalizeList(rawSplits), [rawSplits]);

  const totalBalance = accounts.reduce((s, a) => s + (a.balance_usd || 0), 0);
  const grossNum = parseFloat(gross) || 0;
  const clientReturns = totalBalance * CLIENT_MONTHLY_RATE;
  const operatorTake = grossNum - clientReturns;
  const operatorPct = grossNum > 0 ? (operatorTake / grossNum) * 100 : 0;

  const processSplit = async () => {
    if (grossNum <= 0) { toast.error('Enter gross profit'); return; }
    setProcessing(true);
    try {
      const period = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
      for (const a of accounts) {
        const share = (a.balance_usd || 0) * CLIENT_MONTHLY_RATE;
        await elephoneCall('POST', 'ProfitSplit', { body: {
          account_id: a.id, period, gross_profit: grossNum,
          client_balance: a.balance_usd || 0, client_return: share,
          operator_amount: grossNum - share, status: 'processed',
        }});
      }
      toast.success(`Processed ${accounts.length} splits — operator take $${operatorTake.toFixed(2)}`);
      setGross('');
      qc.invalidateQueries({ queryKey: ['elephone-splits'] });
    } catch (e) { toast.error(`Split failed: ${e.message}`); }
    finally { setProcessing(false); }
  };

  if (!canAdmin()) return <AccessDenied section="Profit Splits" />;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Profit Splits</h1>
        <p className="text-xs text-muted-foreground">Monthly profit distribution · admin only</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-bold">Split Formula</p>
        <div className="text-[11px] text-muted-foreground space-y-0.5 font-mono">
          <p>Vanguard S&amp;P 500 baseline: {(VANGUARD_BASELINE * 100).toFixed(1)}% / yr</p>
          <p>Client premium: +{(CLIENT_PREMIUM * 100).toFixed(0)}% → Client annual rate: {(CLIENT_ANNUAL_RATE * 100).toFixed(1)}% / yr</p>
          <p>Client monthly rate: {(CLIENT_MONTHLY_RATE * 100).toFixed(2)}% → Owner net = gross − Σ(client_balance × monthly_rate)</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-bold">Monthly Profit Distribution</p>
        <div>
          <label className="text-xs text-muted-foreground">Gross Trading Profit This Period (USD)</label>
          <input type="number" value={gross} onChange={e => setGross(e.target.value)} placeholder="0.00"
            className="w-full mt-1 text-sm bg-input border border-border rounded-lg px-3 py-2 font-mono outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="rounded-lg bg-secondary/40 p-2"><p className="text-[9px] text-muted-foreground uppercase">Gross Profit</p><p className="text-sm font-mono font-bold">${grossNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
          <div className="rounded-lg bg-secondary/40 p-2"><p className="text-[9px] text-muted-foreground uppercase">Client Accounts</p><p className="text-sm font-mono font-bold">{accounts.length}</p></div>
          <div className="rounded-lg bg-secondary/40 p-2"><p className="text-[9px] text-muted-foreground uppercase">Total Balances</p><p className="text-sm font-mono font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
          <div className="rounded-lg bg-secondary/40 p-2"><p className="text-[9px] text-muted-foreground uppercase">Client Returns (1.05%)</p><p className="text-sm font-mono font-bold text-yellow-400">${clientReturns.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
          <div className="rounded-lg bg-accent/10 border border-accent/30 p-2"><p className="text-[9px] text-muted-foreground uppercase">Operator Take</p><p className="text-sm font-mono font-bold text-accent">${operatorTake.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
          <div className="rounded-lg bg-secondary/40 p-2"><p className="text-[9px] text-muted-foreground uppercase">Operator %</p><p className="text-sm font-mono font-bold">{operatorPct.toFixed(1)}%</p></div>
        </div>
        <Button className="w-full" onClick={processSplit} disabled={processing || accounts.length === 0}>
          {processing ? 'Processing...' : `Process Monthly Split → (${accounts.length} accounts)`}
        </Button>
      </div>

      <div>
        <p className="text-sm font-bold mb-2">Split History</p>
        <p className="text-[10px] text-muted-foreground mb-2">Note: Clients see only "Amount Returned" — all other columns are admin-only.</p>
        {isLoading ? <Skeleton className="h-32 rounded-xl" /> : splits.length === 0 ? (
          <div className="rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">No splits processed yet</div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-xs min-w-[640px]">
              <thead className="sticky top-0 bg-secondary/90">
                <tr className="border-b border-border">
                  {['Period', 'Gross Profit', 'Client Returns', 'Operator Take', 'Accounts', 'Status'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {splits.map(s => (
                  <tr key={s.id} className="border-b border-border/40 hover:bg-secondary/20">
                    <td className="px-3 py-2 font-mono">{s.period || '—'}</td>
                    <td className="px-3 py-2 font-mono">${(s.gross_profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 font-mono text-yellow-400">${(s.client_return || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 font-mono text-accent font-bold">${(s.operator_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 font-mono">{s.account_id ? 1 : 0}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{s.status || 'processed'}</Badge></td>
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