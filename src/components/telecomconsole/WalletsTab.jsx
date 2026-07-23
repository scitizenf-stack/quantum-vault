import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowDownCircle, ArrowUpCircle, X } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const STATUS_CLASS = { active: 'text-accent', frozen: 'text-blue-400', suspended: 'text-orange-400' };

export default function WalletsTab() {
  const qc = useQueryClient();
  const [target, setTarget] = useState(null);
  const { data: wallets = [], isLoading } = useQuery({ queryKey: ['wallets'], queryFn: () => base44.entities.Wallet.list() });

  const submit = async (amount) => {
    const w = target.wallet;
    const type = target.type;
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) { toast.error('Enter a valid amount'); return; }
    try {
      const updates = { balance_usd: (w.balance_usd || 0) + (type === 'credit' ? amt : -amt), last_updated: new Date().toISOString() };
      if (type === 'credit') { updates.total_deposited = (w.total_deposited || 0) + amt; updates.total_earned = (w.total_earned || 0) + amt; }
      else updates.total_withdrawn = (w.total_withdrawn || 0) + amt;
      await base44.entities.Wallet.update(w.id, updates);
      await base44.entities.ToggleLog.create({
        user_id: w.user_id, action: type === 'credit' ? 'wallet_credit' : 'wallet_debit',
        status: 'success', request_payload: JSON.stringify({ amount: amt }), timestamp: new Date().toISOString(),
      }).catch(() => {});
      toast.success(`${type === 'credit' ? 'Credited' : 'Debited'} ${fmt(amt)}`);
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['toggle-logs'] });
      setTarget(null);
    } catch (e) { toast.error(`Failed: ${e.message}`); }
  };

  return (
    <div className="space-y-3">
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        {isLoading ? <div className="p-8 text-center text-xs text-muted-foreground">Loading…</div> : wallets.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No wallets</div>
        ) : (
          <table className="w-full text-xs min-w-[820px]">
            <thead className="bg-secondary/40"><tr className="border-b border-border">
              {['User', 'Status', 'USD', 'BTC', 'ETH', 'Deposited', 'Withdrawn', 'Earned', 'Auto-Trade', 'Split %', 'Actions'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {wallets.map(w => (
                <tr key={w.id} className="border-b border-border/40 hover:bg-secondary/20">
                  <td className="px-3 py-2 font-mono text-[10px]">{w.user_id?.slice(-8) || '—'}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] font-bold uppercase ${STATUS_CLASS[w.status] || 'text-muted-foreground'}`}>{w.status || '—'}</span></td>
                  <td className="px-3 py-2 font-mono">{fmt(w.balance_usd)}</td>
                  <td className="px-3 py-2 font-mono">{(w.balance_btc || 0).toFixed(6)}</td>
                  <td className="px-3 py-2 font-mono">{(w.balance_eth || 0).toFixed(4)}</td>
                  <td className="px-3 py-2 font-mono">{fmt(w.total_deposited)}</td>
                  <td className="px-3 py-2 font-mono">{fmt(w.total_withdrawn)}</td>
                  <td className="px-3 py-2 font-mono">{fmt(w.total_earned)}</td>
                  <td className="px-3 py-2"><span className={`w-2 h-2 rounded-full inline-block ${w.auto_trading_enabled ? 'bg-accent' : 'bg-muted-foreground/40'}`} /></td>
                  <td className="px-3 py-2 font-mono">{w.split_percentage || 0}%</td>
                  <td className="px-3 py-2"><div className="flex gap-1">
                    <button onClick={() => setTarget({ wallet: w, type: 'credit' })} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-accent/10 text-accent hover:bg-accent/20"><ArrowDownCircle className="w-3 h-3" />Credit</button>
                    <button onClick={() => setTarget({ wallet: w, type: 'debit' })} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20"><ArrowUpCircle className="w-3 h-3" />Debit</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {target && <AmountModal label={`${target.type === 'credit' ? 'Credit' : 'Debit'} Wallet`} onClose={() => setTarget(null)} onSubmit={submit} />}
    </div>
  );
}

function AmountModal({ label, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl p-5 w-full max-w-xs space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">{label}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <input type="number" step="any" autoFocus value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm font-mono" />
        <button onClick={() => onSubmit(amount)} className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Confirm</button>
      </div>
    </div>
  );
}