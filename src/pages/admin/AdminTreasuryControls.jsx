import { useVpsPrices } from '@/lib/useVpsData';
import { useStripeBalance } from '@/lib/useOracleData';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, AlertCircle, CheckCircle, Coins } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const PRICE_MAP = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', XRP: 'xrp_usd', XAU: 'gold_usd', PAXG: 'gold_usd', USDC: 'usdc_usd' };

function fmt$(n) {
  return n != null ? `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
}

export default function AdminTreasuryControls() {
  const { canAdmin } = useRBAC();
  const { data: prices, isLoading: pricesLoading } = useVpsPrices(30000);
  const stripe = useStripeBalance();
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
    refetchInterval: 30000,
  });

  if (!canAdmin()) return <AccessDenied section="Treasury Controls" />;

  const o = prices || {};
  const enriched = assets.map(a => {
    const pk = PRICE_MAP[a.symbol];
    const livePrice = pk ? o[pk] : null;
    const price = livePrice || a.current_price || 0;
    return { ...a, price, value: (a.quantity || 0) * price };
  });

  const solAsset  = enriched.find(a => a.symbol === 'SOL');
  const paxgAsset = enriched.find(a => a.symbol === 'PAXG' || a.symbol === 'XAU');
  const solPrice  = o.sol_usd  ?? null;
  const paxgPrice = o.gold_usd ?? null;
  const solValue  = solAsset?.value ?? null;
  const paxgValue = paxgAsset?.value ?? null;
  const solQty    = solAsset?.quantity ?? null;
  const paxgQty   = paxgAsset?.quantity ?? null;

  const stripeAvailable = stripe.data?.available != null ? stripe.data.available / 100 : null;
  const stripePending   = stripe.data?.pending   != null ? stripe.data.pending   / 100 : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Treasury Controls</h1>
        <p className="text-xs text-muted-foreground mt-1">Stripe balance + on-chain holdings</p>
      </div>

      {/* Stripe */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Stripe Balance</p>
          {stripeAvailable != null && <CheckCircle className="w-3.5 h-3.5 text-accent" />}
        </div>
        {stripe.isLoading ? <Skeleton className="h-10 w-40" /> :
          stripeAvailable != null ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Available</p>
                <p className="text-2xl font-bold font-mono">{fmt$(stripeAvailable)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold font-mono">{fmt$(stripePending)}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <p className="text-xs text-muted-foreground">Add STRIPE_SECRET_KEY to Base44 secrets to enable Stripe.</p>
            </div>
          )
        }
      </div>

      {/* On-chain */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-4 h-4 text-accent" />
          <p className="text-sm font-semibold">On-Chain Holdings (Live)</p>
        </div>
        {pricesLoading || assetsLoading ? <Skeleton className="h-16 w-full" /> : enriched.length === 0 ? (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-muted-foreground">No holdings found. Add assets in Wallet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground mb-1">SOL · {solQty ?? '—'} @ {fmt$(solPrice)}</p>
              <p className="text-xl font-bold font-mono text-accent">{fmt$(solValue)}</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground mb-1">PAXG · {paxgQty ?? '—'} oz @ {fmt$(paxgPrice)}</p>
              <p className="text-xl font-bold font-mono text-yellow-400">{fmt$(paxgValue)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}