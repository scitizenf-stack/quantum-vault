import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ShieldCheck, Clock, Loader2 } from 'lucide-react';

const STATUS_CLASS = {
  approved: 'bg-accent/15 text-accent',
  pending: 'bg-yellow-500/15 text-yellow-400',
  rejected: 'bg-destructive/15 text-destructive',
};

export default function KycTab() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(null);
  const { data: wallets = [], isLoading } = useQuery({ queryKey: ['wallets'], queryFn: () => base44.entities.Wallet.list() });

  const approve = async (w) => {
    setBusy(w.id);
    try {
      await base44.entities.Wallet.update(w.id, { kyc_verified: true });
      await base44.entities.ToggleLog.create({
        user_id: w.user_id, action: 'activate', status: 'success',
        request_payload: JSON.stringify({ kyc_approved: true }), timestamp: new Date().toISOString(),
      }).catch(() => {});
      toast.success(`KYC approved for ${w.user_id?.slice(-8) || 'user'}`);
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['toggle-logs'] });
    } catch (e) { toast.error(`Approval failed: ${e.message}`); }
    setBusy(null);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-x-auto">
      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Loading KYC profiles…</div>
      ) : wallets.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground">No KYC profiles</div>
      ) : (
        <table className="w-full text-xs min-w-[720px]">
          <thead className="bg-secondary/40"><tr className="border-b border-border">
            {['User ID', 'KYC Status', 'Wallet Status', 'Balance', 'Split %', 'Created', 'Action'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}
          </tr></thead>
          <tbody>
            {wallets.map(w => {
              const kycStatus = w.kyc_verified ? 'approved' : 'pending';
              return (
                <tr key={w.id} className="border-b border-border/40 hover:bg-secondary/20">
                  <td className="px-3 py-2 font-mono text-[10px]">{w.user_id?.slice(-8) || '—'}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_CLASS[kycStatus]}`}>{kycStatus}</span></td>
                  <td className="px-3 py-2"><span className="text-[10px] font-semibold uppercase">{w.status || '—'}</span></td>
                  <td className="px-3 py-2 font-mono">${(w.balance_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2 font-mono">{w.split_percentage || 0}%</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{w.created_date ? new Date(w.created_date).toLocaleDateString() : '—'}</td>
                  <td className="px-3 py-2">
                    {!w.kyc_verified ? (
                      <button onClick={() => approve(w)} disabled={busy === w.id} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-50">
                        {busy === w.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}Approve
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-accent"><ShieldCheck className="w-3 h-3" />Verified</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}