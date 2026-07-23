import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Eye } from 'lucide-react';
import { useOracleDashboard } from '@/lib/useOracleData';

export default function Watchlist() {
  const { canView } = useRBAC();
  const qc = useQueryClient();
  const { data: oracleData } = useOracleDashboard();
  const prices = oracleData ? {
    SOL: oracleData.sol_usd, BTC: oracleData.btc_usd, ETH: oracleData.eth_usd,
    PAXG: oracleData.gold_usd, XAU: oracleData.gold_usd, XRP: oracleData.xrp_usd,
  } : {};
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', symbol: '', type: 'crypto', target_price: '', alert_enabled: false });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => base44.entities.Watchlist.list(),
    refetchInterval: 30000,
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Watchlist.create({ ...data, current_price: 0, change_24h: 0, target_price: +data.target_price }),
    onSuccess: () => { qc.invalidateQueries(['watchlist']); setAdding(false); setForm({ name: '', symbol: '', type: 'crypto', target_price: '', alert_enabled: false }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Watchlist.delete(id),
    onSuccess: () => qc.invalidateQueries(['watchlist']),
  });

  if (!canView('portfolio')) return <AccessDenied section="Watchlist" />;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Watchlist</h1>
        </div>
        <Button size="sm" onClick={() => setAdding(!adding)}>
          <Plus className="w-4 h-4 mr-1" /> Add Asset
        </Button>
      </div>

      {adding && (
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="bg-input border border-border rounded-lg px-3 py-2 text-sm" placeholder="Asset name (e.g. Bitcoin)" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className="bg-input border border-border rounded-lg px-3 py-2 text-sm" placeholder="Symbol (e.g. BTC)" value={form.symbol} onChange={e => setForm(p => ({ ...p, symbol: e.target.value.toUpperCase() }))} />
            <select className="bg-input border border-border rounded-lg px-3 py-2 text-sm" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {['crypto', 'stock', 'etf', 'commodity', 'bond'].map(t => <option key={t}>{t}</option>)}
            </select>
            <input type="number" className="bg-input border border-border rounded-lg px-3 py-2 text-sm" placeholder="Target price ($)" value={form.target_price} onChange={e => setForm(p => ({ ...p, target_price: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.alert_enabled} onCheckedChange={v => setForm(p => ({ ...p, alert_enabled: v }))} />
            <span className="text-sm text-muted-foreground">Enable price alert</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createMut.mutate(form)} disabled={!form.name || !form.symbol || createMut.isPending}>Add</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="grid grid-cols-5 text-xs text-muted-foreground px-4 py-2 border-b border-border">
          {['Asset', 'Symbol', 'Live Price', 'Target', 'Status'].map(h => <span key={h}>{h}</span>)}
        </div>
        {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 m-2 rounded" />) :
          items.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No watchlist items. Add assets to track their prices.
            </div>
          ) : items.map(item => {
            const livePrice = prices?.[item.symbol] || item.current_price || 0;
            const triggered = item.target_price > 0 && (item.change_24h >= 0 ? livePrice >= item.target_price : livePrice <= item.target_price);
            return (
              <div key={item.id} className={`grid grid-cols-5 items-center text-sm px-4 py-3 border-b border-border/50 hover:bg-muted/20 ${triggered ? 'bg-accent/5' : ''}`}>
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground font-mono text-xs">{item.symbol}</span>
                <span className="font-mono text-xs">{livePrice ? `$${livePrice.toLocaleString()}` : '—'}</span>
                <span className="font-mono text-xs">{item.target_price ? `$${item.target_price.toLocaleString()}` : '—'}</span>
                <div className="flex items-center gap-2">
                  {triggered && <Badge className="bg-accent/20 text-accent text-xs">Triggered</Badge>}
                  {item.alert_enabled && !triggered && <Badge variant="outline" className="text-xs">Alert On</Badge>}
                  <Button size="icon" variant="ghost" className="w-6 h-6 ml-auto text-muted-foreground hover:text-destructive" onClick={() => deleteMut.mutate(item.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}