import React, { useState } from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { useOracleDashboard } from '@/lib/useOracleData';
import P2POrderBook from '@/components/hft/P2POrderBook';
import PlaceOrderModal from '@/components/hft/PlaceOrderModal';
import P2PTransfer from '@/components/hft/P2PTransfer';
import MarketDepthChart from '@/components/hft/MarketDepthChart';

export default function P2P() {
  const { canView } = useRBAC();
  const { data: oracle } = useOracleDashboard(5000);
  const [showOrder, setShowOrder] = useState(false);

  if (!canView('hft')) return <AccessDenied section="P2P Trading" />;
  const midPrice = oracle?.btc_usd || 67000;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">P2P Trading</h1>
        <p className="text-xs text-muted-foreground">Peer-to-peer order book · paper trading mode</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <P2POrderBook midPrice={midPrice} onPlaceOrder={() => setShowOrder(true)} />
          <MarketDepthChart midPrice={midPrice} />
        </div>
        <div className="space-y-4">
          <P2PTransfer />
        </div>
      </div>
      <PlaceOrderModal open={showOrder} onClose={() => setShowOrder(false)} defaultPair="BTC/USDT" />
    </div>
  );
}