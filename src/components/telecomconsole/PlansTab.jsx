import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const EMPTY = { name: '', slug: '', billing_type: 'flat_rate', price_usd: 0, data_limit_mb: 0, voice_minutes: 0, sms_limit: 0, routing_primary: 'RF_MESH', routing_fallback: 'none', includes_calls: true, includes_sms: true, includes_data: false, active: true, description: '', user_count: 0 };
const fmt = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const inp = 'w-full bg-input border border-border rounded-lg px-2 py-1.5 text-xs font-mono';

function Field({ label, children }) {
  return <label className="text-[10px] text-muted-foreground block">{label}<div className="mt-0.5">{children}</div></label>;
}

export default function PlansTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const { data: plans = [], isLoading } = useQuery({ queryKey: ['telecom-plans'], queryFn: () => base44.entities.TelecomPlan.list() });

  const save = async (form) => {
    try {
      if (editing === 'new') await base44.entities.TelecomPlan.create(form);
      else await base44.entities.TelecomPlan.update(editing.id, form);
      toast.success('Plan saved');
      qc.invalidateQueries({ queryKey: ['telecom-plans'] });
      setEditing(null);
    } catch (e) { toast.error(`Save failed: ${e.message}`); }
  };

  const remove = async (p) => {
    try { await base44.entities.TelecomPlan.delete(p.id); toast.success('Plan deleted'); qc.invalidateQueries({ queryKey: ['telecom-plans'] }); }
    catch (e) { toast.error(`Delete failed: ${e.message}`); }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setEditing('new')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"><Plus className="w-3.5 h-3.5" /> New Plan</button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        {isLoading ? <div className="p-8 text-center text-xs text-muted-foreground">Loading…</div> : plans.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No plans</div>
        ) : (
          <table className="w-full text-xs min-w-[820px]">
            <thead className="bg-secondary/40"><tr className="border-b border-border">
              {['Name', 'Slug', 'Billing', 'Price', 'Data', 'Voice', 'SMS', 'Routing', 'Active', 'Users', 'Actions'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id} className="border-b border-border/40 hover:bg-secondary/20">
                  <td className="px-3 py-2 font-semibold">{p.name}</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{p.slug || '—'}</td>
                  <td className="px-3 py-2">{p.billing_type || '—'}</td>
                  <td className="px-3 py-2 font-mono">{fmt(p.price_usd)}</td>
                  <td className="px-3 py-2 font-mono">{p.data_limit_mb != null ? `${p.data_limit_mb}MB` : '—'}</td>
                  <td className="px-3 py-2 font-mono">{p.voice_minutes != null ? p.voice_minutes : '—'}</td>
                  <td className="px-3 py-2 font-mono">{p.sms_limit != null ? p.sms_limit : '—'}</td>
                  <td className="px-3 py-2 text-[10px]">{p.routing_primary || '—'}</td>
                  <td className="px-3 py-2"><span className={`w-2 h-2 rounded-full inline-block ${p.active ? 'bg-accent' : 'bg-muted-foreground/40'}`} /></td>
                  <td className="px-3 py-2 font-mono">{p.user_count || 0}</td>
                  <td className="px-3 py-2"><div className="flex gap-1">
                    <button onClick={() => setEditing(p)} className="p-1 hover:bg-secondary rounded"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => remove(p)} className="p-1 hover:bg-destructive/10 rounded"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && <PlanForm initial={editing === 'new' ? EMPTY : editing} isNew={!editing.id} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function PlanForm({ initial, isNew, onClose, onSave }) {
  const [f, setF] = useState(initial);
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl p-5 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">{isNew ? 'New Plan' : 'Edit Plan'}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Name"><input value={f.name || ''} onChange={e => set('name', e.target.value)} className={inp} /></Field>
          <Field label="Slug"><input value={f.slug || ''} onChange={e => set('slug', e.target.value)} className={inp} /></Field>
          <Field label="Billing Type"><select value={f.billing_type || 'flat_rate'} onChange={e => set('billing_type', e.target.value)} className={inp}>{['flat_rate', 'per_minute', 'per_mb', 'hybrid'].map(o => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Price USD"><input type="number" step="any" value={f.price_usd || 0} onChange={e => set('price_usd', parseFloat(e.target.value) || 0)} className={inp} /></Field>
          <Field label="Data Limit (MB)"><input type="number" value={f.data_limit_mb || 0} onChange={e => set('data_limit_mb', parseFloat(e.target.value) || 0)} className={inp} /></Field>
          <Field label="Voice Minutes"><input type="number" value={f.voice_minutes || 0} onChange={e => set('voice_minutes', parseFloat(e.target.value) || 0)} className={inp} /></Field>
          <Field label="SMS Limit"><input type="number" value={f.sms_limit || 0} onChange={e => set('sms_limit', parseFloat(e.target.value) || 0)} className={inp} /></Field>
          <Field label="Routing Primary"><select value={f.routing_primary || 'RF_MESH'} onChange={e => set('routing_primary', e.target.value)} className={inp}>{['RF_MESH', 'LTE', 'WIFI_CALLING', 'PSTN'].map(o => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Routing Fallback"><select value={f.routing_fallback || 'none'} onChange={e => set('routing_fallback', e.target.value)} className={inp}>{['Twilio_SIP', 'PSTN', 'none'].map(o => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Description"><input value={f.description || ''} onChange={e => set('description', e.target.value)} className={inp} /></Field>
        </div>

        <div className="flex gap-4 text-xs">
          {[['includes_calls', 'Calls'], ['includes_sms', 'SMS'], ['includes_data', 'Data'], ['active', 'Active']].map(([k, l]) => (
            <label key={k} className="flex items-center gap-1.5"><input type="checkbox" checked={!!f[k]} onChange={e => set(k, e.target.checked)} /> {l}</label>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-semibold">Cancel</button>
          <button onClick={() => onSave(f)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Save</button>
        </div>
      </div>
    </div>
  );
}