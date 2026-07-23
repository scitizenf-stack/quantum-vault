import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Flag } from 'lucide-react';

export default function FeatureFlags() {
  const { canView, user } = useRBAC();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '', environment: 'production', enabled: false });
  const [adding, setAdding] = useState(false);

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => base44.entities.FeatureFlag.list(),
    refetchInterval: 30000,
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, enabled }) => base44.entities.FeatureFlag.update(id, { enabled, updatedAt: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries(['feature-flags']),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.FeatureFlag.create({ ...data, updatedAt: new Date().toISOString() }),
    onSuccess: () => { qc.invalidateQueries(['feature-flags']); setAdding(false); setForm({ name: '', description: '', environment: 'production', enabled: false }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.FeatureFlag.delete(id),
    onSuccess: () => qc.invalidateQueries(['feature-flags']),
  });

  const isFounderAdmin = user?.role === 'admin' || user?.role === 'founder';
  if (!canView('platform')) return <AccessDenied section="Platform" />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground text-sm">Control feature rollouts per environment</p>
        </div>
        {isFounderAdmin && (
          <Button size="sm" onClick={() => setAdding(!adding)}>
            <Plus className="w-4 h-4 mr-1" /> New Flag
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <input className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" placeholder="Flag name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <input className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <select className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" value={form.environment} onChange={e => setForm(p => ({ ...p, environment: e.target.value }))}>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createMut.mutate(form)} disabled={!form.name || createMut.isPending}>Create</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />) :
          flags.length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-8 text-center">
              <Flag className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">No feature flags yet. Create one above.</p>
            </div>
          ) : flags.map(flag => (
            <div key={flag.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <Switch checked={flag.enabled} onCheckedChange={v => isFounderAdmin && toggleMut.mutate({ id: flag.id, enabled: v })} disabled={!isFounderAdmin} />
                <div>
                  <p className="text-sm font-medium">{flag.name}</p>
                  <p className="text-xs text-muted-foreground">{flag.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{flag.environment}</Badge>
                {isFounderAdmin && (
                  <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => deleteMut.mutate(flag.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}