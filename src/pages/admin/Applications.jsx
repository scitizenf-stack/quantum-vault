import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Eye } from 'lucide-react';
import { elephoneCall, normalizeList } from '@/lib/useElephone';
import GlassModal from '@/components/shared/GlassModal';
import { toast } from 'sonner';

const RISK_COLORS = { Conservative: 'text-accent', Moderate: 'text-yellow-400', Aggressive: 'text-destructive' };
const FILTERS = ['all', 'pending', 'approved', 'rejected', 'suspended'];

export default function Applications() {
  const { canAdmin } = useRBAC();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [detail, setDetail] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(null);

  const { data: rawApps, isLoading } = useQuery({
    queryKey: ['elephone-applications'],
    queryFn: () => elephoneCall('GET', 'TradingApplication'),
    refetchInterval: 30000,
  });
  const apps = useMemo(() => normalizeList(rawApps), [rawApps]);

  const counts = {
    pending: apps.filter(a => (a.status || '').toLowerCase() === 'pending').length,
    approved: apps.filter(a => (a.status || '').toLowerCase() === 'approved').length,
    rejected: apps.filter(a => (a.status || '').toLowerCase() === 'rejected').length,
  };
  const filtered = filter === 'all' ? apps : apps.filter(a => (a.status || '').toLowerCase() === filter);

  const doApprove = async () => {
    if (!notes.trim()) { toast.error('Admin notes required'); return; }
    setProcessing('approve');
    try {
      const app = approveTarget;
      await elephoneCall('PATCH', 'TradingApplication', { id: app.id, body: {
        status: 'approved', approved_at: new Date().toISOString(), admin_notes: notes,
      }});
      const acctNo = 'QV-2026-' + String(Date.now()).slice(-4);
      await elephoneCall('POST', 'TradingAccount', { body: {
        user_id: app.user_id, application_id: app.id, account_number: acctNo,
        status: 'active', balance_usd: 0, total_deposited: 0, total_withdrawn: 0,
        auto_trading_enabled: false, auto_split_enabled: false,
        client_return_rate: 0.126, total_profit_returned: 0, exchange_keys_linked: false,
      }});
      toast.success(`Account approved — ${acctNo} created`);
      setApproveTarget(null); setNotes('');
      qc.invalidateQueries({ queryKey: ['elephone-applications'] });
      qc.invalidateQueries({ queryKey: ['elephone-accounts'] });
    } catch (e) { toast.error(`Approval failed: ${e.message}`); }
    finally { setProcessing(null); }
  };

  const doReject = async () => {
    if (!notes.trim()) { toast.error('Admin notes required'); return; }
    setProcessing('reject');
    try {
      await elephoneCall('PATCH', 'TradingApplication', { id: rejectTarget.id, body: { status: 'rejected', admin_notes: notes } });
      toast.success('Application rejected');
      setRejectTarget(null); setNotes('');
      qc.invalidateQueries({ queryKey: ['elephone-applications'] });
    } catch (e) { toast.error(`Reject failed: ${e.message}`); }
    finally { setProcessing(null); }
  };

  if (!canAdmin()) return <AccessDenied section="Applications" />;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Trading Applications</h1>
        <p className="text-xs text-muted-foreground">Approve or reject client trading applications from ElePhone</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-card border border-border p-3"><p className="text-[10px] text-muted-foreground uppercase">Pending</p><p className="text-xl font-mono font-bold text-yellow-400">{counts.pending}</p></div>
        <div className="rounded-xl bg-card border border-border p-3"><p className="text-[10px] text-muted-foreground uppercase">Approved</p><p className="text-xl font-mono font-bold text-accent">{counts.approved}</p></div>
        <div className="rounded-xl bg-card border border-border p-3"><p className="text-[10px] text-muted-foreground uppercase">Rejected</p><p className="text-xl font-mono font-bold text-destructive">{counts.rejected}</p></div>
      </div>

      <div className="flex gap-1 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-colors ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-secondary'}`}>
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-12 text-center text-sm text-muted-foreground">No {filter} applications</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead className="sticky top-0 bg-secondary/90">
              <tr className="border-b border-border">
                {['Name', 'Email', 'Investment', 'Risk', 'KYC', 'Submitted', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-border/40 hover:bg-secondary/20 cursor-pointer" onClick={() => setDetail(a)}>
                  <td className="px-3 py-2 font-mono font-semibold">{a.full_name || a.name || '—'}</td>
                  <td className="px-3 py-2 text-muted-foreground">{a.email || '—'}</td>
                  <td className="px-3 py-2 font-mono">${(a.investment_amount || a.intent_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                  <td className="px-3 py-2"><span className={RISK_COLORS[a.risk_tolerance] || 'text-muted-foreground'}>{a.risk_tolerance || '—'}</span></td>
                  <td className="px-3 py-2"><Badge variant={a.kyc_status === 'verified' ? 'default' : 'outline'} className="text-[9px]">{a.kyc_status || 'pending'}</Badge></td>
                  <td className="px-3 py-2 text-muted-foreground">{a.created_date ? new Date(a.created_date).toLocaleDateString() : '—'}</td>
                  <td className="px-3 py-2"><Badge variant={a.status === 'approved' ? 'default' : a.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[9px]">{a.status || 'pending'}</Badge></td>
                  <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <button onClick={() => { setApproveTarget(a); setNotes(''); }} className="p-1 rounded bg-accent/20 text-accent hover:bg-accent/30" title="Approve"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setRejectTarget(a); setNotes(''); }} className="p-1 rounded bg-destructive/20 text-destructive hover:bg-destructive/30" title="Reject"><X className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDetail(a)} className="p-1 rounded hover:bg-secondary" title="View"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve modal */}
      <GlassModal open={!!approveTarget} onClose={() => setApproveTarget(null)} title={`Approve ${approveTarget?.full_name || approveTarget?.name || ''}?`}
        footer={<div className="flex gap-2 justify-end"><Button size="sm" variant="ghost" onClick={() => setApproveTarget(null)}>Cancel</Button><Button size="sm" onClick={doApprove} disabled={processing === 'approve'}>{processing === 'approve' ? 'Processing...' : 'Confirm Approval'}</Button></div>}>
        <div>
          <label className="text-xs text-muted-foreground">Admin Notes (required)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Internal notes visible only to admin..."
            className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-ring" />
          <p className="text-[10px] text-muted-foreground mt-2">Creates a TradingAccount with client_return_rate 12.6% and status active.</p>
        </div>
      </GlassModal>

      {/* Reject modal */}
      <GlassModal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title={`Reject ${rejectTarget?.full_name || rejectTarget?.name || ''}?`}
        footer={<div className="flex gap-2 justify-end"><Button size="sm" variant="ghost" onClick={() => setRejectTarget(null)}>Cancel</Button><Button size="sm" variant="destructive" onClick={doReject} disabled={processing === 'reject'}>{processing === 'reject' ? 'Processing...' : 'Confirm Rejection'}</Button></div>}>
        <div>
          <label className="text-xs text-muted-foreground">Rejection Reason (required)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Reason for rejection..."
            className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </GlassModal>

      {/* Detail modal */}
      <GlassModal open={!!detail} onClose={() => setDetail(null)} title="Application Details" wide
        footer={<div className="flex gap-2 justify-end">{detail && (detail.status || '').toLowerCase() === 'pending' && (<>
          <Button size="sm" variant="destructive" onClick={() => { setRejectTarget(detail); setDetail(null); setNotes(''); }}>Reject</Button>
          <Button size="sm" onClick={() => { setApproveTarget(detail); setDetail(null); setNotes(''); }}>Approve</Button>
        </>)}</div>}>
        {detail && (
          <div className="space-y-2 text-xs">
            {[
              ['Name', detail.full_name || detail.name],
              ['Email', detail.email],
              ['User ID', detail.user_id],
              ['Investment', `$${(detail.investment_amount || detail.intent_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`],
              ['Risk Tolerance', detail.risk_tolerance],
              ['KYC Status', detail.kyc_status],
              ['Goal', detail.investment_goal || detail.goal],
              ['Agreement Signed', detail.agreement_signed_at ? new Date(detail.agreement_signed_at).toLocaleString() : '—'],
              ['Status', detail.status],
              ['Submitted', detail.created_date ? new Date(detail.created_date).toLocaleString() : '—'],
              ['Admin Notes', detail.admin_notes || '—'],
              ['Approved At', detail.approved_at ? new Date(detail.approved_at).toLocaleString() : '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-mono text-right break-all">{v || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </GlassModal>
    </div>
  );
}