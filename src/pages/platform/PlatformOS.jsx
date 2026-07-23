import { useState, useEffect } from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Terminal } from 'lucide-react';

const ORACLE = 'https://app.youthballot.org/api';

export default function PlatformOS() {
  const { canView } = useRBAC();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${ORACLE}/system/health`).then(r => r.json()).then(setHealth).catch(() => setHealth(null)).finally(() => setLoading(false));
  }, []);

  if (!canView('platform')) return <AccessDenied section="Platform" />;

  const vpsInfo = [
    { label: 'HOSTNAME', value: health?.hostname || health?.host || 'app.youthballot.org' },
    { label: 'STATUS', value: health ? 'ONLINE' : 'UNREACHABLE' },
    { label: 'UPTIME', value: health?.uptime || '—' },
    { label: 'OS', value: health?.os || '—' },
    { label: 'KERNEL', value: health?.kernel || '—' },
    { label: 'CPU', value: health?.cpu || '—' },
    { label: 'MEMORY', value: health?.memory || '—' },
    { label: 'DISK', value: health?.disk || '—' },
    { label: 'LOAD', value: health?.load || '—' },
    { label: 'REGION', value: health?.region || '—' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Terminal className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Omega Protocol OS</h1>
          <p className="text-muted-foreground text-sm">VPS endpoint: app.youthballot.org</p>
        </div>
        {!loading && <Badge className={health ? 'bg-accent/20 text-accent ml-auto' : 'bg-destructive/20 text-destructive ml-auto'}>{health ? 'ONLINE' : 'UNREACHABLE'}</Badge>}
      </div>

      <div className="rounded-xl bg-[#0d1117] border border-border p-6 font-mono">
        <p className="text-muted-foreground text-xs mb-4"># omega-protocol-os ~ system info</p>
        {loading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-4 w-full mb-2 bg-muted/30" />) :
          vpsInfo.map(row => (
            <div key={row.label} className="flex gap-4 text-xs mb-2">
              <span className="text-primary w-20 shrink-0">{row.label}</span>
              <span className="text-green-400">{row.value}</span>
            </div>
          ))
        }
        <div className="mt-4 border-t border-border/40 pt-4">
          <p className="text-xs text-muted-foreground">{new Date().toISOString()} — Omega Protocol System Console</p>
        </div>
      </div>
    </div>
  );
}