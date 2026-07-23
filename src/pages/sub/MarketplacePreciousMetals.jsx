import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useVpsPrices } from '@/lib/useVpsData';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/marketplace/ProductCard';
import LiveBadge from '@/components/shared/LiveBadge';

function fmt$(n) {
  return n != null ? `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
}

function SpotCard({ label, price, change, source }) {
  const isUp = (change || 0) >= 0;
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      {price == null ? (
        <Skeleton className="h-8 w-32 mt-2" />
      ) : (
        <>
          <p className="text-3xl font-bold font-mono mt-1">{fmt$(price)}<span className="text-sm font-normal text-muted-foreground ml-1">/oz</span></p>
          {change != null && (
            <div className={cn("flex items-center gap-1 mt-1 text-xs font-semibold", isUp ? "text-accent" : "text-destructive")}>
              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isUp ? '+' : ''}{change.toFixed(2)}%
            </div>
          )}
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">{source}</p>
        </>
      )}
    </div>
  );
}

export default function MarketplacePreciousMetals() {
  const { data: prices, dataUpdatedAt, isError } = useVpsPrices(30000);
  const [silverPrice, setSilverPrice] = useState(null);

  useEffect(() => {
    fetch('https://api.metals.live/v1/spot/silver')
      .then(r => r.json())
      .then(data => {
        const price = Array.isArray(data) ? data[0]?.silver : data?.silver ?? data?.price;
        if (price) setSilverPrice(Number(price));
      })
      .catch(() => {});
  }, []);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const metalProducts = products.filter(p =>
    p.category === 'Precious Metals' || p.family?.toLowerCase().includes('gold') || p.family?.toLowerCase().includes('silver')
  );

  const o = prices || {};
  const goldPrice = o.gold_usd;
  const goldChange = o.gold_change_24h;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Precious Metals</h1>
          <p className="text-xs text-muted-foreground mt-1">Live spot prices · Gold &amp; Silver</p>
        </div>
        <LiveBadge timestamp={dataUpdatedAt} error={isError ? 'fetch error' : null} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SpotCard label="Gold (XAU)" price={goldPrice} change={goldChange} source="Oracle · quantumvaultsolutions.com" />
        <SpotCard label="Silver (XAG)" price={silverPrice} change={null} source="api.metals.live" />
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : metalProducts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No precious metals products in the catalogue yet</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metalProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={() => {}} inCart={false} />)}
        </div>
      )}
    </div>
  );
}