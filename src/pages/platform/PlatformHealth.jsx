import { useState, useEffect, useRef } from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Activity } from 'lucide-react';

const ORACLE = 'https://app.youthballot.org/api';

export default function PlatformHealth() {
  const { canView } = useRBAC();
  const [health, setHealth] = useState(null);
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef();

  const fetchHealth = async () => {
    setLoading(true);
    const t0 = Date.now();
    try {
      const [hRes] = await Promise.all([
        fetch(`${ORACLE}/system/health`).then(r => r.json()).catch(() => null),
        fetch(`${ORACLE}/ping`).catch(() => null),
      ]);
      const latency = Date.now() - t0;
      setHealth(hRes);
      setLatencyHistory(prev => [...prev.slice(-9), latency]);
    } catch {}
    setLoading(false);
    setCountdown(30);
  };

  useEffect(() => {
    fetchHealth();
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { fetchHealth(); return 30; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  if (!canView('platform')) return <AccessDenied section="Platform" />;

  const services = [
    { name: 'Oracle API', key: 'oracle', up: !!health },
    { name: 'Cloudflare', key: 'cloudflare', up: health?.cloudflare !== false },
    { name: 'Stripe', key: 'stripe', up: health?.stripe !== false },
    { name: 'Twilio', key: 'twilio', up: health?.twilio !== false },
    { name: 'GitHub', key: 'github', up: health?.github !== false },
  ];

  const avgLatency = latencyHistory.length ? Math.round(latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Health</h1>
          <p className="text-muted-foreground text-sm">Auto-refresh in {countdown}s</p>
        </div>
        <button onClick={fetchHealth} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {services.map(s => (
          <div key={s.key} className="rounded-xl bg-card border border-border p-4 flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">{s.name}</p>
            {loading ? <Skeleton className="h-5 w-16" /> :
              <Badge className={s.up ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}>
                {s.up ? 'Operational' : 'Degraded'}
              </Badge>}
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium">Latency History (last 10 pings)</p>
          {avgLatency && <Badge variant="outline" className="text-xs">{avgLatency}ms avg</Badge>}
        </div>
        <div className="flex items-end gap-1 h-16">
          {latencyHistory.length === 0 ? <p className="text-xs text-muted-foreground">Collecting data...</p> :
            latencyHistory.map((ms, i) => {
              const maxMs = Math.max(...latencyHistory, 1);
              const pct = Math.round((ms / maxMs) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary rounded-sm" style={{ height: `${pct}%` }} />
                  <span className="text-[9px] text-muted-foreground">{ms}ms</span>
                </div>
              );
            })}
        </div>
      </div>

      {health && (
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs font-mono text-muted-foreground mb-2">Raw health response:</p>
          <pre className="text-xs font-mono text-foreground overflow-auto">{JSON.stringify(health, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}