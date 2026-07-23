import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// Yield-generating asset types
const YIELD_TYPES = new Set(['bond', 'etf']);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2.5 shadow-xl text-xs space-y-1">
      <p className="text-muted-foreground font-medium mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-mono font-semibold ml-auto pl-4 text-foreground">
            ${p.value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function YieldBreakdownChart({ assets }) {
  // Build per-type data
  const typeMap = {};
  assets.forEach(a => {
    const key = a.type || 'other';
    if (!typeMap[key]) typeMap[key] = { type: key.toUpperCase(), yield: 0, nonYield: 0 };
    const value = (a.quantity || 0) * (a.current_price || 0);
    if (YIELD_TYPES.has(a.type)) {
      typeMap[key].yield += value;
    } else {
      typeMap[key].nonYield += value;
    }
  });

  const data = Object.values(typeMap).sort((a, b) => (b.yield + b.nonYield) - (a.yield + a.nonYield));

  // Summary totals
  const totalYield = assets
    .filter(a => YIELD_TYPES.has(a.type))
    .reduce((s, a) => s + (a.quantity || 0) * (a.current_price || 0), 0);
  const totalNonYield = assets
    .filter(a => !YIELD_TYPES.has(a.type))
    .reduce((s, a) => s + (a.quantity || 0) * (a.current_price || 0), 0);
  const total = totalYield + totalNonYield;
  const yieldPct = total > 0 ? ((totalYield / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold">Yield vs Non-Yield Breakdown</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Portfolio value by asset type</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Yield allocation</p>
          <p className="text-lg font-bold font-mono text-accent">{yieldPct}%</p>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 rounded-lg bg-accent/10 border border-accent/20 px-3 py-2.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Yield-Generating</p>
          <p className="text-sm font-bold font-mono text-accent mt-0.5">
            ${totalYield.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Bonds &amp; ETFs</p>
        </div>
        <div className="flex-1 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Non-Yielding</p>
          <p className="text-sm font-bold font-mono text-primary mt-0.5">
            ${totalNonYield.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Stocks, Crypto &amp; Commodities</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">No assets to display</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215,28%,17%)" vertical={false} />
            <XAxis
              dataKey="type"
              tick={{ fontSize: 10, fill: 'hsl(215,20%,55%)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(215,20%,55%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(215,28%,17%)', radius: 4 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="yield" name="Yield-Generating" fill="hsl(160,84%,39%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="nonYield" name="Non-Yielding" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}