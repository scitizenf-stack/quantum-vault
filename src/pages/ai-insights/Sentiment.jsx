import { useQuery } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';

function getSentiment(change) {
  const score = Math.min(100, Math.max(0, 50 + change * 2));
  if (score < 25) return { label: 'Extreme Fear', color: 'text-red-500', bg: 'bg-red-500', score };
  if (score < 45) return { label: 'Fear', color: 'text-orange-400', bg: 'bg-orange-400', score };
  if (score < 55) return { label: 'Neutral', color: 'text-yellow-400', bg: 'bg-yellow-400', score };
  if (score < 75) return { label: 'Greed', color: 'text-lime-400', bg: 'bg-lime-400', score };
  return { label: 'Extreme Greed', color: 'text-accent', bg: 'bg-accent', score };
}

export default function Sentiment() {
  const { canView } = useRBAC();

  const { data: global, isLoading } = useQuery({
    queryKey: ['cg-global'],
    queryFn: () => fetch('https://api.coingecko.com/api/v3/global').then(r => r.json()),
    refetchInterval: 60000,
  });

  if (!canView('ai-insights')) return <AccessDenied section="AI Insights" />;

  const d = global?.data;
  const change = d?.market_cap_change_percentage_24h_usd || 0;
  const sentiment = getSentiment(change);
  const btcDominance = d?.market_cap_percentage?.btc || 0;
  const totalMarketCap = d?.total_market_cap?.usd || 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Market Sentiment</h1>
        <p className="text-muted-foreground text-sm">Derived from CoinGecko global market data</p>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 flex flex-col items-center gap-6">
        {isLoading ? <Skeleton className="h-32 w-32 rounded-full" /> : (
          <>
            <div className="relative w-40 h-40 flex items-center justify-center rounded-full" style={{ background: `conic-gradient(hsl(var(--accent)) ${sentiment.score * 3.6}deg, hsl(var(--muted)) 0deg)` }}>
              <div className="absolute inset-3 rounded-full bg-card flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{Math.round(sentiment.score)}</span>
                <span className={`text-xs font-medium ${sentiment.color}`}>{sentiment.label}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">24h market cap change: <span className={change >= 0 ? 'text-accent' : 'text-destructive'}>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span></p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">BTC Dominance</p>
          {isLoading ? <Skeleton className="h-6 w-16" /> : (
            <>
              <p className="text-xl font-bold">{btcDominance.toFixed(1)}%</p>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${btcDominance}%` }} />
              </div>
            </>
          )}
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Market Cap</p>
          {isLoading ? <Skeleton className="h-6 w-24" /> : (
            <p className="text-xl font-bold">${(totalMarketCap / 1e12).toFixed(2)}T</p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">Data sourced from CoinGecko. Sentiment score derived from market cap change percentage. Not financial advice.</p>
    </div>
  );
}