import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search } from 'lucide-react';

const ACTIONS = ['activate', 'deactivate', 'call_out', 'sms_out', 'ip_assign', 'webrtc_start', 'webrtc_end', 'plan_change', 'wallet_credit', 'wallet_debit'];
const STATUSES = ['success', 'failed', 'pending'];
const STATUS_CLASS = { success: 'text-accent', failed: 'text-destructive', pending: 'text-yellow-400' };
const sel = 'bg-input border border-border rounded-lg px-2 py-1.5 text-xs font-mono';

export default function ToggleLogTab() {
  const [fUser, setFUser] = useState('');
  const [fDevice, setFDevice] = useState('');
  const [fAction, setFAction] = useState('');
  const [fStatus, setFStatus] = useState('');
  const { data: logs = [], isLoading } = useQuery({ queryKey: ['toggle-logs'], queryFn: () => base44.entities.ToggleLog.list('-timestamp', 500) });

  const filtered = useMemo(() => logs.filter(l =>
    (!fUser || (l.user_id || '').toLowerCase().includes(fUser.toLowerCase())) &&
    (!fDevice || (l.device_id || '').toLowerCase().includes(fDevice.toLowerCase())) &&
    (!fAction || l.action === fAction) &&
    (!fStatus || l.status === fStatus)
  ), [logs, fUser, fDevice, fAction, fStatus]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="relative col-span-2 md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={fUser} onChange={e => setFUser(e.target.value)} placeholder="Filter by user…" className="w-full bg-input border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono" />
        </div>
        <input value={fDevice} onChange={e => setFDevice(e.target.value)} placeholder="Device ID…" className={sel} />
        <select value={fAction} onChange={e => setFAction(e.target.value)} className={sel}><option value="">All actions</option>{ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}</select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} className={sel}><option value="">All statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        {isLoading ? <div className="p-8 text-center text-xs text-muted-foreground">Loading…</div> : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No toggle actions logged yet. This populates once ElePhone telecom toggles fire via /api/telecom/toggle.</div>
        ) : (
          <table className="w-full text-xs min-w-[960px]">
            <thead className="bg-secondary/40"><tr className="border-b border-border">
              {['Time', 'User', 'Device', 'Action', 'Status', 'Duration', 'Cost', 'Error'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="border-b border-border/40 hover:bg-secondary/20">
                  <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{l.timestamp ? new Date(l.timestamp).toLocaleString() : '—'}</td>
                  <td className="px-3 py-2 font-mono text-[10px]">{l.user_id?.slice(-8) || '—'}</td>
                  <td className="px-3 py-2 font-mono text-[10px]">{l.device_id || '—'}</td>
                  <td className="px-3 py-2">{l.action || '—'}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] font-bold uppercase ${STATUS_CLASS[l.status] || 'text-muted-foreground'}`}>{l.status || '—'}</span></td>
                  <td className="px-3 py-2 font-mono">{l.duration_ms != null ? `${l.duration_ms}ms` : '—'}</td>
                  <td className="px-3 py-2 font-mono">{l.cost_usd != null ? `$${l.cost_usd}` : '—'}</td>
                  <td className="px-3 py-2 text-[10px] text-destructive max-w-[200px] truncate" title={l.error_message || ''}>{l.error_message || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}