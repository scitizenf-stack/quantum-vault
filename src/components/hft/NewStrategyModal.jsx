import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const TYPES = ['Arbitrage', 'Market Making', 'Momentum', 'Stat Arb', 'Grid'];

export default function NewStrategyModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', type: 'Arbitrage', status: 'PAUSED', targetPair: 'BTC/USDT', riskLimit: 500, maxPosition: 10000 });

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 backdrop-blur-xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">New Strategy</p>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Name', key: 'name', type: 'text' },
            { label: 'Pair', key: 'targetPair', type: 'text' },
            { label: 'Risk Limit ($)', key: 'riskLimit', type: 'number' },
            { label: 'Max Position ($)', key: 'maxPosition', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-muted-foreground">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))}
                className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-ring" />
            </div>
          ))}
          <div>
            <label className="text-xs text-muted-foreground">Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none">
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none">
              {['ACTIVE', 'PAUSED', 'STOPPED'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => onSave(form)} disabled={!form.name}>Create Strategy</Button>
        </div>
      </div>
    </div>
  );
}