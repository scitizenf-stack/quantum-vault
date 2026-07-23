import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const WORKER = 'https://quantum-vault-api-production.securecitizenfoundation.workers.dev';
const STALE_MS = 60 * 60 * 1000; // 1 hour

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h ago`;
}

export default function FusionCoreSyncBanner() {
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  const { data: latestTrade } = useQuery({
    queryKey: ['latest-trade'],
    queryFn: () => base44.entities.Trade.list('-created_date', 1),
    refetchInterval: 30000,
  });

  const lastDate = latestTrade?.[0]?.created_date;
  const ageMs = lastDate ? Date.now() - new Date(lastDate).getTime() : Infinity;
  const isStale = !lastDate || ageMs > STALE_MS;

  const syncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${WORKER}/api/omega/sync-fusion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
      const count = data.synced ?? data.trades_synced ?? data.count ?? 0;
      toast.success(`Fusion Core synced — ${count} trade${count !== 1 ? 's' : ''} pulled`);
      qc.invalidateQueries({ queryKey: ['latest-trade'] });
      qc.invalidateQueries({ queryKey: ['hft-trades'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    } catch (e) {
      toast.error(`Sync failed: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${
      isStale
        ? 'bg-destructive/10 border-destructive/30'
        : 'bg-accent/10 border-accent/30'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        {isStale ? (
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className={`text-xs font-bold ${isStale ? 'text-destructive' : 'text-accent'}`}>
            {isStale
              ? 'Data Stale — Fusion Core not syncing'
              : 'Synced with Fusion Core'}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastDate
              ? `Last trade: ${new Date(lastDate).toLocaleString()} · ${timeAgo(lastDate)}`
              : 'No trade records found'}
          </p>
        </div>
      </div>
      <button
        onClick={syncNow}
        disabled={syncing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex-shrink-0"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing…' : 'Sync Now'}
      </button>
    </div>
  );
}