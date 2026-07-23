import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'XRP', 'USDC', 'XAU', 'PAXG', 'LINK', 'AVAX'];
const SOURCES = ['Coinbase', 'Kraken', 'Binance', 'Wallet', 'Manual'];

export default function AddHoldingModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', symbol: 'SOL', quantity: '', avg_buy_price: '', source: 'Manual' });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.symbol || !form.quantity) return;
    setSaving(true);
    await base44.entities.Asset.create({
      name: form.name,
      symbol: form.symbol,
      type: ['BTC','ETH','SOL','XRP','LINK','AVAX'].includes(form.symbol) ? 'crypto' : form.symbol === 'XAU' || form.symbol === 'PAXG' ? 'commodity' : 'crypto',
      quantity: parseFloat(form.quantity),
      avg_buy_price: parseFloat(form.avg_buy_price) || 0,
      current_price: 0,
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Add Holding</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3">
          <Field label="Asset Name">
            <input className={inputCls} placeholder="e.g. Solana" value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>
          <Field label="Symbol">
            <select className={inputCls} value={form.symbol} onChange={e => set('symbol', e.target.value)}>
              {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity">
              <input className={inputCls} type="number" step="any" placeholder="0.00" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
            </Field>
            <Field label="Avg Cost (USD)">
              <input className={inputCls} type="number" step="any" placeholder="0.00" value={form.avg_buy_price} onChange={e => set('avg_buy_price', e.target.value)} />
            </Field>
          </div>
          <Field label="Source">
            <select className={inputCls} value={form.source} onChange={e => set('source', e.target.value)}>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving || !form.name || !form.quantity}>
            {saving ? 'Saving…' : 'Save Holding'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}