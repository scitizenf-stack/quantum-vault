import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Ban, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import RejectionModal from '@/components/approvals/RejectionModal';

const call = (entity, method, id, body) => base44.functions.invoke('elephoneApi', { entity, method, id, body });
const extractList = (d) => {
  const data = d?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export default function ClientApprovals() {
  const { canAdmin } = useRBAC();
  const qc = useQueryClient();
  const [rejecting, setRejecting] = useState(null);
  const [acting, setActing] = useState(null);

  const { data: appsResp, isLoading } = useQuery({
    queryKey: ['elephone-applications'],
    queryFn: () => call('TradingApplication', 'GET'),
    refetchInterval: 30000,
  });
  const { data: acctsResp } = useQuery({
    queryKey: ['elephone-accounts'],
    queryFn: () => call('TradingAccount', 'GET'),
    refetchInterval: 30000,
  });

  if (!canAdmin()) return <AccessDenied section="Client Approvals" />;

  const apps = extractList(appsResp);
  const accounts = extractList(acctsResp);
  const pending = apps.filter(a => (a.status || 'pending') === 'pending');
  const errStatus = appsResp?.data && !appsResp.data.ok ? appsResp.data.status : null;

  const approve = async (app) => {
    setActing(app.id);
    try {
      await call('TradingApplication', 'PATCH', app.id, { status: 'approved', approved_at: new Date().toISOString() });
      await call('TradingAccount', 'POST', null, { user_id: app.user_id, status: 'active', balance: 0, auto_split_enabled: true });
      if (app.user_id) await call('User', 'PATCH', app.user_id, { role: 'approved_trader' });
      toast.success(`Approved ${app.full_name || app.name || 'applicant'}`);
      qc.invalidateQueries({ queryKey: ['elephone-applications'] });
      qc.invalidateQueries({ queryKey: ['elephone-accounts'] });
    } catch (e) { toast.error(`Approve failed: ${e.message}`); }
    finally { setActing(null); }
  };

  const confirmReject = async (reason) => {
    const app = rejecting;
    setActing(app.id);
    try {
      await call('TradingApplication', 'PATCH', app.id, { status: 'rejected', rejection_reason: reason });
      if (app.user_id) await call('User', 'PATCH', app.user_id, { role: 'user' });
      toast.success(`Rejected ${app.full_name || app.name || 'applicant'}`);
      setRejecting(null);
      qc.invalidateQueries({ queryKey: ['elephone-applications'] });
    } catch (e) { toast.error(`Reject failed: ${e.message}`); }
    finally { setActing(null); }
  };

  const suspend = async (acct) => {
    setActing(acct.id);
    try {
      await call('TradingAccount', 'PATCH', acct.id, { status: 'suspended' });
      if (acct.user_id) await call('User', 'PATCH', acct.user_id, { role: 'suspended' });
      toast.success('Trader suspended');
      qc.invalidateQueries({ queryKey: ['elephone-accounts'] });
    } catch (e) { toast.error(`Suspend failed: ${e.message}`); }
    finally { setActing(null); }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <UserCheck className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Client Approvals</h1>
          <p className="text-xs text-muted-foreground">Trading applications from ElePhone · owner-only</p>
        </div>
      </div>

      {errStatus && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-2.5 text-xs text-yellow-300">
          ElePhone API returned status {errStatus} — the ElePhone app may not be deployed yet. Records will appear here once live.
        </div>
      )}

      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <h2 className="text-sm font-semibold">Pending Applications ({pending.length})</h2>
        </div>
        {isLoading ? <Skeleton className="h-24 w-full" /> : pending.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No pending applications</p>
        ) : (
          <div className="space-y-3">
            {pending.map(a => (
              <div key={a.id} className="rounded-lg border border-border p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">{a.full_name || a.name || 'Applicant'}</p>
                  <p className="text-xs text-muted-foreground font-mono">{a.email || '—'} · ${(a.investment_amount || a.intent_amount || 0).toLocaleString()} intent · {a.risk_profile || a.risk_tolerance || '—'}</p>
                  <p className="text-[10px] text-muted-foreground">Applied: {a.created_date ? new Date(a.created_date).toLocaleDateString() : '—'} · Goal: "{a.goal || a.investment_goal || '—'}"</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1.5 text-xs" onClick={() => approve(a)} disabled={acting === a.id}><Check className="w-3.5 h-3.5" /> Approve</Button>
                  <Button size="sm" variant="destructive" className="gap-1.5 text-xs" onClick={() => setRejecting(a)} disabled={acting === a.id}><X className="w-3.5 h-3.5" /> Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <h2 className="text-sm font-semibold">Approved Traders ({accounts.filter(a => a.status === 'active').length})</h2>
        </div>
        {accounts.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No approved traders</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[640px]">
              <thead className="sticky top-0 bg-secondary/90">
                <tr className="border-b border-border">
                  {['Name', 'Balance', 'Joined', 'Status', ''].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {accounts.map(a => (
                  <tr key={a.id} className="border-b border-border/30 hover:bg-secondary/20">
                    <td className="px-3 py-2 font-mono">{a.full_name || a.name || a.user_id || '—'}</td>
                    <td className="px-3 py-2 font-mono">${(a.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.created_date ? new Date(a.created_date).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2"><Badge variant={a.status === 'active' ? 'default' : 'secondary'} className="text-[9px]">{a.status}</Badge></td>
                    <td className="px-3 py-2">{a.status === 'active' && <Button size="sm" variant="outline" className="gap-1.5 text-[10px] h-6" onClick={() => suspend(a)} disabled={acting === a.id}><Ban className="w-3 h-3" /> Suspend</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RejectionModal open={!!rejecting} applicantName={rejecting?.full_name || rejecting?.name || 'Applicant'} onClose={() => setRejecting(null)} onConfirm={confirmReject} />
    </div>
  );
}