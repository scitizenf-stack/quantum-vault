import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Package, ShoppingCart, Key } from 'lucide-react';

export default function AdminOverview() {
  const { canAdmin } = useRBAC();

  const { data: users = [], isLoading: uL } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });
  const { data: products = [], isLoading: pL } = useQuery({ queryKey: ['products-admin'], queryFn: () => base44.entities.Product.list() });
  const { data: orders = [], isLoading: oL } = useQuery({ queryKey: ['orders'], queryFn: () => base44.entities.Order.list() });
  const { data: apiKeys = [], isLoading: kL } = useQuery({ queryKey: ['api-keys'], queryFn: () => base44.entities.ApiKey.list() });

  if (!canAdmin()) return <AccessDenied section="Admin" />;

  const isLoading = uL || pL || oL || kL;

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-primary' },
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-accent' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-chart-3' },
    { label: 'API Keys', value: apiKeys.length, icon: Key, color: 'text-yellow-400' },
  ];

  const completedRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total || 0), 0);
  const activeProducts = products.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-xs text-muted-foreground mt-1">Platform-wide statistics</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-3xl font-bold">{s.value}</p>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Revenue (Completed Orders)</p>
          {isLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-3xl font-bold text-accent">${completedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>}
        </div>
        <div className="bg-card border border-border rounded-xl p-5 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Products</p>
          {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{activeProducts} <span className="text-sm text-muted-foreground font-normal">/ {products.length} total</span></p>}
        </div>
      </div>
    </div>
  );
}