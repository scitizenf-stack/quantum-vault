import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain } from 'lucide-react';
import { useOracleDashboard } from '@/lib/useOracleData';

export default function AIAdvisor() {
  const { canView } = useRBAC();
  const { data: oracleData } = useOracleDashboard();
  const prices = oracleData ? { SOL: oracleData.sol_usd, BTC: oracleData.btc_usd, ETH: oracleData.eth_usd, PAXG: oracleData.gold_usd, XAU: oracleData.gold_usd } : {};
  const [insights, setInsights] = useState([]);

  const { data: assets = [], isLoading: aLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
  });

  const { data: global } = useQuery({
    queryKey: ['cg-global'],
    queryFn: () => fetch('https://api.coingecko.com/api/v3/global').then(r => r.json()),
  });

  useEffect(() => {
    if (!assets.length) return;

    const totalValue = assets.reduce((s, a) => s + (a.quantity || 0) * (prices?.[a.symbol] || a.current_price || 0), 0);
    const generated = [];

    // Portfolio concentration
    assets.forEach(a => {
      const val = (a.quantity || 0) * (prices?.[a.symbol] || a.current_price || 0);
      const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
      if (pct > 70) {
        generated.push({ id: `conc-${a.id}`, type: 'warning', text: `High concentration: ${a.symbol} represents ${pct.toFixed(0)}% of your portfolio ($${val.toFixed(2)}). Consider diversifying to reduce single-asset risk.` });
      }
    });

    // Market sentiment
    const change = global?.data?.market_cap_change_percentage_24h_usd;
    if (change !== undefined) {
      generated.push({
        id: 'sentiment',
        type: 'info',
        text: `Global market cap changed ${change >= 0 ? '+' : ''}${change?.toFixed(2)}% in 24h. BTC dominance: ${global?.data?.market_cap_percentage?.btc?.toFixed(1)}%. ${change > 3 ? 'Bullish momentum — monitor for reversal.' : change < -3 ? 'Bearish pressure — risk-off environment.' : 'Markets are ranging sideways.'}`,
      });
    }

    // SOL and PAXG specific
    const sol = assets.find(a => a.symbol === 'SOL');
    const paxg = assets.find(a => a.symbol === 'PAXG');
    if (sol) {
      const solPrice = prices?.SOL || sol.current_price || 0;
      const solVal = (sol.quantity || 0) * solPrice;
      generated.push({ id: 'sol', type: 'info', text: `SOL position: ${sol.quantity?.toFixed(4)} SOL @ $${solPrice.toFixed(2)} = $${solVal.toFixed(2)}. ${solPrice > (sol.avg_buy_price || 0) ? `Up ${(((solPrice - sol.avg_buy_price) / sol.avg_buy_price) * 100).toFixed(1)}% from avg buy price.` : `Down ${(((sol.avg_buy_price - solPrice) / sol.avg_buy_price) * 100).toFixed(1)}% from avg buy price.`}` });
    }
    if (paxg) {
      const paxgPrice = prices?.PAXG || paxg.current_price || 0;
      const paxgVal = (paxg.quantity || 0) * paxgPrice;
      generated.push({ id: 'paxg', type: 'info', text: `PAXG (gold-backed token): ${paxg.quantity?.toFixed(4)} oz @ $${paxgPrice.toFixed(2)} = $${paxgVal.toFixed(2)}. PAXG tracks spot gold price — provides inflation hedge.` });
    }

    generated.push({ id: 'disclaimer', type: 'disclaimer', text: 'These are data-driven insights computed from your portfolio, Oracle prices, and CoinGecko data. They are not live AI generation and not financial advice.' });

    setInsights(generated);
  }, [assets, prices, global]);

  if (!canView('ai-insights')) return <AccessDenied section="AI Insights" />;

  const TYPE_STYLES = {
    warning: 'border-l-4 border-yellow-500 bg-yellow-500/5',
    info: 'border-l-4 border-primary bg-primary/5',
    disclaimer: 'border-l-4 border-muted bg-muted/30 text-muted-foreground',
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">AI Advisor</h1>
          <p className="text-muted-foreground text-sm">Data-driven insights (not live AI generation)</p>
        </div>
      </div>

      <div className="space-y-3">
        {aLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) :
          insights.length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-8 text-center text-sm text-muted-foreground">
              No portfolio data found. Add holdings in Wallet to generate insights.
            </div>
          ) : insights.map(ins => (
            <div key={ins.id} className={`rounded-xl p-4 ${TYPE_STYLES[ins.type] || ''}`}>
              <p className="text-sm leading-relaxed">{ins.text}</p>
            </div>
          ))}
      </div>
    </div>
  );
}