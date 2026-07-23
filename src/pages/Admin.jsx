import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Users, Package, ArrowUpDown, Shield, GitBranch, ShoppingBag, Activity, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Admin() {
  const { canView } = useRBAC();

  const { data: products = [], isLoading: pLoading } = useQuery({ queryKey: ['products'], queryFn: () => base44.entities.Product.list() });
  const { data: users = [], isLoading: uLoading } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });
  const { data: transactions = [], isLoading: tLoading } = useQuery({ queryKey: ['transactions'], queryFn: () => base44.entities.Transaction.list() });
  const { data: logs = [], isLoading: lLoading } = useQuery({ queryKey: ['access-logs-admin'], queryFn: () => base44.entities.AccessLog.list('-created_date', 5) });
  const { data: apiKeys = [] } = useQuery({ queryKey: ['api-keys'], queryFn: () => base44.entities.ApiKey.list() });

  if (!canView('admin')) return <AccessDenied section="Admin" />;

  const isLoading = pLoading || uLoading || tLoading || lLoading;

  const stats = [
    { label: 'Products', value: products.length, icon: Package },
    { label: 'Users', value: users.length, icon: Users },
    { label: 'Transactions', value: transactions.length, icon: ArrowUpDown },
    { label: 'API Keys', value: apiKeys.length, icon: Shield },
  ];

  const subpages = [
    { label: 'Product Management', path: '/admin/products', icon: Package },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'System Logs', path: '/admin/logs', icon: Activity },
    { label: 'Marketplace Controls', path: '/admin/marketplace', icon: ShoppingBag },
    { label: 'Risk Controls', path: '/admin/risk', icon: Shield },
    { label: 'Deployments', path: '/admin/deployments', icon: GitBranch },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground text-sm">Platform administration and controls</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl bg-card border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              {isLoading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{s.value}</p>}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <p className="text-sm font-medium mb-3">Recent Access Logs</p>
        {lLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-8 mb-1 rounded" />) :
          logs.length === 0 ? <p className="text-sm text-muted-foreground">No recent access logs.</p> :
          logs.map(l => (
            <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2">
                <Badge className={l.status === 'success' ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'} style={{ fontSize: '10px' }}>{l.status}</Badge>
                <span className="text-xs">{l.action}</span>
              </div>
              <span className="text-xs text-muted-foreground">{l.created_date ? format(new Date(l.created_date), 'MMM d HH:mm') : '—'}</span>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subpages.map(sp => {
          const Icon = sp.icon;
          return (
            <Link key={sp.path} to={sp.path} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium">{sp.label}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}