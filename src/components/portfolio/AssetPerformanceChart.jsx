import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { meshApi } from '@/lib/meshClient';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const PERIODS = ['1M', '3M', '6M', '1Y'];
const COLORS = ['hsl(217,91%,60%)', 'hsl(160,84%,39%)', 'hsl(280,65%,60%)', 'hsl(43,74%,66%)', 'hsl(0,72%,51%)'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2.5 shadow-xl text-xs space-y-1">
      <p className="text-muted-foreground font-medium mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.dataKey}</span>
          <span className="font-mono font-semibold ml-auto pl-4 text-foreground">${p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function AssetPerformanceChart() {
  const [period, setPeriod] = useState('6M');

  const { data, isLoading } = useQuery({
    queryKey: ['portfolio-performance', period],
    queryFn: () => meshApi.getPortfolio(),
    refetchInterval: 60000,
  });

  // API should return: { performance_history: [{date, [symbol]: value, ...}], symbols: [...] }
  const chartData = data?.performance_history || [];
  const symbols   = data?.symbols || (data?.assets || []).slice(0, 5).map(a => a.symbol).filter(Boolean);

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold">Asset Performance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Live price history · Omega Mesh</p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={cn(
              'px-2.5 py-1 text-xs font-medium rounded-md transition-all',
              period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}>{p}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
          No performance data from Mesh API
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215,28%,17%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215,20%,55%)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215,20%,55%)' }} tickLine={false} axisLine={false}
              tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} width={55} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
            {symbols.map((sym, i) => (
              <Line key={sym} type="monotone" dataKey={sym} stroke={COLORS[i % COLORS.length]}
                strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}