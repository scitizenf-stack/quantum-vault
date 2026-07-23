import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Rewards() {
  const { canView } = useRBAC();
  const { data: stakes = [], isLoading } = useQuery({
    queryKey: ['staking'],
    queryFn: () => base44.entities.StakingPosition.list(),
    refetchInterval: 30000,
  });

  if (!canView('yield')) return <AccessDenied section="Rewards" />;

  const totalRewards = stakes.reduce((s, p) => s + (p.rewards_earned || 0), 0);

  // Group by protocol for chart
  const byProtocol = stakes.reduce((acc, s) => {
    acc[s.protocol] = (acc[s.protocol] || 0) + (s.rewards_earned || 0);
    return acc;
  }, {});
  const chartData = Object.entries(byProtocol).map(([name, value]) => ({ name, value: +value.toFixed(4) }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Rewards</h1>
        <p className="text-xs text-muted-foreground mt-1">Staking rewards and earnings</p>
      </div>

      {isLoading ? <Skeleton className="h-24 rounded-2xl" /> : (
        <div className="bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/30 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-5 h-5 text-accent" />
              <p className="text-sm font-semibold text-muted-foreground">Total Rewards Earned</p>
            </div>
            <p className="text-4xl font-bold">{totalRewards.toFixed(6)}</p>
            <p className="text-xs text-muted-foreground mt-1">Across {stakes.length} positions</p>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Rewards by Protocol</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold mb-3">Staking Positions</p>
        {isLoading ? <Skeleton className="h-32 rounded-xl" /> : stakes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No staking positions. Add positions in Staking tab.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {['Protocol', 'Asset', 'APY', 'Rewards Earned'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stakes.map(s => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="px-4 py-3 text-xs">{s.protocol}</td>
                    <td className="px-4 py-3 text-xs font-mono">{s.asset}</td>
                    <td className="px-4 py-3 text-xs font-bold text-accent">{s.apy}%</td>
                    <td className="px-4 py-3 text-xs font-mono text-accent">+{s.rewards_earned || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}