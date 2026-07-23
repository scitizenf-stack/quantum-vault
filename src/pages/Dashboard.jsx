import React from 'react';
import { Wallet, Activity, BarChart3, Globe, Zap, Server, CheckCircle } from 'lucide-react';
import { useVpsPrices } from '@/lib/useVpsData';
import { useOracleDashboard } from '@/lib/useOracleData';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useProchainData } from '@/lib/useProchainData';
import StatCard from '../components/dashboard/StatCard';
import PortfolioChart from '../components/dashboard/PortfolioChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import TopAssets from '../components/dashboard/TopAssets';
import AllocationDonut from '../components/dashboard/AllocationDonut';
import SovereignStateBar from '../components/dashboard/SovereignStateBar';
import MeshTelemetry from '../components/dashboard/MeshTelemetry';
import TickerBar from '../components/dashboard/TickerBar';
import DataSourceStatus from '../components/dashboard/DataSourceStatus';
import { Skeleton } from '@/components/ui/skeleton';
import FusionSyncBanner from '../components/dashboard/FusionSyncBanner';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';

function fmt$(n) { return n != null ? `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'; }
function fmtNum(n) { return n != null ? Number(n).toLocaleString() : '—'; }

function LastUpdated({ timestamp }) {
  if (!timestamp) return null;
  const d = new Date(timestamp);
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return <span className="text-xs text-muted-foreground font-mono">Last sync: {time}</span>;
}

// Price key lookup for Asset symbols vs Oracle keys
const PRICE_MAP = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', XRP: 'xrp_usd', XAU: 'gold_usd', PAXG: 'gold_usd', USDC: 'usdc_usd' };
const CHANGE_MAP = { BTC: 'btc_change_24h', ETH: 'eth_change_24h', SOL: 'sol_change_24h', XRP: 'xrp_change_24h', XAU: 'gold_change_24h', PAXG: 'gold_change_24h' };

export default function Dashboard({ embedded = false }) {
  const { canView, user } = useRBAC();
  const oracle  = useOracleDashboard(30000);
  const prices  = useVpsPrices(30000);
  const prochain = useProchainData(30000);

  const { data: dbAssets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
  });

  const o  = prices.data || {};
  const pc = prochain.data || {};
  const oracleData = oracle.data || {};

  const initialLoading = oracle.isLoading && prices.isLoading;

  if (!canView('dashboard')) return <AccessDenied section="Dashboard" />;

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  // -- Holdings from User entity (tokens_balance = SOL, btc/paxg/xrp_balance),
  //    fallback to Asset entity records if User fields are not yet populated.
  const qty = (userField, ...syms) => {
    const u = user?.[userField];
    if (u != null && u > 0) return u;
    for (const s of syms) {
      const a = dbAssets.find(a => a.symbol === s);
      if (a?.quantity != null) return a.quantity;
    }
    return 0;
  };

  const HOLDINGS = [
    { symbol: 'SOL',  name: 'Solana',   type: 'crypto',    quantity: qty('tokens_balance', 'SOL'),  walletAddress: user?.solana_wallet_address },
    { symbol: 'PAXG', name: 'PAX Gold', type: 'commodity', quantity: qty('paxg_balance', 'PAXG', 'XAU') },
    { symbol: 'BTC',  name: 'Bitcoin',  type: 'crypto',    quantity: qty('btc_balance', 'BTC') },
    { symbol: 'XRP',  name: 'XRP',      type: 'crypto',    quantity: qty('xrp_balance', 'XRP') },
  ];

  const assets = HOLDINGS.map(h => {
    const pk = PRICE_MAP[h.symbol];
    const ck = CHANGE_MAP[h.symbol];
    const price = pk ? (o[pk] ?? null) : null;
    return {
      ...h,
      current_price: price ?? 0,
      change_24h: ck ? (o[ck] ?? 0) : 0,
      value: (h.quantity || 0) * (price ?? 0),
    };
  });

  const totalValue = assets.reduce((s, a) => s + a.value, 0);
  const trackedCount = assets.filter(a => a.quantity > 0).length;

  const solAsset = assets.find(a => a.symbol === 'SOL');
  const goldAsset = assets.find(a => a.symbol === 'PAXG');
  const solPrice = solAsset?.current_price || null;
  const solChange = solAsset?.change_24h;
  const solQty = solAsset?.quantity || 0;
  const solValue = solAsset?.value || 0;
  const goldPrice = goldAsset?.current_price || null;
  const goldChange = goldAsset?.change_24h;
  const goldQty = goldAsset?.quantity || 0;
  const goldValue = goldAsset?.value || 0;

  const oracleOnline = !!oracle.data && !oracle.error;

  return (
    <div className="space-y-6">
      {!embedded && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Sovereign Root · Omega Protocol v4 · Live · 30s poll</p>
        </div>
        <div className="flex items-center gap-3">
          {oracleOnline && (
            <span className="flex items-center gap-1.5 text-xs text-accent font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              Oracle Live
            </span>
          )}
          <LastUpdated timestamp={oracleData.timestamp} />
        </div>
      </div>
      )}

      <FusionSyncBanner />

      {/* Live Ticker Bar */}
      <TickerBar data={o} />

      {/* Sovereign state bar — only if we have real data */}
      {oracle.data && <SovereignStateBar data={oracleData} isLoading={oracle.isLoading} />}

      {/* ── Portfolio KPIs ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Portfolio</p>
          {oracleOnline && (
          <span className="flex items-center gap-1 text-xs text-accent font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            LIVE · app.youthballot.org
          </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Total Portfolio */}
          <StatCard
            title="Total Portfolio"
            value={fmt$(totalValue)}
            icon={Wallet}
            subtitle={`${trackedCount} asset${trackedCount !== 1 ? 's' : ''} tracked`}
          />
          {/* SOL */}
          <StatCard
            title="SOL Holdings"
            value={fmt$(solValue)}
            change={solChange != null ? Number(solChange).toFixed(2) : undefined}
            trend={(solChange ?? 0) >= 0 ? 'up' : 'down'}
            icon={Activity}
            subtitle={solQty > 0 ? `${solQty.toFixed(6)} SOL @ ${fmt$(solPrice)}` : (solPrice ? `Live: ${fmt$(solPrice)} · 0 SOL` : 'Add SOL holdings')}
          />
          {/* PAXG/Gold */}
          <StatCard
            title="PAXG Holdings"
            value={fmt$(goldValue)}
            change={goldChange != null ? Number(goldChange).toFixed(2) : undefined}
            trend={(goldChange ?? 0) >= 0 ? 'up' : 'down'}
            icon={Activity}
            subtitle={goldQty > 0 ? `${goldQty.toFixed(6)} PAXG @ ${fmt$(goldPrice)}` : (goldPrice ? `Live: ${fmt$(goldPrice)} · 0 PAXG` : 'Add gold holdings')}
          />
          {/* BTC Price */}
          <StatCard
            title="BTC Price"
            value={o.btc_usd ? fmt$(o.btc_usd) : '—'}
            change={o.btc_change_24h != null ? Number(o.btc_change_24h).toFixed(2) : undefined}
            trend={(o.btc_change_24h ?? 0) >= 0 ? 'up' : 'down'}
            icon={Activity}
          />
        </div>
      </div>

      {/* ── Global Market KPIs ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Global Market</p>
          {(oracleData.total_market_cap || pc.total_market_cap_usd) && (
            <span className="flex items-center gap-1 text-xs text-accent font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Mkt Cap"
            value={oracleData.total_market_cap ? fmt$(oracleData.total_market_cap) : (pc.total_market_cap_usd ? fmt$(pc.total_market_cap_usd) : '—')}
            change={(oracleData.mcap_change_24h ?? pc.market_cap_change_24h) != null ? Number(oracleData.mcap_change_24h ?? pc.market_cap_change_24h).toFixed(2) : undefined}
            trend={(oracleData.mcap_change_24h ?? pc.market_cap_change_24h ?? 0) >= 0 ? 'up' : 'down'}
            icon={Globe}
          />
          <StatCard
            title="Active Assets"
            value={oracleData.active_coins ? fmtNum(oracleData.active_coins) : (pc.active_cryptocurrencies ? fmtNum(pc.active_cryptocurrencies) : '—')}
            icon={BarChart3}
          />
          <StatCard
            title="BTC Dominance"
            value={(oracleData.btc_dominance ?? pc.btc_dominance) != null ? `${Number(oracleData.btc_dominance ?? pc.btc_dominance).toFixed(1)}%` : '—'}
            icon={Zap}
          />
          <StatCard
            title="ETH Price"
            value={o.eth_usd ? fmt$(o.eth_usd) : '—'}
            change={o.eth_change_24h != null ? Number(o.eth_change_24h).toFixed(2) : undefined}
            trend={(o.eth_change_24h ?? 0) >= 0 ? 'up' : 'down'}
            icon={Server}
          />
        </div>
      </div>

      {/* Chart */}
      <PortfolioChart currentValue={totalValue} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AllocationDonut assets={assets} />
        <TopAssets assets={assets} />
        <RecentTransactions transactions={[]} />
      </div>

      {/* Data Source Status */}
      <DataSourceStatus />

      {/* Real-time Mesh Telemetry */}
      <MeshTelemetry />
    </div>
  );
}