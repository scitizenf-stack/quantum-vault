import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';
import { useOracleDashboard } from '@/lib/useOracleData';

function scoreColor(score) {
  if (score < 40) return 'text-accent';
  if (score < 70) return 'text-yellow-400';
  return 'text-destructive';
}

export default function RiskScore() {
  const { canView } = useRBAC();
  const { data: oracleData } = useOracleDashboard();
  const prices = oracleData ? { SOL: oracleData.sol_usd, BTC: oracleData.btc_usd, ETH: oracleData.eth_usd, PAXG: oracleData.gold_usd, XAU: oracleData.gold_usd } : {};

  const { data: assets = [], isLoading: aLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
  });

  const { data: staking = [], isLoading: sLoading } = useQuery({
    queryKey: ['staking-positions'],
    queryFn: () => base44.entities.StakingPosition.list(),
  });

  if (!canView('ai-insights')) return <AccessDenied section="AI Insights" />;

  const isLoading = aLoading || sLoading;

  const totalValue = assets.reduce((s, a) => {
    const price = prices?.[a.symbol] || a.current_price || 0;
    return s + (a.quantity || 0) * price;
  }, 0);

  const factors = [];
  let totalScore = 0;

  // Concentration risk
  if (totalValue > 0) {
    const topAsset = assets.reduce((max, a) => {
      const val = (a.quantity || 0) * (prices?.[a.symbol] || a.current_price || 0);
      return val > max.val ? { val, name: a.symbol } : max;
    }, { val: 0, name: '' });
    const concentration = totalValue > 0 ? (topAsset.val / totalValue) * 100 : 0;
    const concScore = concentration > 80 ? 70 : concentration > 50 ? 40 : 20;
    factors.push({ name: 'Concentration Risk', description: `Top asset: ${topAsset.name} = ${concentration.toFixed(0)}% of portfolio`, score: concScore });
    totalScore += concScore;
  }

  // Volatility proxy from 24h change
  const avgChange = assets.length ? assets.reduce((s, a) => s + Math.abs(a.change_24h || 0), 0) / assets.length : 0;
  const volScore = avgChange > 10 ? 80 : avgChange > 5 ? 50 : 20;
  factors.push({ name: 'Volatility Risk', description: `Avg 24h price change: ${avgChange.toFixed(1)}%`, score: volScore });
  totalScore += volScore;

  // Liquidity risk from staking
  const stakedValue = staking.reduce((s, p) => s + (p.amount || 0), 0);
  const stakePct = totalValue > 0 ? (stakedValue / totalValue) * 100 : 0;
  const liqScore = stakePct > 70 ? 70 : stakePct > 40 ? 40 : 15;
  factors.push({ name: 'Liquidity Risk', description: `${stakePct.toFixed(0)}% of portfolio staked/illiquid`, score: liqScore });
  totalScore += liqScore;

  const overallScore = factors.length ? Math.round(totalScore / factors.length) : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Risk Score</h1>
        <p className="text-muted-foreground text-sm">Computed from your portfolio data</p>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 flex flex-col items-center gap-4">
        {isLoading ? <Skeleton className="h-24 w-24 rounded-full" /> : (
          <>
            <div className={`text-6xl font-bold ${scoreColor(overallScore)}`}>{overallScore}</div>
            <p className={`text-sm font-medium ${scoreColor(overallScore)}`}>
              {overallScore < 40 ? 'Low Risk' : overallScore < 70 ? 'Medium Risk' : 'High Risk'}
            </p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-accent via-yellow-400 to-destructive" style={{ width: `${overallScore}%` }} />
            </div>
          </>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />) :
          factors.map(f => (
            <div key={f.name} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </div>
              <span className={`text-xl font-bold ${scoreColor(f.score)}`}>{f.score}</span>
            </div>
          ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">Risk score is computed from live entity data. Not financial advice.</p>
    </div>
  );
}