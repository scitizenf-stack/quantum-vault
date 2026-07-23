import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Lock, Gift, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Yield() {
  const { canView, refetch: rbacRefetch } = useRBAC();

  const { data: stakes = [], isLoading, refetch } = useQuery({
    queryKey: ['staking'],
    queryFn: () => base44.entities.StakingPosition.list(),
    refetchInterval: 30000,
  });

  const { data: vaults = [] } = useQuery({
    queryKey: ['vaults'],
    queryFn: () => base44.entities.Vault.list(),
    refetchInterval: 30000,
  });

  if (!canView('yield')) return <AccessDenied section="Yield" />;

  const totalStaked = stakes.reduce((s, p) => s + (p.amount || 0), 0);
  const totalRewards = stakes.reduce((s, p) => s + (p.rewards_earned || 0), 0);
  const avgApy = stakes.length > 0
    ? (stakes.reduce((s, p) => s + (p.apy || 0), 0) / stakes.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Yield</h1>
          <p className="text-sm text-muted-foreground mt-1">Staking, vaults, and reward accumulation</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Staked Value', value: isLoading ? '—' : totalStaked.toLocaleString(), icon: Lock, suffix: '' },
          { label: 'Weighted Avg APY', value: isLoading ? '—' : `${avgApy}%`, icon: TrendingUp },
          { label: 'Total Rewards Earned', value: isLoading ? '—' : totalRewards.toFixed(6), icon: Gift },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-accent" />
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            {isLoading ? <Skeleton className="h-7 w-24" /> : <p className="text-2xl font-bold font-mono text-accent">{s.value}</p>}
          </div>
        ))}
      </div>

      {stakes.length === 0 && !isLoading && (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-10 text-center">
          <p className="text-sm font-medium">No active yield positions</p>
          <p className="text-xs text-muted-foreground mt-1">Add staking positions in the Staking tab to track returns.</p>
        </div>
      )}

      {stakes.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3">Active Positions</h2>
          <div className="space-y-2">
            {stakes.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold font-mono text-accent">{s.asset?.slice(0,3)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.protocol}</p>
                  <p className="text-xs text-muted-foreground">{s.amount?.toLocaleString()} {s.asset} staked</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-semibold text-accent">{s.apy}% APY</p>
                  <p className="text-[10px] text-muted-foreground">+{s.rewards_earned || 0} earned</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}