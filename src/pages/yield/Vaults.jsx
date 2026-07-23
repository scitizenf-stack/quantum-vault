import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';

const riskColor = { low: 'border-accent/40 bg-accent/5', medium: 'border-primary/40 bg-primary/5', high: 'border-yellow-500/40 bg-yellow-500/5' };

export default function Vaults() {
  const { canView } = useRBAC();
  const { data: vaults = [], isLoading } = useQuery({
    queryKey: ['vaults'],
    queryFn: () => base44.entities.Vault.list(),
    refetchInterval: 30000,
  });

  if (!canView('yield')) return <AccessDenied section="Vaults" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Yield Vaults</h1>
        <p className="text-xs text-muted-foreground mt-1">Automated yield strategies</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
      ) : vaults.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-12 text-center">
          <TrendingUp className="w-8 h-8 text-muted-foreground opacity-40 mx-auto mb-3" />
          <p className="text-sm font-medium">No vault positions</p>
          <p className="text-xs text-muted-foreground mt-1">Connect a DeFi protocol to track vault deposits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vaults.map(v => (
            <div key={v.id} className={`border rounded-2xl p-5 flex flex-col gap-4 ${riskColor[v.risk] || 'border-border bg-card'}`}>
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold">{v.name}</p>
                <Badge variant="outline" className="text-[10px]">{v.risk}</Badge>
              </div>
              <div className="text-center py-2">
                <p className="text-4xl font-bold">{v.apy || 0}<span className="text-lg font-normal text-muted-foreground">%</span></p>
                <p className="text-xs text-muted-foreground mt-1">APY</p>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Protocol</span><span className="text-foreground">{v.protocol}</span></div>
                {v.tvl && <div className="flex justify-between"><span>TVL</span><span className="text-foreground">${(v.tvl || 0).toLocaleString()}</span></div>}
                {v.user_deposit && <div className="flex justify-between"><span>Your Deposit</span><span className="text-foreground">${(v.user_deposit || 0).toLocaleString()}</span></div>}
                {v.earned && <div className="flex justify-between"><span>Earned</span><span className="text-accent">+${(v.earned || 0).toFixed(2)}</span></div>}
              </div>
              <Button variant="outline" className="w-full mt-auto"><TrendingUp className="w-4 h-4 mr-2" />Deposit</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}