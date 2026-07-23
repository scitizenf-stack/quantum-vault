import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Gauge, AlertTriangle, BarChart2, ChevronRight } from 'lucide-react';

export default function AIInsights() {
  const { canView } = useRBAC();

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ['insight-signals'],
    queryFn: () => base44.entities.InsightSignal.list('-created_date', 5),
  });

  const { data: global } = useQuery({
    queryKey: ['cg-global'],
    queryFn: () => fetch('https://api.coingecko.com/api/v3/global').then(r => r.json()),
    refetchInterval: 60000,
  });

  if (!canView('ai-insights')) return <AccessDenied section="AI Insights" />;

  const d = global?.data;
  const change = d?.market_cap_change_percentage_24h_usd || 0;

  const subpages = [
    { label: 'Overview', path: '/ai-insights/overview', icon: Brain, desc: 'Trending coins and global metrics' },
    { label: 'Signals', path: '/ai-insights/signals', icon: TrendingUp, desc: 'BUY/SELL/HOLD/WATCH signals' },
    { label: 'Sentiment', path: '/ai-insights/sentiment', icon: Gauge, desc: 'Fear & greed proxy gauge' },
    { label: 'Risk Score', path: '/ai-insights/risk', icon: BarChart2, desc: 'Portfolio risk analysis' },
    { label: 'Anomalies', path: '/ai-insights/anomalies', icon: AlertTriangle, desc: 'Unusual activity flags' },
    { label: 'AI Advisor', path: '/ai-insights/advisor', icon: Brain, desc: 'Data-driven portfolio insights' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Insights</h1>
        <p className="text-muted-foreground text-sm">Data-driven analysis from CoinGecko and your portfolio</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Market Cap', value: d ? `$${(d.total_market_cap?.usd / 1e12).toFixed(2)}T` : '—' },
          { label: 'BTC Dominance', value: d ? `${d.market_cap_percentage?.btc?.toFixed(1)}%` : '—' },
          { label: '24h Change', value: d ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '—', color: change >= 0 ? 'text-accent' : 'text-destructive' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color || ''}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subpages.map(sp => {
          const Icon = sp.icon;
          return (
            <Link key={sp.path} to={sp.path} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{sp.label}</p>
                  <p className="text-xs text-muted-foreground">{sp.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}