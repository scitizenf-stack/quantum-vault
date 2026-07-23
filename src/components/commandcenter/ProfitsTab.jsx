import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { elephone } from '@/lib/elephoneClient';
import { Download } from 'lucide-react';

const MONTHLY_RATE = 0.0105;
const YEARLY_RATE = 0.126;
const fmt = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

function Card({ label, value, gold }) {
  return (
    <div className={`rounded-xl border p-4 ${gold ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-border bg-card'}`}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-mono font-bold ${gold ? 'text-yellow-400' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}

export default function ProfitsTab() {
  const { data: accounts = [] } = useQuery({ queryKey: ['elephone-accounts'], queryFn: () => elephone.list('TradingAccount'), refetchInterval: 60000 });
  const { data: trades = [] } = useQuery({ queryKey: ['hft-trades'], queryFn: () => base44.entities.Trade.list('-created_date', 500) });

  const grossProfit = trades.filter(t => (t.pnl || 0) > 0).reduce((s, t) => s + t.pnl, 0);
  const grossAUM = accounts.reduce((s, a) => s + (a.balance_usd || 0), 0);
  const obligations = accounts.reduce((s, a) => s + (a.balance_usd || 0) * MONTHLY_RATE, 0);
  const netProfit = grossProfit - obligations;

  const rows = useMemo(() => accounts.map(a => {
    const aum = a.balance_usd || 0;
    const owed = aum * MONTHLY_RATE;
    const share = grossAUM > 0 ? aum / grossAUM : 0;
    const kept = grossProfit * share - owed;
    return { name: a.account_number || a.id?.slice(-8), aum, retPct: YEARLY_RATE * 100, owed, kept };
  }), [accounts, grossAUM, grossProfit]);

  const exportCSV = () => {
    const header = ['Client', 'AUM', 'Client Return %', 'Client $ Owed', 'Your $ Kept'];
    const lines = [header.join(','), ...rows.map(r => [r.name, r.aum.toFixed(2), r.retPct.toFixed(2), r.owed.toFixed(2), r.kept.toFixed(2)].join(','))];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'profits.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted-foreground font-mono">Client return = Vanguard rate (10.5%) + 20% premium = 12.6%/yr · 1.05%/month</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card label="Gross AUM" value={fmt(grossAUM)} />
        <Card label="Total Client Obligations" value={fmt(obligations)} />
        <Card label="YOUR NET PROFIT" value={fmt(netProfit)} gold />
      </div>

      <div className="flex justify-end">
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-semibold hover:bg-secondary"><Download className="w-3.5 h-3.5" /> Export CSV</button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-xs min-w-[640px]">
          <thead className="bg-secondary/40"><tr className="border-b border-border">{['Client', 'AUM', 'Client Return %', 'Client $ Owed', 'Your $ Kept'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No client accounts</td></tr>
            ) : rows.map((r, i) => (
              <tr key={i} className="border-b border-border/40">
                <td className="px-3 py-2 font-mono font-semibold">{r.name}</td>
                <td className="px-3 py-2 font-mono">{fmt(r.aum)}</td>
                <td className="px-3 py-2 font-mono text-accent">{r.retPct.toFixed(2)}%</td>
                <td className="px-3 py-2 font-mono text-yellow-400">{fmt(r.owed)}</td>
                <td className={`px-3 py-2 font-mono ${r.kept >= 0 ? 'text-accent' : 'text-destructive'}`}>{fmt(r.kept)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProfitSplits />
    </div>
  );
}

function ProfitSplits() {
  const { data: splits = [] } = useQuery({ queryKey: ['profit-splits'], queryFn: () => base44.entities.ProfitSplit.list('-period_end', 500) });
  const fmtP = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  const periods = useMemo(() => {
    const map = {};
    splits.forEach(s => {
      const key = s.period_end || s.period_start || '—';
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return Object.entries(map).sort((a, b) => (b[0] || '').localeCompare(a[0] || ''));
  }, [splits]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="text-sm font-bold">Profit Splits <span className="text-[10px] text-muted-foreground font-normal">· grouped by period</span></h3>
      {periods.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">No profit splits recorded</p>
      ) : periods.map(([period, items]) => {
        const totalGross = items.reduce((s, x) => s + (x.gross_profit || 0), 0);
        const totalUser = items.reduce((s, x) => s + (x.user_share || 0), 0);
        const totalPlatform = items.reduce((s, x) => s + (x.platform_share || 0), 0);
        return (
          <div key={period} className="rounded-lg border border-border/60 overflow-hidden">
            <div className="flex items-center justify-between bg-secondary/40 px-3 py-2">
              <span className="text-xs font-mono font-semibold">{period}</span>
              <div className="flex gap-4 text-[10px] font-mono">
                <span className="text-muted-foreground">Gross {fmtP(totalGross)}</span>
                <span className="text-yellow-400">User {fmtP(totalUser)}</span>
                <span className="text-accent">Platform {fmtP(totalPlatform)}</span>
              </div>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="text-[10px] text-muted-foreground">{['User', 'Source', 'Split %', 'Gross', 'User Share', 'Platform Share', 'Status'].map(h => <th key={h} className="text-left px-3 py-1.5">{h}</th>)}</tr></thead>
              <tbody>
                {items.map(s => (
                  <tr key={s.id} className="border-t border-border/30">
                    <td className="px-3 py-1.5 font-mono text-[10px]">{s.user_id?.slice(-8) || '—'}</td>
                    <td className="px-3 py-1.5">{s.source || '—'}</td>
                    <td className="px-3 py-1.5 font-mono">{s.split_percentage || 0}%</td>
                    <td className="px-3 py-1.5 font-mono">{fmtP(s.gross_profit)}</td>
                    <td className="px-3 py-1.5 font-mono text-yellow-400">{fmtP(s.user_share)}</td>
                    <td className="px-3 py-1.5 font-mono text-accent">{fmtP(s.platform_share)}</td>
                    <td className="px-3 py-1.5"><span className="text-[10px] font-semibold uppercase">{s.status || '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}