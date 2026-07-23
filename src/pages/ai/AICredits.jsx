import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Cpu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AICredits() {
  const { canAdmin } = useRBAC();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['ai-logs'],
    queryFn: () => base44.entities.AiLog.list('-created_date', 200),
    refetchInterval: 30000,
  });

  if (!canAdmin()) return <AccessDenied section="AI Credits" />;

  const now = new Date();
  const thisMonth = logs.filter(l => {
    const d = new Date(l.created_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalTokens = thisMonth.reduce((s, l) => s + (l.prompt_tokens || 0) + (l.completion_tokens || 0), 0);
  const totalCost = thisMonth.reduce((s, l) => s + (l.cost || 0), 0);

  // By model
  const byModel = thisMonth.reduce((acc, l) => {
    acc[l.model] = (acc[l.model] || 0) + (l.cost || 0);
    return acc;
  }, {});
  const chartData = Object.entries(byModel).map(([name, cost]) => ({ name, cost: +cost.toFixed(4) }));

  // Daily usage last 7 days
  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const dayLogs = logs.filter(l => {
      const ld = new Date(l.created_date);
      return ld.toDateString() === d.toDateString();
    });
    dailyData.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      tokens: dayLogs.reduce((s, l) => s + (l.prompt_tokens || 0) + (l.completion_tokens || 0), 0),
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">AI Credits</h1>
        <p className="text-xs text-muted-foreground mt-1">Usage-based LLM credit tracking</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tokens This Month', value: isLoading ? '—' : totalTokens.toLocaleString(), icon: Cpu, color: 'text-primary' },
          { label: 'Cost This Month', value: isLoading ? '—' : `$${totalCost.toFixed(4)}`, icon: Zap, color: 'text-chart-3' },
          { label: 'Total Requests', value: isLoading ? '—' : thisMonth.length, icon: Cpu, color: 'text-accent' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            {isLoading ? <Skeleton className="h-7 w-24" /> : <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>}
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Cost by Model (this month)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Bar dataKey="cost" fill="hsl(var(--chart-3))" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Daily Token Usage (Last 7 Days)</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
            <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {logs.length === 0 && !isLoading && (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">No AI activity logged yet. This populates once AI routing/fallback decisions are made.</p>
        </div>
      )}
    </div>
  );
}