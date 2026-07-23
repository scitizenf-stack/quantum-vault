import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

export default function ApplicationDetailPanel({ application, onClose, onApprove, onReject }) {
  if (!application) return null;
  const a = application;
  const rows = [
    ['Full Name', a.full_name || a.name],
    ['Email', a.email],
    ['Investment', a.investment_amount != null ? `$${Number(a.investment_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'],
    ['Risk Tolerance', a.risk_tolerance],
    ['KYC Status', a.kyc_status],
    ['Status', a.status],
    ['Goal', a.investment_goal || a.goal],
    ['User ID', a.user_id],
    ['Submitted', a.created_date ? new Date(a.created_date).toLocaleString() : '—'],
    ['Approved By', a.approved_by || '—'],
    ['Approved At', a.approved_at ? new Date(a.approved_at).toLocaleString() : '—'],
    ['Admin Notes', a.admin_notes || '—'],
  ];
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto">
      <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-bold">Application Details</p>
        <button onClick={onClose} className="p-1 hover:bg-secondary rounded"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-4 space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 py-1.5 border-b border-border/30">
            <span className="text-xs text-muted-foreground">{k}</span>
            <span className="text-xs font-mono text-right break-all">{String(v ?? '—')}</span>
          </div>
        ))}
      </div>
      {a.status === 'pending' && (
        <div className="p-4 flex gap-2 sticky bottom-0 bg-card border-t border-border">
          <Button size="sm" className="flex-1 gap-1.5" onClick={() => onApprove(a)}><Check className="w-3.5 h-3.5" /> Approve</Button>
          <Button size="sm" variant="destructive" className="flex-1 gap-1.5" onClick={() => onReject(a)}><X className="w-3.5 h-3.5" /> Reject</Button>
        </div>
      )}
    </div>
  );
}