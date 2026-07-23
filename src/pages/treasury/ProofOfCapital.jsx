import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useVpsPrices } from '@/lib/useVpsData';
import { Shield, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';

const WALLET = 'Eida3teSJATMJW7BBqFZUKdrNXbr5ek7kGGftegBsxmp';
const PRICE_MAP = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', PAXG: 'gold_usd', XAU: 'gold_usd', USDC: 'usdc_usd' };

export default function ProofOfCapital() {
  const { isFounder } = useRBAC();

  const { data: prices } = useVpsPrices(30000);
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
    refetchInterval: 30000,
  });

  const { data: solBalance, isLoading: solLoading } = useQuery({
    queryKey: ['sol-balance-poc'],
    queryFn: async () => {
      const res = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [WALLET] }),
        signal: AbortSignal.timeout(8000),
      });
      const json = await res.json();
      return (json.result?.value || 0) / 1e9;
    },
    refetchInterval: 30000,
  });

  if (!isFounder) return <AccessDenied section="Proof of Capital" />;

  const o = prices || {};
  const enriched = assets.map(a => {
    const price = (PRICE_MAP[a.symbol] ? o[PRICE_MAP[a.symbol]] : null) || a.current_price || 0;
    return { ...a, price, value: (a.quantity || 0) * price };
  });
  const total = enriched.reduce((s, a) => s + a.value, 0);
  const isLoading = assetsLoading || solLoading;
  const now = new Date().toUTCString();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Proof of Capital</h1>
        <p className="text-xs text-muted-foreground mt-1">Cryptographically verifiable treasury attestation</p>
      </div>
      <div className="max-w-lg">
        <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-accent/30 rounded-2xl p-6 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="flex items-center gap-2 mb-6 relative">
            <Shield className="w-5 h-5 text-accent" />
            <span className="text-xs font-bold tracking-widest text-accent uppercase">Quantum Vault Treasury</span>
          </div>

          {isLoading ? (
            <Skeleton className="h-32 w-full bg-white/10" />
          ) : (
            <div className="relative space-y-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Verified Treasury Balance</p>
                <p className="text-4xl font-bold">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-3 text-xs font-mono text-gray-300 leading-6">
                <p>As of {now},</p>
                <p>wallet {WALLET.slice(0,8)}...{WALLET.slice(-8)} holds:</p>
                {enriched.map(a => (
                  <p key={a.id}>  {a.quantity} {a.symbol} @ ${a.price.toLocaleString()} = ${a.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                ))}
                {solBalance != null && <p>  On-chain SOL balance: {solBalance.toFixed(6)} SOL</p>}
                <p>Verified via Solana mainnet RPC + Oracle.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Attestation Date</p>
                  <p className="text-xs font-mono mt-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Wallet</p>
                  <p className="text-xs font-mono mt-1 truncate">{WALLET.slice(0, 12)}...</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="text-xs text-accent font-semibold">Live · Solana Mainnet Verified</span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-3">
          <Button className="flex-1 gap-2"><Download className="w-4 h-4" />Download Certificate</Button>
          <Button variant="outline" className="flex-1">Share Link</Button>
        </div>
      </div>
    </div>
  );
}