import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const PRICE_MAP = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', XRP: 'xrp_usd', PAXG: 'gold_usd' };
const fmtP = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PositionsActivity({ prices }) {
  const { data: txns = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 200),
  });
  const o = prices || {};

  const posMap = {};
  txns.forEach(t => {
    if (!t.symbol) return;
    const sign = (t.type === 'sell' || t.type === 'transfer_out') ? -1 : 1;
    const qty = (t.quantity || 0) * sign;
    if (!posMap[t.symbol]) posMap[t.symbol] = { symbol: t.symbol, qty: 0, cost: 0 };
    posMap[t.symbol].qty += qty;
    posMap[t.symbol].cost += qty * (t.price_per_unit || 0);
  });
  const positions = Object.values(posMap).filter(p => Math.abs(p.qty) > 1e-6).map(p => {
    const entry = p.qty !== 0 ? p.cost / p.qty : 0;
    const current = PRICE_MAP[p.symbol] ? (o[PRICE_MAP[p.symbol]] || 0) : 0;
    const pnl = (current - entry) * p.qty;
    const pnlPct = entry ? ((current - entry) / entry) * 100 : 0;
    return { ...p, entry, current, pnl, pnlPct };
  });

  const recent = txns.slice(0, 10);

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-card border border-border p-3">
        <h3 className="text-xs font-bold tracking-widest uppercase mb-2">Open Positions</h3>
        {positions.length === 0 ? (
          <p className="text-[11px] text-muted-foreground py-4 text-center">No open positions</p>
        ) : (
          <div className="text-[10px] font-mono">
            <div className="grid grid-cols-6 gap-1 text-muted-foreground mb-1 px-1">
              <span>ASSET</span><span className="text-right">QTY</span><span className="text-right">ENTRY</span><span className="text-right">CURR</span><span className="text-right">P&amp;L$</span><span className="text-right">P&amp;L%</span>
            </div>
            {positions.map(p => (
              <div key={p.symbol} className="grid grid-cols-6 gap-1 px-1 py-1">
                <span className="font-bold">{p.symbol}</span>
                <span className="text-right">{p.qty.toFixed(4)}</span>
                <span className="text-right">{fmtP(p.entry)}</span>
                <span className="text-right">{fmtP(p.current)}</span>
                <span className={`text-right ${p.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>{p.pnl >= 0 ? '+' : ''}{fmtP(p.pnl)}</span>
                <span className={`text-right ${p.pnlPct >= 0 ? 'text-accent' : 'text-destructive'}`}>{p.pnlPct >= 0 ? '+' : ''}{p.pnlPct.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-card border border-border p-3">
        <h3 className="text-xs font-bold tracking-widest uppercase mb-2">Recent Activity</h3>
        {recent.length === 0 ? (
          <p className="text-[11px] text-muted-foreground py-4 text-center">No activity yet</p>
        ) : (
          <div className="space-y-1 text-[10px] font-mono">
            {recent.map(t => (
              <div key={t.id} className="flex items-center justify-between px-1 py-1 border-b border-border/30 last:border-0">
                <span className="text-muted-foreground">{t.created_date ? new Date(t.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                <span className={t.type === 'buy' ? 'text-accent' : t.type === 'sell' ? 'text-destructive' : 'text-muted-foreground'}>{t.type?.toUpperCase()}</span>
                <span className="font-bold">{t.symbol}</span>
                <span className="text-muted-foreground">{fmtP(t.total_amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}