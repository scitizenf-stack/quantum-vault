import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const SYNC_URL = 'https://quantum-vault-api-production.securecitizenfoundation.workers.dev/api/omega/sync-fusion';
const API_KEY = 'qv_live_d54cf7079c6c809ba2d0378839559e2d';
const ONE_HOUR = 60 * 60 * 1000;

export default function FusionSyncBanner() {
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  const { data: trades = [] } = useQuery({
    queryKey: ['latest-trade'],
    queryFn: () => base44.entities.Trade.list('-created_date', 1),
    refetchInterval: 30000,
  });

  const lastTrade = trades[0];
  const lastDate = lastTrade?.created_date ? new Date(lastTrade.created_date) : null;
  const stale = !lastDate || (Date.now() - lastDate.getTime()) > ONE_HOUR;

  const syncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch(SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
      const count = data.synced ?? data.trades_synced ?? data.count ?? '?';
      toast.success(`Fusion Core synced — ${count} trades synced`);
      qc.invalidateQueries({ queryKey: ['latest-trade'] });
      qc.invalidateQueries({ queryKey: ['trades'] });
    } catch (e) {
      toast.error(`Sync failed: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  if (stale) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive">
            ⚠️ Fusion Core sync stale — last update: {lastDate ? lastDate.toLocaleString() : 'never'}. Live engine uptime may not be reflected here.
          </p>
        </div>
        <button onClick={syncNow} disabled={syncing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive/20 text-destructive hover:bg-destructive/30 disabled:opacity-50 whitespace-nowrap">
          {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Sync Fusion Core Now
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 p-3">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
        <p className="text-xs text-accent">✓ Synced with Fusion Core</p>
      </div>
      <button onClick={syncNow} disabled={syncing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-50 whitespace-nowrap">
        {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        Sync Now
      </button>
    </div>
  );
}