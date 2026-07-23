import { useState, useEffect } from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Server, Shield, Flag, Activity, ChevronRight } from 'lucide-react';

const ORACLE = 'https://quantumvaultsolutions.com/api';

export default function Platform() {
  const { canView } = useRBAC();
  const [health, setHealth] = useState(null);
  const [latency, setLatency] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t0 = Date.now();
    Promise.all([
      fetch(`${ORACLE}/system/health`).then(r => r.json()).catch(() => null),
      fetch(`${ORACLE}/ping`).catch(() => null),
    ]).then(([h]) => {
      setHealth(h);
      setLatency(Date.now() - t0);
      setLoading(false);
    });
  }, []);

  if (!canView('platform')) return <AccessDenied section="Platform" />;

  const services = [
    { name: 'Oracle API', up: !!health },
    { name: 'Cloudflare', up: health?.cloudflare !== false },
    { name: 'Stripe', up: health?.stripe !== false },
    { name: 'Twilio', up: health?.twilio !== false },
    { name: 'GitHub', up: health?.github !== false },
  ];

  const subpages = [
    { label: 'Quantum Vault OS', path: '/platform/os', icon: Server, desc: 'VPS status and system info' },
    { label: 'Base44 Identity', path: '/platform/identity', icon: Shield, desc: 'Auth context and workspace' },
    { label: 'System Health', path: '/platform/health', icon: Activity, desc: 'Latency history and service status' },
    { label: 'Feature Flags', path: '/platform/flags', icon: Flag, desc: 'Toggle feature rollouts' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground text-sm">Service status and infrastructure health</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {services.map(s => (
          <div key={s.name} className="rounded-xl bg-card border border-border p-4">
            <p className="text-xs text-muted-foreground">{s.name}</p>
            {loading ? <Skeleton className="h-5 w-20 mt-1" /> :
              <Badge className={s.up ? 'bg-accent/20 text-accent mt-1' : 'bg-destructive/20 text-destructive mt-1'}>
                {s.up ? '✓ Up' : '✗ Degraded'}
              </Badge>}
          </div>
        ))}
      </div>

      {latency && (
        <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm">Oracle latency: <span className="font-mono font-medium">{latency}ms</span></span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subpages.map(sp => {
          const Icon = sp.icon;
          return (
            <Link key={sp.path} to={sp.path} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{sp.label}</p>
                  <p className="text-xs text-muted-foreground">{sp.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}