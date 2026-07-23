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
import OmegaRiskControls from '@/components/hft/OmegaRiskControls';

const TYPES = ['position_limit', 'drawdown_limit', 'rate_limit', 'loss_limit', 'concentration'];
const ACTIONS = ['alert', 'pause', 'stop_all'];

export default function RiskControls() {
  const { canAdmin } = useRBAC();
  const qc = useQueryClient();
  const [killed, setKilled] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'position_limit', threshold: '', action: 'alert', active: true });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['risk-controls'],
    queryFn: () => base44.entities.RiskControl.list(),
    refetchInterval: 30000,
  });

  const createMut = useMutation({
    mutationFn: data => base44.entities.RiskControl.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['risk-controls'] }); setAdding(false); },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, active }) => base44.entities.RiskControl.update(id, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risk-controls'] }),
  });

  const deleteMut = useMutation({
    mutationFn: id => base44.entities.RiskControl.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risk-controls'] }),
  });

  const emergencyStop = useMutation({
    mutationFn: () => base44.entities.Strategy.list().then(strategies =>
      Promise.all(strategies.map(s => base44.entities.Strategy.update(s.id, { status: 'STOPPED' })))
    ).then(() => base44.entities.AccessLog.create({ action: 'EMERGENCY_STOP', status: 'success', device: 'Admin UI' })),
    onSuccess: () => { setKilled(true); toast.error('Emergency stop activated — all strategies halted'); },
  });

  if (!canAdmin()) return <AccessDenied section="HFT Risk Controls" />;

  return (
    <div className="space-y-5">
      {/* OMEGA Router Risk Controls */}
      <OmegaRiskControls />

      <div>
        <h1 className="text-2xl font-bold">Risk Controls</h1>
        <p className="text-xs text-muted-foreground mt-1">Global HFT risk parameters · FOUNDER + ADMIN only</p>
      </div>

      {/* Kill switch */}
      <div className={`rounded-2xl border p-5 ${killed ? 'bg-destructive/10 border-destructive' : 'bg-card border-border'}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-bold">Emergency Kill Switch</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {killed ? '⚠️ All strategies STOPPED — logged to AccessLog' : 'Immediately stops all Strategy records and logs the event'}
            </p>
          </div>
          <Button
            variant={killed ? 'secondary' : 'destructive'}
            onClick={() => killed ? setKilled(false) : emergencyStop.mutate()}
            disabled={emergencyStop.isPending}
            className={killed ? '' : 'shadow-lg shadow-destructive/30'}>
            {killed ? 'RESTART ENGINE' : '🛑 EMERGENCY STOP'}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Rule Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Max Daily Loss"
                className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Threshold</label>
              <input value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))} placeholder="e.g. $10,000 or 5%"
                className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Action</label>
              <select value={form.action} onChange={e => setForm(p => ({ ...p, action: e.target.value }))}
                className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none">
                {ACTIONS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createMut.mutate(form)}>Save Rule</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : rules.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
          No risk rules configured. Add rules to protect the HFT engine.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {rules.map((r, i) => (
            <div key={r.id} className={`flex items-center gap-3 px-4 py-3 ${i < rules.length - 1 ? 'border-b border-border/50' : ''} hover:bg-secondary/20`}>
              <Shield className={`w-4 h-4 flex-shrink-0 ${r.active ? 'text-accent' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{r.name}</p>
                <p className="text-[10px] text-muted-foreground">{r.type} · threshold: {r.threshold} · action: {r.action} · triggered {r.triggeredCount || 0}x</p>
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