import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, ExternalLink, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_COLORS = {
  buy: 'bg-accent/20 text-accent', sell: 'bg-destructive/20 text-destructive',
  transfer_in: 'bg-primary/20 text-primary', transfer_out: 'bg-muted text-muted-foreground',
  dividend: 'bg-yellow-500/20 text-yellow-400', interest: 'bg-yellow-500/20 text-yellow-400',
};

export default function Transactions() {
  const { canView } = useRBAC();
  const [filterType, setFilterType] = useState('');
  const [filterAsset, setFilterAsset] = useState('');
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 200),
    refetchInterval: 30000,
  });

  if (!canView('portfolio')) return <AccessDenied section="Transactions" />;

  const filtered = transactions.filter(t =>
    (!filterType || t.type === filterType) &&
    (!filterAsset || t.symbol?.toLowerCase().includes(filterAsset.toLowerCase()) || t.asset_name?.toLowerCase().includes(filterAsset.toLowerCase()))
  );

  const copyHash = async (hash) => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <ArrowUpDown className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Transactions</h1>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {['buy', 'sell', 'transfer_in', 'transfer_out', 'dividend', 'interest'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <input className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm" placeholder="Filter by asset..." value={filterAsset} onChange={e => setFilterAsset(e.target.value)} />
        <span className="text-xs text-muted-foreground self-center">{filtered.length} transactions</span>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="grid grid-cols-6 text-xs text-muted-foreground px-4 py-2 border-b border-border">
          {['Type', 'Asset', 'Amount', 'Price', 'Total', 'Date'].map(h => <span key={h}>{h}</span>)}
        </div>
        {isLoading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-10 m-2 rounded" />) :
          filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No transactions yet. Add holdings in Wallet to get started.
            </div>
          ) : filtered.map(t => (
            <div key={t.id} className="grid grid-cols-6 text-xs px-4 py-2.5 border-b border-border/50 hover:bg-muted/20 cursor-pointer" onClick={() => setSelected(t)}>
              <Badge className={TYPE_COLORS[t.type] || 'bg-muted text-muted-foreground w-fit'}>{t.type?.replace('_', ' ')}</Badge>
              <span className="font-medium">{t.symbol || t.asset_name}</span>
              <span className="font-mono">{t.quantity || '—'}</span>
              <span className="font-mono">{t.price_per_unit ? `$${t.price_per_unit.toFixed(4)}` : '—'}</span>
              <span className="font-mono">${(t.total_amount || 0).toFixed(2)}</span>
              <span className="text-muted-foreground">{t.created_date ? format(new Date(t.created_date), 'MMM d, yy') : '—'}</span>
            </div>
          ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Transaction Detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              {[
                ['Type', selected.type?.replace('_', ' ')],
                ['Asset', `${selected.asset_name} (${selected.symbol})`],
                ['Quantity', selected.quantity],
                ['Price/unit', selected.price_per_unit ? `$${selected.price_per_unit}` : '—'],
                ['Total', `$${selected.total_amount?.toFixed(2)}`],
                ['Fee', selected.fee ? `$${selected.fee}` : '—'],
                ['Status', selected.status],
                ['Date', selected.created_date ? format(new Date(selected.created_date), 'MMM d, yyyy HH:mm') : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v || '—'}</span>
                </div>
              ))}
              {selected.txHash && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tx Hash</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{selected.txHash.slice(0, 12)}...{selected.txHash.slice(-6)}</span>
                    <button onClick={() => copyHash(selected.txHash)} className="text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                    <a href={`https://solscan.io/tx/${selected.txHash}`} target="_blank" rel="noreferrer" className="text-primary"><ExternalLink className="w-3 h-3" /></a>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}