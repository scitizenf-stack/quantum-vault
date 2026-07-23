import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Plus, Trash2 } from 'lucide-react';

export default function Staking() {
  const { canView, canAdmin } = useRBAC();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ protocol: '', asset: '', amount: '', apy: '', started_at: '' });

  const { data: stakes = [], isLoading } = useQuery({
    queryKey: ['staking'],
    queryFn: () => base44.entities.StakingPosition.list(),
    refetchInterval: 30000,
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.StakingPosition.create({
      ...data, amount: parseFloat(data.amount), apy: parseFloat(data.apy),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staking'] }); setAdding(false); setForm({ protocol: '', asset: '', amount: '', apy: '', started_at: '' }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.StakingPosition.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staking'] }),
  });

  if (!canView('yield')) return <AccessDenied section="Staking" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Staking</h1>
          <p className="text-xs text-muted-foreground mt-1">{stakes.length} active positions</p>
        </div>
        {canAdmin() && (
          <Button size="sm" onClick={() => setAdding(a => !a)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Position
          </Button>
        )}
      </div>

      {adding && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold">New Staking Position</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[['protocol', 'Protocol (e.g. Marinade)'], ['asset', 'Asset (SOL, ETH)'], ['amount', 'Amount'], ['apy', 'APY %'], ['started_at', 'Start Date']].map(([k, pl]) => (
              <input key={k} type={k === 'started_at' ? 'date' : k === 'amount' || k === 'apy' ? 'number' : 'text'}
                placeholder={pl} value={form[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => form.protocol && form.asset && form.amount && createMut.mutate(form)}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : stakes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-10 text-center">
          <p className="text-sm font-medium">No staking positions</p>
          <p className="text-xs text-muted-foreground mt-1">Add a position to start tracking staking rewards.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Protocol', 'Asset', 'Amount', 'APY', 'Rewards Earned', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stakes.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs font-medium">{s.protocol}</td>
                  <td className="px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{(s.asset || '?')[0]}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{(s.amount || 0).toLocaleString()} {s.asset}</td>
                  <td className="px-4 py-3 text-xs font-bold text-accent">{s.apy}%</td>
                  <td className="px-4 py-3 text-xs font-mono text-accent">+{s.rewards_earned || 0} {s.asset}</td>
                  <td className="px-4 py-3"><Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{s.status}</Badge></td>
                  <td className="px-4 py-3">
                    {canAdmin() && (
                      <button onClick={() => deleteMut.mutate(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}