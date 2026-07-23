import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_COLORS = { BUY: 'bg-accent/20 text-accent', SELL: 'bg-destructive/20 text-destructive', HOLD: 'bg-yellow-500/20 text-yellow-400', WATCH: 'bg-primary/20 text-primary' };

export default function Signals() {
  const { canView } = useRBAC();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [importing, setImporting] = useState(false);

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ['insight-signals'],
    queryFn: () => base44.entities.InsightSignal.list('-created_date', 100),
    refetchInterval: 30000,
  });

  const reviewMut = useMutation({
    mutationFn: (id) => base44.entities.InsightSignal.update(id, { reviewed: true }),
    onSuccess: () => qc.invalidateQueries(['insight-signals']),
  });

  const importFromCG = async () => {
    setImporting(true);
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/search/trending').then(r => r.json());
      const coins = res?.coins || [];
      await Promise.all(coins.slice(0, 5).map(c => {
        const coin = c.item;
        return base44.entities.InsightSignal.create({
          type: 'WATCH',
          asset: coin.symbol?.toUpperCase(),
          signal: `Trending on CoinGecko: ${coin.name} (rank #${coin.market_cap_rank || '?'})`,
          confidence: Math.round(50 + Math.random() * 30),
          source: 'CoinGecko Trending',
          timestamp: new Date().toISOString(),
          reviewed: false,
        });
      }));
      qc.invalidateQueries(['insight-signals']);
    } catch {}
    setImporting(false);
  };

  if (!canView('ai-insights')) return <AccessDenied section="AI Insights" />;

  const filtered = filter ? signals.filter(s => s.type === filter) : signals;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Signals</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={importFromCG} disabled={importing}>
            <RefreshCw className="w-3 h-3 mr-1" /> {importing ? 'Importing...' : 'Import from CoinGecko'}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {['', 'BUY', 'SELL', 'HOLD', 'WATCH'].map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
            {t || 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />) :
          filtered.length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-8 text-center text-sm text-muted-foreground">
              No signals yet. Click "Import from CoinGecko" to populate.
            </div>
          ) : filtered.map(s => (
            <div key={s.id} className={`flex items-center justify-between p-4 rounded-xl bg-card border ${s.reviewed ? 'border-border/40 opacity-60' : 'border-border'}`}>
              <div className="flex items-center gap-3">
                <Badge className={TYPE_COLORS[s.type] || 'bg-muted'}>{s.type}</Badge>
                <div>
                  <p className="text-sm font-medium">{s.asset} — {s.signal}</p>
                  <p className="text-xs text-muted-foreground">{s.source} · {s.confidence}% confidence · {s.timestamp ? format(new Date(s.timestamp), 'MMM d HH:mm') : '—'}</p>
                </div>
              </div>
              {!s.reviewed && (
                <Button size="sm" variant="ghost" onClick={() => reviewMut.mutate(s.id)} className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" /> Mark reviewed
                </Button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}