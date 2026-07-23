import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function MarketplaceControls() {
  const { canAdmin } = useRBAC();

  const { data: products = [], isLoading: pLoading } = useQuery({
    queryKey: ['products-admin'],
    queryFn: () => base44.entities.Product.list(),
    refetchInterval: 30000,
  });

  const { data: orders = [], isLoading: oLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 50),
    refetchInterval: 30000,
  });

  const isLoading = pLoading || oLoading;

  // Group products by category
  const byCategory = useMemo(() => {
    const map = {};
    products.forEach(p => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return Object.entries(map).map(([cat, prods]) => ({ cat, count: prods.length, active: prods.filter(p => p.status === 'active').length }));
  }, [products]);

  // Revenue by status from orders
  const revenueByStatus = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      map[o.status] = (map[o.status] || 0) + (o.total || 0);
    });
    return Object.entries(map).map(([status, total]) => ({ status, total: +total.toFixed(2) }));
  }, [orders]);

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total || 0), 0);

  if (!canAdmin()) return <AccessDenied section="Marketplace Controls" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Marketplace Controls</h1>
        <p className="text-xs text-muted-foreground mt-1">{products.length} products · {orders.length} orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Products', value: products.length },
          { label: 'Active Products', value: products.filter(p => p.status === 'active').length },
          { label: 'Completed Revenue', value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            {isLoading ? <Skeleton className="h-7 w-16 mt-1" /> : <p className="text-2xl font-bold mt-1">{s.value}</p>}
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {!oLoading && revenueByStatus.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm font-semibold mb-4">Revenue by Order Status</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenueByStatus}>
              <XAxis dataKey="status" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => [`$${v}`, 'Revenue']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Products by category */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">Products by Category</p>
        </div>
        {isLoading ? Array(5).fill(0).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-border/50"><Skeleton className="h-4 w-full" /></div>
        )) : byCategory.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">No products yet</div>
        ) : byCategory.map(({ cat, count, active }, i) => (
          <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < byCategory.length - 1 ? 'border-b border-border/50' : ''} hover:bg-secondary/20`}>
            <span className="text-sm font-medium">{cat}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{active} active</Badge>
              <span className="text-xs text-muted-foreground">{count} total</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}