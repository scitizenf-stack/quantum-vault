import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FORM_ASSETS = ['BTC', 'ETH', 'SOL', 'PAXG'];
const KEY = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', PAXG: 'gold_usd' };
const fmtP = (p) => p ? Number(p).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

export default function ChartTradePanel({ asset, price, history, prices, onExecute }) {
  const [formAsset, setFormAsset] = useState(asset);
  const [side, setSide] = useState('BUY');
  const [type, setType] = useState('MARKET');
  const [qty, setQty] = useState('');
  const [limit, setLimit] = useState('');

  const mktPrice = prices?.[KEY[formAsset]] || 0;
  const execPrice = type === 'LIMIT' ? (parseFloat(limit) || 0) : mktPrice;
  const estValue = (parseFloat(qty) || 0) * execPrice;

  const submit = (e) => {
    e.preventDefault();
    onExecute({ asset: formAsset, side, type, qty: parseFloat(qty) || 0, price: execPrice });
    setQty(''); setLimit('');
  };

  const data = history.map((p, i) => ({ i, price: p }));

  return (
    <div className="rounded-xl bg-card border border-border p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold tracking-widest uppercase">{asset}/USDT</h3>
        <span className="text-lg font-mono font-bold tabular-nums">{fmtP(price)}</span>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="px" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(151 100% 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(151 100% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="i" hide />
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip formatter={(v) => [`$${fmtP(v)}`, asset]} contentStyle={{ background: 'hsl(222 41% 9%)', border: '1px solid hsl(215 28% 17%)', borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey="price" stroke="hsl(151 100% 50%)" strokeWidth={2} fill="url(#px)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <form onSubmit={submit} className="mt-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex rounded-lg overflow-hidden border border-border">
            {['BUY', 'SELL'].map(s => (
              <button type="button" key={s} onClick={() => setSide(s)} className={`flex-1 py-1.5 text-xs font-bold ${side === s ? (s === 'BUY' ? 'bg-accent text-accent-foreground' : 'bg-destructive text-destructive-foreground') : 'text-muted-foreground'}`}>{s}</button>
            ))}
          </div>
          <div className="flex rounded-lg overflow-hidden border border-border">
            {['MARKET', 'LIMIT'].map(t => (
              <button type="button" key={t} onClick={() => setType(t)} className={`flex-1 py-1.5 text-[10px] font-bold ${type === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] text-muted-foreground">Asset
            <select value={formAsset} onChange={e => setFormAsset(e.target.value)} className="w-full bg-input border border-border rounded-lg px-2 py-1.5 text-xs font-mono mt-0.5">
              {FORM_ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label className="text-[10px] text-muted-foreground">Quantity
            <input type="number" step="any" value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-input border border-border rounded-lg px-2 py-1.5 text-xs font-mono mt-0.5" placeholder="0.00" />
          </label>
        </div>

        {type === 'LIMIT' && (
          <label className="text-[10px] text-muted-foreground block">Limit Price
            <input type="number" step="any" value={limit} onChange={e => setLimit(e.target.value)} className="w-full bg-input border border-border rounded-lg px-2 py-1.5 text-xs font-mono mt-0.5" placeholder="0.00" />
          </label>
        )}

        <div className="flex items-center justify-between text-xs border-t border-border pt-2">
          <span className="text-muted-foreground">EST. VALUE</span>
          <span className="font-mono font-bold">${estValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>

        <button type="submit" className={`w-full py-2 rounded-lg text-xs font-bold ${side === 'BUY' ? 'bg-accent text-accent-foreground' : 'bg-destructive text-destructive-foreground'}`}>EXECUTE {side} ORDER</button>
      </form>
    </div>
  );
}