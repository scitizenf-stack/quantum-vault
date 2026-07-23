import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  SOL:  'hsl(38, 92%, 50%)',
  PAXG: 'hsl(43, 74%, 66%)',
  BTC:  'hsl(217, 91%, 60%)',
  XRP:  'hsl(160, 84%, 39%)',
};
const ORDER = ['SOL', 'PAXG', 'BTC', 'XRP'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-2.5 shadow-xl">
        <p className="text-xs font-medium text-foreground">{payload[0].name}</p>
        <p className="text-xs text-muted-foreground">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function AllocationDonut({ assets = [] }) {
  const bySymbol = Object.fromEntries(assets.map(a => [a.symbol, a]));
  const data = ORDER.map(sym => {
    const a = bySymbol[sym];
    const value = a ? Math.round((a.quantity || 0) * (a.current_price || 0)) : 0;
    return { name: sym, value };
  });
  const total = data.reduce((s, d) => s + d.value, 0);
  const allZero = total === 0;

  // Placeholder: four equal slices so the donut never looks broken
  const display = allZero ? ORDER.map(sym => ({ name: sym, value: 1 })) : data;

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Asset Allocation</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={display}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {display.map((d) => (
                <Cell key={d.name} fill={COLORS[d.name] || 'hsl(215, 28%, 17%)'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {ORDER.map((sym) => {
            const item = data.find(d => d.name === sym);
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
            return (
              <div key={sym} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[sym] }} />
                  <span className="text-muted-foreground">{sym}</span>
                </div>
                <span className="font-mono font-medium">{allZero ? '—' : `${pct}%`}</span>
              </div>
            );
          })}
          {allZero && <p className="text-[10px] text-muted-foreground pt-1">No holdings yet · placeholder allocation</p>}
        </div>
      </div>
    </div>
  );
}