import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function AdjustBalanceModal({ account, onClose, onConfirm }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  useEffect(() => { if (account) { setAmount(String(account.balance_usd || 0)); setReason(''); } }, [account]);
  if (!account) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 backdrop-blur-xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Adjust Balance — {account.account_number}</p>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded"><X className="w-4 h-4" /></button>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">New Balance (USD)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 font-mono outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Reason (admin note)</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-ring resize-none" />
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => onConfirm(parseFloat(amount), reason)} disabled={!amount}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}