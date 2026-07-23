import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { simApi } from '../qvApi';
import { toast } from 'sonner';
import { RefreshCw, Power, PowerOff, Ban, Smartphone, Loader2 } from 'lucide-react';

const STATUS_STYLES = {
  active: 'text-emerald-400 bg-emerald-500/10',
  inactive: 'text-gray-400 bg-gray-500/10',
  suspended: 'text-red-400 bg-red-500/10',
  activating: 'text-yellow-400 bg-yellow-500/10',
  error: 'text-red-400 bg-red-500/10',
  unregistered: 'text-gray-500 bg-gray-500/10',
};

export default function ConsoleDevicesTab() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(null);

  const { data: resp, isLoading } = useQuery({
    queryKey: ['sim-devices'],
    queryFn: () => simApi.list(),
    refetchInterval: 30000,
  });

  const devices = Array.isArray(resp) ? resp : (resp?.devices || resp?.data || []);

  const handleAction = async (deviceId, action) => {
    const key = `${deviceId}:${action}`;
    setBusy(key);
    try {
      const fn = action === 'activate' ? simApi.activate : action === 'deactivate' ? simApi.deactivate : simApi.suspend;
      await fn(deviceId);
      toast.success(`Device ${deviceId} ${action}d`, { duration: 3500 });
      qc.invalidateQueries({ queryKey: ['sim-devices'] });
    } catch (e) {
      toast.error(`${action} failed: ${e.message}`, { duration: 3500 });
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-16 text-center">
        <Smartphone className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-400">No SIM devices found</p>
        <p className="text-xs text-gray-600 mt-1">Devices will appear here once registered via /api/sim/list</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1a1a1a] text-gray-500">
              <th className="text-left font-semibold px-4 py-3">Device ID</th>
              <th className="text-left font-semibold px-4 py-3">Client</th>
              <th className="text-left font-semibold px-4 py-3">Phone Number</th>
              <th className="text-left font-semibold px-4 py-3">SIM Status</th>
              <th className="text-left font-semibold px-4 py-3">IP Address</th>
              <th className="text-left font-semibold px-4 py-3">Last Seen</th>
              <th className="text-right font-semibold px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d, i) => {
              const id = d.device_id || d.id || i;
              const status = (d.sim_status || d.status || 'unregistered').toLowerCase();
              const isActive = status === 'active';
              return (
                <tr key={id} className="border-b border-[#1a1a1a] hover:bg-[#121212] transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-300">{id}</td>
                  <td className="px-4 py-3 text-gray-400">{d.client_id || d.client || '—'}</td>
                  <td className="px-4 py-3 font-mono text-gray-300">{d.phone_number || d.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_STYLES[status] || STATUS_STYLES.unregistered}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-400">{d.ip_address || d.ip || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{d.last_seen ? new Date(d.last_seen).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {isActive ? (
                        <button
                          onClick={() => handleAction(id, 'deactivate')}
                          disabled={busy === `${id}:deactivate`}
                          className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 disabled:opacity-40"
                        >
                          {busy === `${id}:deactivate` ? <Loader2 className="w-3 h-3 animate-spin" /> : <PowerOff className="w-3 h-3" />}
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(id, 'activate')}
                          disabled={busy === `${id}:activate`}
                          className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40"
                        >
                          {busy === `${id}:activate` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(id, 'suspend')}
                        disabled={busy === `${id}:suspend` || status === 'suspended'}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-40"
                      >
                        {busy === `${id}:suspend` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}