import React, { useState, useEffect } from 'react';
import { useVpsPrices } from '@/lib/useVpsData';
import { useStripeBalance } from '@/lib/useOracleData';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Plus, CreditCard, Trash2, Wifi } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import AddHoldingModal from '../components/wallet/AddHoldingModal';
import { cn } from '@/lib/utils';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import LiveBadge from '@/components/shared/LiveBadge';

const SOL_WALLET = 'Eida3teSJATMJW7BBqFZUKdrNXbr5ek7kGGftegBsxmp';

async function fetchSolanaBalance(address) {
  const res = await fetch('https://api.mainnet-beta.solana.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address] }),
    signal: AbortSignal.timeout(8000),
  });
  const json = await res.json();
  return json?.result?.value != null ? json.result.value / 1e9 : null;
}

function fmt$(n, dec = 2) {
  return n != null ? `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })}` : '—';
}

const PRICE_MAP = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', XRP: 'xrp_usd', XAU: 'gold_usd', PAXG: 'gold_usd', USDC: 'usdc_usd' };

export default function Wallet() {
  const { canView } = useRBAC();
  const [showAdd, setShowAdd] = useState(false);
  const [onChainSol, setOnChainSol] = useState(null);
  const [solFetchedAt, setSolFetchedAt] = useState(null);
  const qc = useQueryClient();
  const { data: prices, dataUpdatedAt, isLoading: pricesLoading } = useVpsPrices(30000);
  const stripe = useStripeBalance();

  useEffect(() => {
    const fetchSol = async () => {
      const bal = await fetchSolanaBalance(SOL_WALLET);
      if (bal != null) { setOnChainSol(bal); setSolFetchedAt(Date.now()); }
    };
    fetchSol();
    const t = setInterval(fetchSol, 60000);
    return () => clearInterval(t);
  }, []);

  const { data: dbAssets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
  });

  if (!canView('wallet')) return <AccessDenied section="Wallet" />;

  const isLoading = pricesLoading || assetsLoading;
  const o = prices || {};

  // Enrich assets with live prices
  const assets = dbAssets.map(a => {
    const pk = PRICE_MAP[a.symbol];
    const livePrice = pk ? o[pk] : null;
    const price = livePrice || a.current_price || 0;
    return { ...a, livePrice: price, value: (a.quantity || 0) * price };
  });

  const totalValue = assets.reduce((s, a) => s + a.value, 0);

  const handleDelete = async (id) => {
    await base44.entities.Asset.delete(id);
    qc.invalidateQueries({ queryKey: ['assets'] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">On-chain custody · Solana mainnet</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge timestamp={dataUpdatedAt} />
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Holding
          </Button>
        </div>
      </div>

      {/* On-chain address + live SOL balance */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Solana On-Chain Address</p>
          <p className="text-xs font-mono mt-1 text-foreground break-all">{SOL_WALLET}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">RPC Balance</p>
          {onChainSol != null ? (
            <p className="text-lg font-bold font-mono text-accent">{onChainSol.toFixed(6)} SOL</p>
          ) : (
            <p className="text-xs text-muted-foreground font-mono">Fetching…</p>
          )}
          {solFetchedAt && <p className="text-[10px] text-muted-foreground font-mono">{new Date(solFetchedAt).toLocaleTimeString()}</p>}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Total Balance */}
          {assets.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-2">Total Balance</p>
              <p className="text-4xl font-bold font-mono">{fmt$(totalValue)}</p>
              <p className="text-xs text-muted-foreground mt-2 font-mono">{assets.length} asset{assets.length !== 1 ? 's' : ''} · live Oracle prices</p>
            </div>
          )}

          {/* Stripe Balance Card */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold">Stripe Account</p>
              {stripe.isLoading && <span className="text-xs text-muted-foreground">Loading…</span>}
              {stripe.data && !stripe.data.error && (
                <span className="text-xs text-accent font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" />Connected</span>
              )}
            </div>
            {stripe.error || stripe.data?.error ? (
              <p className="text-xs text-muted-foreground">Connect Stripe in settings — key not configured on Oracle.</p>
            ) : stripe.data ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Available</p>
                  <p className="text-xl font-bold font-mono">{fmt$(stripe.data.available != null ? stripe.data.available / 100 : null)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending</p>
                  <p className="text-xl font-bold font-mono">{fmt$(stripe.data.pending != null ? stripe.data.pending / 100 : null)}</p>
                </div>
              </div>
            ) : !stripe.isLoading ? (
              <p className="text-xs text-muted-foreground">Connect Stripe in settings — key not configured on Oracle.</p>
            ) : null}
          </div>

          {/* Holdings */}
          {assets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 p-10 flex flex-col items-center gap-4 text-center">
              <p className="text-sm font-semibold">No holdings yet</p>
              <p className="text-xs text-muted-foreground max-w-sm">Click <strong>+ Add Holding</strong> to record your real verified holdings. Prices are fetched live from the Oracle.</p>
              <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5 mr-1" /> Add Holding</Button>
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-semibold mb-3">Holdings</h2>
              <div className="space-y-2">
                {assets.map(asset => (
                  <div key={asset.id} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary/30 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
                      {asset.symbol?.slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{asset.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {asset.quantity?.toFixed(6)} × {fmt$(asset.livePrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold font-mono">{fmt$(asset.value)}</p>
                      <p className="text-xs text-muted-foreground font-mono capitalize">{asset.type}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showAdd && (
        <AddHoldingModal
          onClose={() => setShowAdd(false)}
          onSaved={() => qc.invalidateQueries({ queryKey: ['assets'] })}
        />
      )}
    </div>
  );
}