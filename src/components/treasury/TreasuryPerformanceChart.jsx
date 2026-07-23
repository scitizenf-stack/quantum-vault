import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { meshApi } from '@/lib/meshClient';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TreasuryPerformanceChart() {
  const { data: raw, isLoading } = useQuery({
    queryKey: ['analytics-portfolio'],
    queryFn: () => meshApi.getAnalyticsPortfolio(),
    refetchInterval: 60000,
  });

  const series = raw?.history || raw?.data || raw || [];

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Portfolio Performance
      </p>
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : series.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No performance data</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={40} />
            <Tooltip
              formatter={v => [`$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Value']}
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}