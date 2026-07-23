import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import OmegaStrategyCard from '@/components/hft/OmegaStrategyCard';

const STATUS_COLORS = { ACTIVE: 'default', PAUSED: 'secondary', STOPPED: 'destructive' };
const TYPES = ['Arbitrage', 'Market Making', 'Momentum', 'Stat Arb', 'Trend Follow', 'Grid'];

function StrategyForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', type: 'Arbitrage', status: 'PAUSED', targetPair: 'BTC/USDT', riskLimit: 1000, maxPosition: 10000 });
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <p className="text-sm font-semibold">{initial ? 'Edit Strategy' : 'New Strategy'}</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Name', key: 'name', type: 'text' },
          { label: 'Pair', key: 'targetPair', type: 'text' },
          { label: 'Risk Limit ($)', key: 'riskLimit', type: 'number' },
          { label: 'Max Position ($)', key: 'maxPosition', type: 'number' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs text-muted-foreground">{f.label}</label>
            <input type={f.type} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))}
              className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-ring" />
          </div>
        ))}
        <div>
          <label className="text-xs text-muted-foreground">Type</label>
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
            className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none">
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Status</label>
          <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
            className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none">
            {['ACTIVE','PAUSED','STOPPED'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(form)}>Save</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default function HFTStrategies() {
  const { canAdmin } = useRBAC();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list(),
    refetchInterval: 30000,
  });

  const createMut = useMutation({
    mutationFn: data => base44.entities.Strategy.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['strategies'] }); setAdding(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Strategy.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['strategies'] }); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: id => base44.entities.Strategy.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['strategies'] }),
  });

  if (!canAdmin()) return <AccessDenied section="HFT Strategies" />;

  return (
    <div className="space-y-5">
      {/* OMEGA Router card */}
      <OmegaStrategyCard />

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-2.5 text-xs text-yellow-300 font-semibold">
        ⚠ Paper trading only — strategy records below are simulated
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Strategies</h1>
          <p className="text-xs text-muted-foreground mt-1">{strategies.length} configured · {strategies.filter(s=>s.status==='ACTIVE').length} active</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setAdding(true)}><Plus className="w-4 h-4" />New Strategy</Button>
      </div>

      {adding && <StrategyForm onSave={data => createMut.mutate(data)} onCancel={() => setAdding(false)} />}
      {editing && <StrategyForm initial={editing} onSave={data => updateMut.mutate({ id: editing.id, data })} onCancel={() => setEditing(null)} />}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : strategies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-12 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm font-semibold">No strategies configured</p>
          <p className="text-xs text-muted-foreground">Add a strategy to get started with paper trading</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Name','Type','Pair','P&L','Trades','Win Rate','Status',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {strategies.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs font-mono font-bold">{s.name}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{s.type}</Badge></td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{s.targetPair || '—'}</td>
                  <td className={`px-4 py-3 text-xs font-mono font-bold ${(s.pnl ?? 0) >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {s.pnl != null ? `${s.pnl >= 0 ? '+' : ''}$${s.pnl.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{s.trades?.toLocaleString() ?? '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono">{s.winRate != null ? `${s.winRate}%` : '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_COLORS[s.status] || 'secondary'} className="text-[10px]">{s.status || 'PAUSED'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(s)} className="p-1 hover:bg-secondary rounded"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      <button onClick={() => deleteMut.mutate(s.id)} className="p-1 hover:bg-destructive/10 rounded"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                    </div>
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