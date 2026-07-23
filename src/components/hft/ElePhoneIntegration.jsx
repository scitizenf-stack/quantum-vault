import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smartphone, ExternalLink, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ElePhoneIntegration() {
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const { data: trades = [] } = useQuery({
    queryKey: ['hft-trades'],
    queryFn: () => base44.entities.Trade.list('-created_date', 100),
  });

  const syncAll = async () => {
    setSyncing(true);
    try {
      const today = new Date().toDateString();
      const todayTrades = trades.filter(t => new Date(t.timestamp || t.created_date).toDateString() === today);
      const res = await base44.functions.invoke('syncTradeToElephone', { trades: todayTrades });
      toast.success(`Synced ${res.data?.synced || 0} trades → ElePhone${res.data?.failed ? ` · ${res.data.failed} failed` : ''}`);
      qc.invalidateQueries({ queryKey: ['hft-trades'] });
    } catch (e) { toast.error(`Sync error: ${e.message}`); }
    finally { setSyncing(false); }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">QuantumVault ElePhone</p>
            <p className="text-[10px] text-muted-foreground font-mono">https://spectral-quantum-link-core.base44.app/api</p>
          </div>
        </div>
        <Badge className="bg-accent/20 text-accent border-accent/30">● ACTIVE</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="rounded-lg bg-secondary/40 p-2"><p className="text-[9px] text-muted-foreground uppercase">Data Flow</p><p className="text-xs font-semibold">Transaction Sync</p></div>
        <div className="rounded-lg bg-secondary/40 p-2"><p className="text-[9px] text-muted-foreground uppercase">Data Flow</p><p className="text-xs font-semibold">Wallet Balance Sync</p></div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="text-xs gap-1.5" asChild>
          <a href="https://spectral-quantum-link-core.base44.app" target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5" /> View ElePhone Dashboard</a>
        </Button>
        <Button size="sm" className="text-xs gap-1.5" onClick={syncAll} disabled={syncing}><Send className="w-3.5 h-3.5" /> {syncing ? 'Syncing...' : 'Sync All Today'}</Button>
      </div>
    </div>
  );
}