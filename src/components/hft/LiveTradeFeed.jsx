import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export default function LiveTradeFeed() {
  const qc = useQueryClient();
  const [paperMode, setPaperMode] = useState(true);
  const [syncing, setSyncing] = useState(null);
  const [syncedIds, setSyncedIds] = useState([]);

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['hft-trades'],
    queryFn: () => base44.entities.Trade.list('-created_date', 100),
    refetchInterval: 10000,
  });

  const today = new Date().toDateString();
  const todayTrades = trades.filter(t => new Date(t.timestamp || t.created_date).toDateString() === today);
  const totalVolume = todayTrades.reduce((s, t) => s + (t.total || 0), 0);
  const totalPnl = todayTrades.reduce((s, t) => s + (t.pnl || 0), 0);

  const syncOne = async (t) => {
    setSyncing(t.id);
    try {
      const res = await base44.functions.invoke('syncTradeToElephone', { trade: t });
      if (res.data?.failed) toast.error(`Sync failed (HTTP ${res.data.results?.find(r => !r.ok)?.status})`);
      else { toast.success(`Synced ${t.pair} ${t.side} → ElePhone`); setSyncedIds(p => p.includes(t.id) ? p : [...p, t.id]); }
    } catch (e) { toast.error(`Sync error: ${e.message}`); }
    finally { setSyncing(null); }
  };

  const syncAll = async () => {
    setSyncing('all');
    try {
      const res = await base44.functions.invoke('syncTradeToElephone', { trades: todayTrades });
      toast.success(`Synced ${res.data?.synced || 0} trades → ElePhone${res.data?.failed ? ` · ${res.data.failed} failed` : ''}`);
      qc.invalidateQueries({ queryKey: ['hft-trades'] });
    } catch (e) { toast.error(`Sync error: ${e.message}`); }
    finally { setSyncing(null); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">Live Trade Feed</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaperMode(p => !p)} className={`relative w-9 h-5 rounded-full transition-colors ${paperMode ? 'bg-yellow-500' : 'bg-secondary'}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${paperMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-[10px] text-muted-foreground">Paper Mode {paperMode ? 'ON' : 'OFF'}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-secondary/40 p-2 text-center"><p className="text-[9px] text-muted-foreground uppercase">Trades Today</p><p className="text-sm font-mono font-bold">{todayTrades.length}</p></div>
        <div className="rounded-lg bg-secondary/40 p-2 text-center"><p className="text-[9px] text-muted-foreground uppercase">Volume</p><p className="text-sm font-mono font-bold">${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p></div>
        <div className="rounded-lg bg-secondary/40 p-2 text-center"><p className="text-[9px] text-muted-foreground uppercase">P&L Today</p><p className={`text-sm font-mono font-bold ${totalPnl >= 0 ? 'text-accent' : 'text-destructive'}`}>{totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}</p></div>
      </div>

      <Button size="sm" variant="outline" className="w-full text-xs gap-1.5" onClick={syncAll} disabled={syncing === 'all' || todayTrades.length === 0}>
        <Send className="w-3.5 h-3.5" /> {syncing === 'all' ? 'Syncing...' : 'Sync All Today → ElePhone'}
      </Button>

      <div className="bg-card border border-border rounded-xl overflow-hidden max-h-[440px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-secondary/90">
            <tr className="border-b border-border">
              {['Time', 'Pair', 'Side', 'Qty', 'Price', 'P&L', ''].map(h => <th key={h} className="text-left px-2 py-2 text-[10px] font-semibold text-muted-foreground">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="p-1">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 my-1" />)}</td></tr>
            ) : trades.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No trades</td></tr>
            ) : trades.map(t => (
              <tr key={t.id} className="border-b border-border/30 hover:bg-secondary/20">
                <td className="px-2 py-1.5 font-mono text-[10px] text-muted-foreground">{new Date(t.timestamp || t.created_date).toLocaleTimeString('en-US', { hour12: false })}</td>
                <td className="px-2 py-1.5 font-mono">{t.pair}</td>
                <td className="px-2 py-1.5"><Badge variant={t.side === 'BUY' ? 'default' : 'destructive'} className="text-[9px]">{t.side}</Badge></td>
                <td className="px-2 py-1.5 font-mono">{t.qty}</td>
                <td className="px-2 py-1.5 font-mono">${(t.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className={`px-2 py-1.5 font-mono font-bold ${(t.pnl || 0) >= 0 ? 'text-accent' : 'text-destructive'}`}>{t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}` : '—'}</td>
                <td className="px-2 py-1.5">{syncedIds.includes(t.id) ? <span className="text-[9px] text-accent font-bold">✓ Synced</span> : <button onClick={() => syncOne(t)} disabled={syncing === t.id} className="text-[9px] text-primary hover:underline disabled:opacity-50">{syncing === t.id ? '...' : '↗ Ele'}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}