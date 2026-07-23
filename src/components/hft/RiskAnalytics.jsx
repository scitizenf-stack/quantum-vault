import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const DONUT_COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'];

export default function RiskAnalytics({ strategies, onKillStrategy }) {
  const qc = useQueryClient();
  const { data: rules = [], isLoading: rLoading } = useQuery({
    queryKey: ['risk-controls'],
    queryFn: () => base44.entities.RiskControl.list(),
    refetchInterval: 30000,
  });
  const { data: assets = [] } = useQuery({
    queryKey: ['hft-assets'],
    queryFn: () => base44.entities.Asset.list(),
  });
  const { data: hftStrats = [] } = useQuery({
    queryKey: ['hftstrategy'],
    queryFn: () => base44.entities.HFTStrategy.list(),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, active }) => base44.entities.RiskControl.update(id, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risk-controls'] }),
  });

  const allocation = assets.map(a => ({ name: a.symbol, value: (a.quantity || 0) * (a.current_price || 0) })).filter(a => a.value > 0);
  const totalValue = allocation.reduce((s, a) => s + a.value, 0);
  const avgSharpe = hftStrats.length ? hftStrats.reduce((s, st) => s + (st.sharpe || 0), 0) / hftStrats.length : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold mb-2">Risk Controls</p>
        {rLoading ? <Skeleton className="h-24 rounded-xl" /> : (
          <div className="space-y-1.5">
            {rules.map(r => (
              <div key={r.id} className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2">
                <Shield className={`w-3.5 h-3.5 flex-shrink-0 ${r.active ? 'text-accent' : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{r.name}</p>
                  <p className="text-[9px] text-muted-foreground">{r.type} · threshold {r.threshold} · triggered {r.triggeredCount || 0}x</p>
                </div>
                <Badge variant={r.action === 'stop' ? 'destructive' : r.action === 'pause' ? 'secondary' : 'outline'} className="text-[9px]">{r.action}</Badge>
                <button onClick={() => toggleMut.mutate({ id: r.id, active: !r.active })} className={`relative w-8 h-4 rounded-full transition-colors flex-shrink-0 ${r.active ? 'bg-accent' : 'bg-secondary'}`}>
                  <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${r.active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
            {rules.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No risk rules</p>}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-bold mb-2">Kill Switch (per strategy)</p>
        <div className="space-y-1.5">
          {strategies.filter(s => s.status === 'ACTIVE').map(s => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-card border border-border px-3 py-2">
              <p className="text-xs font-mono truncate">{s.name}</p>
              <Button size="sm" variant="destructive" className="h-6 text-[10px] px-2" onClick={() => onKillStrategy(s)}>STOP</Button>
            </div>
          ))}
          {strategies.filter(s => s.status === 'ACTIVE').length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No active strategies</p>}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold mb-2">Portfolio Allocation</p>
        {allocation.length === 0 ? <Skeleton className="h-40 rounded-xl" /> : (
          <div className="rounded-xl bg-card border border-border p-3">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2}>
                  {allocation.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [`$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Value']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {allocation.map((a, i) => (
                <div key={a.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  <span className="text-[10px] font-mono">{a.name} {((a.value / totalValue) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-card border border-border p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Sharpe Ratio</p>
          <p className="text-lg font-mono font-bold">{avgSharpe != null ? avgSharpe.toFixed(2) : '—'}</p>
        </div>
        <Zap className="w-5 h-5 text-primary" />
      </div>
    </div>
  );
}