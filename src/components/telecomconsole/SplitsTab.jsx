import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const SOURCE_CLASS = { trading: 'text-accent', telecom: 'text-blue-400', staking: 'text-yellow-400', referral: 'text-purple-400' };

export default function SplitsTab() {
  const { data: splits = [], isLoading } = useQuery({ queryKey: ['profit-splits'], queryFn: () => base44.entities.ProfitSplit.list('-period_end', 500) });

  const totalGross = splits.reduce((s, x) => s + (x.gross_profit || 0), 0);
  const totalUser = splits.reduce((s, x) => s + (x.user_share || 0), 0);
  const totalPlatform = splits.reduce((s, x) => s + (x.platform_share || 0), 0);

  const byUser = useMemo(() => {
    const map = {};
    splits.forEach(s => {
      if (!s.user_id) return;
      if (!map[s.user_id]) map[s.user_id] = { user_id: s.user_id, gross: 0, user_share: 0, platform_share: 0, count: 0 };
      map[s.user_id].gross += s.gross_profit || 0;
      map[s.user_id].user_share += s.user_share || 0;
      map[s.user_id].platform_share += s.platform_share || 0;
      map[s.user_id].count++;
    });
    return Object.values(map).sort((a, b) => b.gross - a.gross);
  }, [splits]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[['Total Gross', fmt(totalGross), ''], ['User Share', fmt(totalUser), 'text-yellow-400'], ['Platform Share', fmt(totalPlatform), 'text-accent']].map(([l, v, c]) => (
          <div key={l} className="rounded-xl bg-card border border-border p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{l}</p>
            <p className={`text-xl font-mono font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        {isLoading ? <div className="p-8 text-center text-xs text-muted-foreground">Loading…</div> : splits.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No portfolio splits</div>
        ) : (
          <table className="w-full text-xs min-w-[820px]">
            <thead className="bg-secondary/40"><tr className="border-b border-border">
              {['User', 'Period', 'Source', 'Split %', 'Gross Profit', 'User Share', 'Platform Share', 'Allocation'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {splits.map(s => {
                const allocPct = s.gross_profit > 0 ? ((s.user_share || 0) / s.gross_profit) * 100 : 0;
                return (
                  <tr key={s.id} className="border-b border-border/40 hover:bg-secondary/20">
                    <td className="px-3 py-2 font-mono text-[10px]">{s.user_id?.slice(-8) || '—'}</td>
                    <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{s.period_start ? new Date(s.period_start).toLocaleDateString() : '—'} → {s.period_end ? new Date(s.period_end).toLocaleDateString() : '—'}</td>
                    <td className={`px-3 py-2 font-semibold ${SOURCE_CLASS[s.source] || ''}`}>{s.source || '—'}</td>
                    <td className="px-3 py-2 font-mono">{s.split_percentage || 0}%</td>
                    <td className="px-3 py-2 font-mono">{fmt(s.gross_profit)}</td>
                    <td className="px-3 py-2 font-mono text-yellow-400">{fmt(s.user_share)}</td>
                    <td className="px-3 py-2 font-mono text-accent">{fmt(s.platform_share)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(allocPct, 100)}%` }} />
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">{allocPct.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}