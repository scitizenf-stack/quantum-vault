import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smartphone, ExternalLink, Send } from 'lucide-react';
import { toast } from 'sonner';

const ELEPHONE_URL = 'https://spectral-quantum-link-core.base44.app';
const extractList = (d) => {
  const data = d?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export default function ElePhonePanel() {
  const [syncing, setSyncing] = useState(false);

  const { data: appsResp } = useQuery({
    queryKey: ['elephone-applications'],
    queryFn: () => base44.functions.invoke('elephoneApi', { method: 'GET', entity: 'TradingApplication' }),
    refetchInterval: 30000,
  });
  const { data: acctsResp } = useQuery({
    queryKey: ['elephone-accounts'],
    queryFn: () => base44.functions.invoke('elephoneApi', { method: 'GET', entity: 'TradingAccount' }),
    refetchInterval: 30000,
  });

  const apps = extractList(appsResp);
  const accounts = extractList(acctsResp);
  const pending = apps.filter(a => (a.status || 'pending') === 'pending').length;
  const approved = accounts.filter(a => a.status === 'active').length;

  const syncTrades = async () => {
    setSyncing(true);
    try {
      const trades = await base44.entities.Trade.list('-created_date', 100);
      const today = new Date().toDateString();
      const todayTrades = trades.filter(t => t.status === 'FILLED' && new Date(t.timestamp || t.created_date).toDateString() === today);
      const res = await base44.functions.invoke('syncTradeToElephone', { trades: todayTrades });
      toast.success(`Synced ${res.data?.synced || 0} trades → ElePhone${res.data?.failed ? ` · ${res.data.failed} failed` : ''}`);
    } catch (e) { toast.error(`Sync error: ${e.message}`); }
    finally { setSyncing(false); }
  };

  return (
    <div className="rounded-xl bg-card border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold">ElePhone Integration</h2>
        </div>
        <Badge className="bg-accent/20 text-accent">● CONNECTED</Badge>
      </div>
      <p className="text-xs text-muted-foreground font-mono">{ELEPHONE_URL}</p>
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs">Pending: {pending}</Badge>
        <Badge variant="outline" className="text-xs">Approved Traders: {approved}</Badge>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-xs gap-1.5" asChild>
          <a href={ELEPHONE_URL} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5" /> View ElePhone App</a>
        </Button>
        <Button size="sm" className="text-xs gap-1.5" onClick={syncTrades} disabled={syncing}><Send className="w-3.5 h-3.5" /> {syncing ? 'Syncing...' : 'Sync Trades to ElePhone'}</Button>
      </div>
    </div>
  );
}