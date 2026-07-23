import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { toast } from 'sonner';

export default function RiskControlsAdmin() {
  const { canAdmin } = useRBAC();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'position_limit', threshold: '', action: 'alert', active: true });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['risk-controls'],
    queryFn: () => base44.entities.RiskControl.list(),
    refetchInterval: 30000,
  });

  const createMut = useMutation({
    mutationFn: data => base44.entities.RiskControl.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['risk-controls'] }); setAdding(false); toast.success('Risk rule added'); },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, active }) => base44.entities.RiskControl.update(id, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risk-controls'] }),
  });

  const deleteMut = useMutation({
    mutationFn: id => base44.entities.RiskControl.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['risk-controls'] }); toast.success('Rule deleted'); },
  });

  const emergencyShutdown = useMutation({
    mutationFn: () => Promise.all([
      base44.entities.Strategy.list().then(s => Promise.all(s.map(st => base44.entities.Strategy.update(st.id, { status: 'STOPPED' })))),
      base44.entities.AccessLog.create({ action: 'GLOBAL_EMERGENCY_SHUTDOWN', status: 'success', device: 'Admin Panel' }),
    ]),
    onSuccess: () => toast.error('Global emergency shutdown activated — all strategies stopped and logged'),
  });

  if (!canAdmin()) return <AccessDenied section="Risk Controls" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Risk Controls</h1>
        <p className="text-xs text-muted-foreground mt-1">Global risk rules · ADMIN + FOUNDER only</p>
      </div>

      {/* Emergency Shutdown */}
      <div className="bg-card border border-destructive/30 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-bold text-destructive">Global Emergency Shutdown</p>
            <p className="text-xs text-muted-foreground mt-0.5">Stops all strategies and logs the event to AccessLog</p>
          </div>
          <Button variant="destructive" onClick={() => emergencyShutdown.mutate()} disabled={emergencyShutdown.isPending} className="shadow-lg shadow-destructive/30">
            🛑 EMERGENCY SHUTDOWN
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{rules.length} Risk Rules</p>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setAdding(a => !a)}>
          <Plus className="w-3.5 h-3.5" /> Add Rule
        </Button>
      </div>

      {adding && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold">New Rule</p>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Name', key: 'name' }, { label: 'Threshold', key: 'threshold' }].map(f => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground">{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none" />
              </div>
            ))}
            {[
              { label: 'Type', key: 'type', opts: ['position_limit', 'drawdown_limit', 'rate_limit', 'loss_limit', 'concentration'] },
              { label: 'Action', key: 'action', opts: ['alert', 'pause', 'stop_all'] },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground">{f.label}</label>
                <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none">
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createMut.mutate(form)}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : rules.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
          No risk rules configured.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {rules.map((r, i) => (
            <div key={r.id} className={`flex items-center gap-3 px-4 py-3 ${i < rules.length - 1 ? 'border-b border-border/50' : ''} hover:bg-secondary/20`}>
              <Shield className={`w-4 h-4 flex-shrink-0 ${r.active ? 'text-accent' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{r.name}</p>
                <p className="text-[10px] text-muted-foreground">{r.type} · {r.threshold} · triggered {r.triggeredCount || 0}x</p>
              </div>
              <Badge variant={r.action === 'stop_all' ? 'destructive' : r.action === 'pause' ? 'secondary' : 'outline'} className="text-[10px]">{r.action}</Badge>
              <button onClick={() => toggleMut.mutate({ id: r.id, active: !r.active })}
                className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${r.active ? 'bg-accent' : 'bg-secondary'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${r.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <button onClick={() => deleteMut.mutate(r.id)} className="p-1 hover:bg-destructive/10 rounded flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}