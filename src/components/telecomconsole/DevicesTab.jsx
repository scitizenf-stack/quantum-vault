import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Power, PowerOff, RefreshCw, Smartphone } from 'lucide-react';

const WORKER = 'https://quantum-vault-api-production.securecitizenfoundation.workers.dev';
const API = `${WORKER}/api/sim`;

const STATUS_CLASS = {
  unregistered: 'bg-muted-foreground/15 text-muted-foreground',
  activating: 'bg-yellow-500/15 text-yellow-400',
  active: 'bg-accent/15 text-accent',
  inactive: 'bg-muted-foreground/15 text-muted-foreground',
  error: 'bg-destructive/15 text-destructive',
  suspended: 'bg-orange-500/15 text-orange-400',
};

export default function DevicesTab() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const { data: devices = [], isLoading } = useQuery({ queryKey: ['devices'], queryFn: () => base44.entities.Device.list() });

  const syncDevices = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${WORKER}/api/telecom/devices/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
      const count = data.synced ?? data.count ?? 0;
      toast.success(`${count} device${count !== 1 ? 's' : ''} synced from VPS`);
      qc.invalidateQueries({ queryKey: ['devices'] });
    } catch (e) {
      toast.error(`Device sync failed: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const toggle = async (d, action) => {
    setBusy(d.id);
    const endpoint = action === 'activate' ? '/activate' : '/deactivate';
    let logStatus = 'pending';
    let errMsg = '';
    const reqBody = { device_id: d.device_id, user_id: d.user_id };
    try {
      const res = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
      logStatus = 'success';
      await base44.entities.Device.update(d.id, { status: action === 'activate' ? 'active' : 'inactive' });
      toast.success(`${d.device_id} ${action}d`);
    } catch (e) {
      logStatus = 'failed';
      errMsg = e.message;
      await base44.entities.Device.update(d.id, { status: 'error' }).catch(() => {});
      toast.error(`${action} failed: ${e.message}`);
    } finally {
      await base44.entities.ToggleLog.create({
        user_id: d.user_id || '', device_id: d.device_id, action,
        status: logStatus, error_message: errMsg, timestamp: new Date().toISOString(),
        request_payload: JSON.stringify(reqBody),
      }).catch(() => {});
      qc.invalidateQueries({ queryKey: ['devices'] });
      qc.invalidateQueries({ queryKey: ['toggle-logs'] });
      setBusy(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-x-auto">
      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Loading devices…</div>
      ) : devices.length === 0 ? (
        <div className="p-12 text-center">
          <Smartphone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">No devices synced yet from VPS device manager.</p>
          <p className="text-xs text-muted-foreground/70 mb-4">Devices will appear here once telecom toggles are used from ElePhone.</p>
          <button onClick={syncDevices} disabled={syncing} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync Devices from VPS'}
          </button>
        </div>
      ) : (
        <table className="w-full text-xs min-w-[960px]">
          <thead className="bg-secondary/40">
            <tr className="border-b border-border">
              {['Device ID', 'User', 'Antenna', 'SIM', 'Status', 'Plan', 'IP', 'SIP', 'Signal', 'Last Seen', 'Actions'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {devices.map(d => (
              <tr key={d.id} className="border-b border-border/40 hover:bg-secondary/20">
                <td className="px-3 py-2 font-mono font-semibold">{d.device_id}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{d.user_id?.slice(-8) || '—'}</td>
                <td className="px-3 py-2">{d.antenna_type || '—'}</td>
                <td className="px-3 py-2">{d.sim_type || '—'}</td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_CLASS[d.status] || ''}`}>{d.status || '—'}</span></td>
                <td className="px-3 py-2 font-mono text-[10px]">{d.plan_id || '—'}</td>
                <td className="px-3 py-2 font-mono text-[10px]">{d.ip_address || '—'}</td>
                <td className="px-3 py-2 font-mono text-[10px]">{d.sip_extension || '—'}</td>
                <td className="px-3 py-2 font-mono">{d.signal_strength != null ? d.signal_strength : '—'}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{d.last_seen ? new Date(d.last_seen).toLocaleDateString() : '—'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => toggle(d, 'activate')} disabled={busy === d.id} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-50">
                      {busy === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}Activate
                    </button>
                    <button onClick={() => toggle(d, 'deactivate')} disabled={busy === d.id} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50">
                      <PowerOff className="w-3 h-3" />Deactivate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}