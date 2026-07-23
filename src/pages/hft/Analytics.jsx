import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function gen30DayPnl() {
  let running = 0;
  return Array.from({ length: 30 }, (_, i) => { running += (Math.random() - 0.35) * 800; return { day: i + 1, pnl: +running.toFixed(2) }; });
}

export default function HFTAnalytics() {
  const { canView } = useRBAC();
  const { data: trades = [] } = useQuery({
    queryKey: ['hft-trades'],
    queryFn: () => base44.entities.Trade.list('-created_date', 200),
  });
  const { data: strategies = [] } = useQuery({
    queryKey: ['hft-strategies'],
    queryFn: () => base44.entities.Strategy.list(),
  });

  const pnl30 = useMemo(() => gen30DayPnl(), []);
  const heatmap = useMemo(() => Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))), []);
  const stratData = strategies.map(s => ({ name: s.name.split(' ')[0], pnl: s.pnl || 0, winRate: s.winRate || 0 }));
  const drawdown = useMemo(() => {
    let peak = 0;
    return pnl30.map(p => { peak = Math.max(peak, p.pnl); return { day: p.day, dd: +(p.pnl - peak).toFixed(2) }; });
  }, [pnl30]);
  const sharpeTrend = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ day: i + 1, sharpe: +(1.5 + Math.sin(i / 3) * 0.4 + Math.random() * 0.2).toFixed(2) })), []);
  const totalFees = trades.reduce((s, t) => s + (t.fee || 0), 0);
  const bestPair = useMemo(() => {
    const byPair = {};
    trades.forEach(t => { byPair[t.pair] = (byPair[t.pair] || 0) + (t.pnl || 0); });
    return Object.entries(byPair).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  }, [trades]);

  if (!canView('hft')) return <AccessDenied section="Analytics" />;

  const heatColor = (v) => `rgba(59,130,246,${0.1 + (v / 100) * 0.9})`;
  const tooltipStyle = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-xs text-muted-foreground">30-day performance · paper trading</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card border border-border p-3"><p className="text-[10px] text-muted-foreground uppercase">Total Fees</p><p className="text-lg font-mono font-bold text-yellow-400">${totalFees.toFixed(2)}</p></div>
        <div className="rounded-xl bg-card border border-border p-3"><p className="text-[10px] text-muted-foreground uppercase">Best Pair (week)</p><p className="text-lg font-mono font-bold text-accent">{bestPair}</p></div>
        <div className="rounded-xl bg-card border border-border p-3"><p className="text-[10px] text-muted-foreground uppercase">Total Trades</p><p className="text-lg font-mono font-bold">{trades.length}</p></div>
        <div className="rounded-xl bg-card border border-border p-3"><p className="text-[10px] text-muted-foreground uppercase">Strategies</p><p className="text-lg font-mono font-bold">{strategies.length}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-sm font-bold mb-3">30-Day Cumulative P&L</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pnl30}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-sm font-bold mb-3">Strategy P&L Comparison</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stratData}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {stratData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-sm font-bold mb-3">Win Rate Gauge</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart innerRadius="30%" outerRadius="100%" data={stratData} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="winRate" cornerRadius={6} background />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, 'Win Rate']} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-sm font-bold mb-3">Drawdown Curve</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={drawdown}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="dd" stroke="#ef4444" fill="#ef444433" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <p className="text-sm font-bold mb-3">Sharpe Ratio Trend</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={sharpeTrend}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="sharpe" stroke="#a855f7" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <p className="text-sm font-bold mb-3">Trade Volume Heatmap (24h × 7d)</p>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-0.5">
              <div />
              {Array.from({ length: 24 }, (_, h) => <div key={h} className="text-[8px] text-center text-muted-foreground">{h}</div>)}
              {heatmap.map((row, d) => (
                <React.Fragment key={d}>
                  <div className="text-[9px] text-muted-foreground flex items-center">{DAYS[d]}</div>
                  {row.map((v, h) => <div key={h} className="aspect-square rounded-sm" style={{ background: heatColor(v) }} title={`${DAYS[d]} ${h}:00 — ${v}`} />)}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}