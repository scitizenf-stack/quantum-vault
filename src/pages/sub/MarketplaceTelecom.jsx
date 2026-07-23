import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Phone, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/marketplace/ProductCard';
import { Badge } from '@/components/ui/badge';

export default function MarketplaceTelecom() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const telecomProducts = products.filter(p => p.category === 'Telecom');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Telecom Products</h1>
        <p className="text-xs text-muted-foreground mt-1">SIM, eSIM, data plans and voice services</p>
      </div>

      {/* Twilio Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
        <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-yellow-400">Twilio Integration</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live Twilio phone number inventory requires TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN backend secrets.
            Connect via Settings → Integrations when ready.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : telecomProducts.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground">No telecom products in the catalogue yet</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {telecomProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={() => {}} inCart={false} />)}
        </div>
      )}
    </div>
  );
}