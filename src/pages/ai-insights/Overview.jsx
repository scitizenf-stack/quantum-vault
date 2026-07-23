import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AIInsightsOverview() {
  const { canView } = useRBAC();

  const { data: trending, isLoading: tLoading } = useQuery({
    queryKey: ['cg-trending'],
    queryFn: () => fetch('https://api.coingecko.com/api/v3/search/trending').then(r => r.json()),
    refetchInterval: 60000,
  });

  const { data: global, isLoading: gLoading } = useQuery({
    queryKey: ['cg-global'],
    queryFn: () => fetch('https://api.coingecko.com/api/v3/global').then(r => r.json()),
    refetchInterval: 60000,
  });

  const { data: signals = [], isLoading: sLoading } = useQuery({
    queryKey: ['insight-signals'],
    queryFn: () => base44.entities.InsightSignal.list('-created_date', 10),
  });

  if (!canView('ai-insights')) return <AccessDenied section="AI Insights" />;

  const isLoading = tLoading || gLoading || sLoading;
  const d = global?.data;
  const coins = trending?.coins || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Insights Overview</h1>
        <p className="text-muted-foreground text-sm">Powered by CoinGecko market data</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Market Cap', value: d ? `$${(d.total_market_cap?.usd / 1e12).toFixed(2)}T` : '—' },
          { label: 'BTC Dominance', value: d ? `${d.market_cap_percentage?.btc?.toFixed(1)}%` : '—' },
          { label: '24h Change', value: d ? `${d.market_cap_change_percentage_24h_usd?.toFixed(2)}%` : '—', color: d?.market_cap_change_percentage_24h_usd >= 0 ? 'text-accent' : 'text-destructive' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            {isLoading ? <Skeleton className="h-6 w-20 mt-1" /> : <p className={`text-xl font-bold mt-1 ${s.color || ''}`}>{s.value}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-sm font-medium mb-3">Trending Coins (CoinGecko)</p>
          {isLoading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 mb-2 rounded" />) :
            coins.length === 0 ? <p className="text-sm text-muted-foreground">No trending data.</p> :
            coins.slice(0, 7).map((c, i) => {
              const coin = c.item;
              return (
                <div key={coin.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    <img src={coin.thumb} alt={coin.name} className="w-5 h-5 rounded-full" onError={e => e.target.style.display = 'none'} />
                    <span className="text-sm">{coin.name}</span>
                    <span className="text-xs text-muted-foreground">{coin.symbol}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">#{coin.market_cap_rank || '?'}</Badge>
                </div>
              );
            })}
        </div>

        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-sm font-medium mb-3">Recent Signals</p>
          {sLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 mb-2 rounded" />) :
            signals.length === 0 ? <p className="text-sm text-muted-foreground">No signals. Visit the Signals tab to import.</p> :
            signals.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm">{s.asset}</span>
                <Badge className={{ BUY: 'bg-accent/20 text-accent', SELL: 'bg-destructive/20 text-destructive', HOLD: 'bg-yellow-500/20 text-yellow-400', WATCH: 'bg-primary/20 text-primary' }[s.type]}>{s.type}</Badge>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}