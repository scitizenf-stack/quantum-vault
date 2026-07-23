import React from 'react';
import { useVpsPrices } from '@/lib/useVpsData';
import { useStripeBalance } from '@/lib/useOracleData';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

function fmt$(n) {
  return n != null ? `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
}

const PRICE_MAP  = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', XRP: 'xrp_usd', XAU: 'gold_usd', PAXG: 'gold_usd', USDC: 'usdc_usd' };
const CHANGE_MAP = { BTC: 'btc_change_24h', ETH: 'eth_change_24h', SOL: 'sol_change_24h', XRP: 'xrp_change_24h', XAU: 'gold_change_24h', PAXG: 'gold_change_24h' };

export default function TreasuryBalance() {
  const { data: prices, isLoading: pricesLoading } = useVpsPrices(30000);
  const stripe = useStripeBalance();
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
  });

  const o = prices || {};
  const isLoading = pricesLoading || assetsLoading;

  const enriched = assets.map(a => {
    const pk = PRICE_MAP[a.symbol];
    const ck = CHANGE_MAP[a.symbol];
    const livePrice = pk ? o[pk] : null;
    const price = livePrice || a.current_price || 0;
    return { ...a, livePrice: price, change: ck ? (o[ck] || null) : null, value: (a.quantity || 0) * price };
  });

  const cryptoTotal = enriched.reduce((s, a) => s + a.value, 0);

  const stripeAvailable = stripe.data?.available != null ? stripe.data.available / 100 : null;
  const stripePending   = stripe.data?.pending   != null ? stripe.data.pending   / 100 : null;
  const stripeOk = stripeAvailable != null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Balance</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {cryptoTotal > 0 || stripeOk
            ? <>Treasury total: <span className="text-foreground font-semibold">{fmt$(cryptoTotal + (stripeAvailable || 0))}</span></>
            : 'Add holdings in Wallet to see real balances'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Stripe Balance */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stripe Balance</p>
              {stripeOk && <CheckCircle className="w-3.5 h-3.5 text-accent" />}
            </div>
            {stripe.isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : stripeOk ? (
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
                <p className="text-xs text-muted-foreground">Connect Stripe in settings — key not configured on Oracle.</p>
              </div>
            )}
          </div>

          {/* Crypto Holdings */}
          {enriched.length === 0 ? (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 p-10 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm font-medium">No crypto holdings</p>
              <p className="text-xs text-muted-foreground">Add assets in the Wallet page to see live values here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enriched.map((a) => {
                const up = (a.change ?? 0) >= 0;
                return (
                  <div key={a.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{a.name}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-bold">{fmt$(a.value)}</p>
                      {a.change != null && (
                        <div className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-accent' : 'text-destructive'}`}>
                          {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {up ? '+' : ''}{Number(a.change).toFixed(2)}%
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {a.quantity} {a.symbol} @ {fmt$(a.livePrice)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}