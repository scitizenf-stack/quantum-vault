import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'MATIC/BNB'];

export default function PlaceOrderModal({ open, onClose, defaultPair }) {
  const qc = useQueryClient();
  const [type, setType] = useState('LIMIT');
  const [side, setSide] = useState('BUY');
  const [pair, setPair] = useState(defaultPair || 'BTC/USDT');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: strategies = [] } = useQuery({
    queryKey: ['hft-strategies'],
    queryFn: () => base44.entities.Strategy.list(),
  });
  const activeStrat = strategies.find(s => s.status === 'ACTIVE' && s.targetPair === pair);
  const total = (parseFloat(qty) || 0) * (parseFloat(price) || 0);
  const riskWarn = activeStrat && total > (activeStrat.riskLimit || 0);

  if (!open) return null;

  const submit = async () => {
    if (!qty || (type !== 'MARKET' && !price)) { toast.error('Quantity and price required'); return; }
    setSubmitting(true);
    try {
      await base44.entities.Trade.create({
        strategy: activeStrat?.name || 'Manual P2P',
        pair, side,
        qty: parseFloat(qty),
        price: type === 'MARKET' ? 0 : parseFloat(price),
        total,
        fee: total * 0.001,
        status: 'PAPER',
        pnl: 0,
        timestamp: new Date().toISOString(),
      });
      toast.success(`${side} ${qty} ${pair.split('/')[0]} (PAPER)`);
      qc.invalidateQueries({ queryKey: ['hft-trades'] });
      onClose();
      setQty(''); setPrice('');
    } catch (e) { toast.error(`Order failed: ${e.message}`); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 backdrop-blur-xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Place Order</p>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['LIMIT', 'MARKET', 'STOP'].map(t => (
            <button key={t} onClick={() => setType(t)} className={`text-xs py-2 rounded-lg border transition-colors ${type === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-secondary'}`}>{t}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['BUY', 'SELL'].map(s => (
            <button key={s} onClick={() => setSide(s)} className={`text-xs py-2 rounded-lg border font-bold transition-colors ${side === s ? (s === 'BUY' ? 'bg-accent text-accent-foreground border-accent' : 'bg-destructive text-destructive-foreground border-destructive') : 'border-border text-muted-foreground hover:bg-secondary'}`}>{s}</button>
          ))}
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Pair</label>
          <select value={pair} onChange={e => setPair(e.target.value)} className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none">
            {PAIRS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Quantity</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0.00" className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 font-mono outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Price {type === 'MARKET' && '(market)'}</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} disabled={type === 'MARKET'} placeholder="0.00" className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 font-mono outline-none focus:ring-1 focus:ring-ring disabled:opacity-50" />
          </div>
        </div>
        {riskWarn && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <p className="text-[11px] text-yellow-400">Order total (${total.toFixed(2)}) exceeds risk limit (${activeStrat.riskLimit}) for {activeStrat.name}</p>
          </div>
        )}
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Estimated Total</span><span className="font-mono font-bold">${total.toFixed(2)}</span></div>
        <Button className="w-full" disabled={submitting} onClick={submit}>{submitting ? 'Submitting...' : `Submit ${side} (PAPER)`}</Button>
      </div>
    </div>
  );
}