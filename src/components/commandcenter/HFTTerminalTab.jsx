import React, { useState, useEffect, useRef } from 'react';
import { useVpsPrices } from '@/lib/useVpsData';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import OrderBookPanel from '@/components/hftterminal/OrderBookPanel';
import ChartTradePanel from '@/components/hftterminal/ChartTradePanel';
import PositionsActivity from '@/components/hftterminal/PositionsActivity';
import FusionCoreSyncBanner from '@/components/commandcenter/FusionCoreSyncBanner';

const WORKER = 'https://quantum-vault-api-production.securecitizenfoundation.workers.dev';
const ASSETS = ['BTC', 'ETH', 'SOL'];
const PRICE_KEY = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', PAXG: 'gold_usd' };

export default function HFTTerminalTab() {
  const [asset, setAsset] = useState('BTC');
  const prices = useVpsPrices(5000);
  const qc = useQueryClient();
  const historyRef = useRef({});
  const [, force] = useState(0);

  const o = prices.data || {};
  const price = o[PRICE_KEY[asset]] || 0;

  // Append live price to per-asset history (last 50 points)
  useEffect(() => {
    const data = prices.data || {};
    const p = data[PRICE_KEY[asset]];
    if (!p) return;
    const arr = historyRef.current[asset] ? [...historyRef.current[asset]] : [];
    arr.push(p);
    if (arr.length > 50) arr.shift();
    historyRef.current[asset] = arr;
    force(x => x + 1);
  }, [prices.data, asset]);

  const history = historyRef.current[asset] || [];

  const execute = async ({ asset: a, side, qty, price: p }) => {
    if (!qty || qty <= 0) { toast.error('Enter a valid quantity'); return; }
    if (!p) { toast.error('No live price available'); return; }

    // ── Profitability gate: POST /api/omega/route enforces ≥50bps net edge ──
    let gate;
    try {
      const res = await fetch(`${WORKER}/api/omega/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset: a, side, qty, price: p }),
      });
      gate = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(gate.error || gate.message || `Gate HTTP ${res.status}`);
    } catch (e) {
      toast.error(`Gate check failed: ${e.message}`);
      return;
    }

    const approved = gate.approved ?? gate.approve ?? false;
    const bps = gate.bps ?? gate.net_edge_bps ?? gate.edge_bps ?? null;

    if (!approved) {
      toast.error(`Gate rejected: ${bps != null ? `${bps}bps` : 'below threshold'} (min 50bps)`);
      return;
    }
    toast.success(`Gate approved: +${bps ?? '?'}bps net edge`);

    try {
      await base44.entities.Transaction.create({
        asset_name: a, symbol: a, type: side.toLowerCase(),
        quantity: qty, price_per_unit: p, total_amount: qty * p, status: 'completed',
      });
      toast.success(`${side} ${qty} ${a} executed @ $${p.toLocaleString()}`);
      qc.invalidateQueries({ queryKey: ['transactions'] });
    } catch (e) { toast.error(`Order failed: ${e.message}`); }
  };

  return (
    <div className="space-y-3">
      <FusionCoreSyncBanner />
      <div className="flex gap-1">
        {ASSETS.map(a => (
          <button key={a} onClick={() => setAsset(a)} className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono ${asset === a ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>{a}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-1"><OrderBookPanel asset={asset} price={price} /></div>
        <div className="lg:col-span-2"><ChartTradePanel asset={asset} price={price} history={history} prices={o} onExecute={execute} /></div>
        <div className="lg:col-span-1"><PositionsActivity prices={o} /></div>
      </div>
    </div>
  );
}