import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/marketplace/ProductCard';

export default function MarketplaceDeveloper() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const devProducts = products.filter(p => p.category === 'Developer');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Developer Products</h1>
        <p className="text-xs text-muted-foreground mt-1">APIs, SDKs and developer tools</p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : devProducts.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground">No developer products in the catalogue yet</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={() => {}} inCart={false} />)}
        </div>
      )}
    </div>
  );
}