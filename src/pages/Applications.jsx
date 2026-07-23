import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Check, X } from 'lucide-react';
import { elephone } from '@/lib/elephoneClient';
import { toast } from 'sonner';
import ApprovalModal from '@/components/approvals/ApprovalModal';
import RejectionModal from '@/components/approvals/RejectionModal';
import ApplicationDetailPanel from '@/components/approvals/ApplicationDetailPanel';

const RISK_CLASS = { conservative: 'text-blue-400 border-blue-500/40', moderate: 'text-yellow-400 border-yellow-500/40', aggressive: 'text-red-400 border-red-500/40' };
const KYC_CLASS = { none: 'text-muted-foreground', pending: 'text-yellow-400', approved: 'text-accent', rejected: 'text-destructive' };
const STATUS_CLASS = { pending: 'text-yellow-400', approved: 'text-accent', rejected: 'text-destructive', suspended: 'text-orange-400' };

export default function Applications() {
  const { canAdmin, user } = useRBAC();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [detail, setDetail] = useState(null);

  const { data: apps = [], isLoading, error } = useQuery({
    queryKey: ['elephone-applications'],
    queryFn: () => elephone.list('TradingApplication'),
    refetchInterval: 60000,
  });

  if (!canAdmin()) return <AccessDenied section="Applications" />;

  const counts = {
    total: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };
  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  const doApprove = async (notes) => {
    const app = approveTarget;
    try {
      await elephone.update('TradingApplication', app.id, {
        status: 'approved', approved_by: user?.id, approved_at: new Date().toISOString(), admin_notes: notes,
      });
      await elephone.create('TradingAccount', {
        user_id: app.user_id, application_id: app.id,
        account_number: `QV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        status: 'active', balance_usd: 0, total_deposited: 0, total_withdrawn: 0,
        auto_trading_enabled: false, auto_split_enabled: false, client_return_rate: 12.6,
        last_split_at: null, total_profit_returned: 0, exchange_keys_linked: false,
      });
      toast.success('Account approved and trading account created');
      qc.invalidateQueries({ queryKey: ['elephone-applications'] });
      qc.invalidateQueries({ queryKey: ['elephone-accounts'] });
      setApproveTarget(null); setDetail(null);
    } catch (e) { toast.error(`Approval failed: ${e.message}`); }
  };

  const doReject = async (reason) => {
    const app = rejectTarget;
    try {
      await elephone.update('TradingApplication', app.id, { status: 'rejected', admin_notes: reason });
      toast.success('Application rejected');
      qc.invalidateQueries({ queryKey: ['elephone-applications'] });
      setRejectTarget(null); setDetail(null);
    } catch (e) { toast.error(`Rejection failed: ${e.message}`); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Trading Applications</h1>
        <p className="text-xs text-muted-foreground">Review and approve client applications · auto-refresh 60s</p>
      </div>

      {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">ElePhone API unavailable: {error.message}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Total', counts.total, 'all'], ['Pending', counts.pending, 'pending'], ['Approved', counts.approved, 'approved'], ['Rejected', counts.rejected, 'rejected']].map(([label, val, key]) => (
          <button key={key} onClick={() => setFilter(key)} className={`rounded-xl bg-card border p-3 text-left transition-colors ${filter === key ? 'border-primary' : 'border-border'}`}>
            <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
            <p className="text-xl font-mono font-bold">{val}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {['all', 'pending', 'approved', 'rejected', 'suspended'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1 rounded-lg border capitalize ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-secondary'}`}>{f}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-12 text-center text-sm text-muted-foreground">No applications</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-xs min-w-[820px]">
            <thead className="sticky top-0 bg-secondary/90">
              <tr className="border-b border-border">
                {['Submitted', 'Name', 'Email', 'Investment', 'Risk', 'KYC', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-border/40 hover:bg-secondary/20 cursor-pointer" onClick={() => setDetail(a)}>
                  <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{a.created_date ? new Date(a.created_date).toLocaleDateString() : '—'}</td>
                  <td className="px-3 py-2 font-semibold">{a.full_name || a.name || '—'}</td>
                  <td className="px-3 py-2 font-mono text-[10px]">{a.email || '—'}</td>
                  <td className="px-3 py-2 font-mono">{a.investment_amount != null ? `$${Number(a.investment_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded border ${RISK_CLASS[a.risk_tolerance] || 'text-muted-foreground border-border'}`}>{a.risk_tolerance || '—'}</span></td>
                  <td className="px-3 py-2"><span className={`text-[10px] font-semibold ${KYC_CLASS[a.kyc_status] || 'text-muted-foreground'}`}>{a.kyc_status || 'none'}</span></td>
                  <td className="px-3 py-2"><span className={`text-[10px] font-semibold ${STATUS_CLASS[a.status] || 'text-muted-foreground'}`}>{a.status}</span></td>
                  <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <button onClick={() => setDetail(a)} className="p-1 hover:bg-secondary rounded" title="View"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => setApproveTarget(a)} className="p-1 hover:bg-accent/10 rounded" title="Approve"><Check className="w-3.5 h-3.5 text-accent" /></button>
                          <button onClick={() => setRejectTarget(a)} className="p-1 hover:bg-destructive/10 rounded" title="Reject"><X className="w-3.5 h-3.5 text-destructive" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ApprovalModal application={approveTarget} onClose={() => setApproveTarget(null)} onConfirm={doApprove} />
      <RejectionModal application={rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={doReject} />
      <ApplicationDetailPanel application={detail} onClose={() => setDetail(null)} onApprove={(a) => { setDetail(null); setApproveTarget(a); }} onReject={(a) => { setDetail(null); setRejectTarget(a); }} />
    </div>
  );
}