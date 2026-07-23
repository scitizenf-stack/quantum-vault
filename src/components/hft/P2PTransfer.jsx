import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'MATIC'];

export default function P2PTransfer() {
  const qc = useQueryClient();
  const [asset, setAsset] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [sending, setSending] = useState(false);
  const fee = (parseFloat(amount) || 0) * 0.001;

  const send = async () => {
    if (!amount || !address) { toast.error('Amount and address required'); return; }
    setSending(true);
    try {
      await base44.entities.Transaction.create({
        asset_name: asset,
        symbol: asset,
        type: 'transfer_out',
        quantity: parseFloat(amount),
        total_amount: parseFloat(amount),
        fee,
        status: 'completed',
        notes: `P2P transfer to ${address.slice(0, 8)}...`,
      });
      toast.success(`Sent ${amount} ${asset}`);
      qc.invalidateQueries({ queryKey: ['transactions'] });
      setAmount(''); setAddress('');
    } catch (e) { toast.error(`Transfer failed: ${e.message}`); }
    finally { setSending(false); }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-bold">P2P Transfer</p>
      <div>
        <label className="text-xs text-muted-foreground">Asset</label>
        <select value={asset} onChange={e => setAsset(e.target.value)} className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 outline-none">
          {ASSETS.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Amount</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 font-mono outline-none focus:ring-1 focus:ring-ring" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Wallet Address</label>
        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="0x..." className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 font-mono outline-none focus:ring-1 focus:ring-ring" />
      </div>
      <div className="flex justify-between text-xs"><span className="text-muted-foreground">Est. Fee</span><span className="font-mono">{fee.toFixed(6)} {asset}</span></div>
      <Button className="w-full" disabled={sending} onClick={send}>{sending ? 'Sending...' : 'Send'}</Button>
    </div>
  );
}