import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PERIODS = [
  { key: '30D', days: 30 },
  { key: '90D', days: 90 },
  { key: '1Y', days: 365 },
];

// Signed contribution of each transaction type to portfolio capital flow
const SIGNED = { buy: 1, transfer_in: 1, interest: 1, dividend: 1, sell: -1, transfer_out: -1 };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">${payload[0].value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
    </div>
  );
};

export default function PortfolioChart({ currentValue = 0 }) {
  const [period, setPeriod] = useState('30D');

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 500),
  });

  // Build a daily portfolio-value series ending at today's AUM (currentValue).
  // Walks backward: value(t) = currentValue - totalFlow + flowUpTo(t).
  // With no transactions this is a flat baseline at currentValue — never empty.
  const chartData = useMemo(() => {
    const days = PERIODS.find(p => p.key === period)?.days || 30;
    const totalFlow = transactions.reduce((s, t) => s + (SIGNED[t.type] || 0) * (t.total_amount || 0), 0);
    const points = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const flowUpToDate = transactions
        .filter(t => new Date(t.created_date) <= d)
        .reduce((s, t) => s + (SIGNED[t.type] || 0) * (t.total_amount || 0), 0);
      const value = Math.max(0, (currentValue || 0) - totalFlow + flowUpToDate);
      points.push({
        label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        value: Math.round(value),
      });
    }
    return points;
  }, [period, transactions, currentValue]);

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Portfolio Performance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Portfolio value over time · own transaction ledger</p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                period === p.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.key}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(215, 20%, 55%)' }} minTickGap={24} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(215, 20%, 55%)' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="value" stroke="hsl(38, 92%, 50%)" strokeWidth={2.5} fill="url(#colorValue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}