import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Code2, Key, Webhook, Terminal, FileText, Package, RefreshCw, Github } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import ConnectCard from '@/components/shared/ConnectCard';
import { Link } from 'react-router-dom';

const GH_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export default function Developer() {
  const { canView } = useRBAC();

  const { data: apiKeys = [], isLoading: akLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => base44.entities.ApiKey.list(),
    refetchInterval: 30000,
  });

  const { data: webhooks = [], isLoading: whLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.Webhook.list(),
    refetchInterval: 30000,
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['access-logs'],
    queryFn: () => base44.entities.AccessLog.list('-created_date', 5),
    refetchInterval: 30000,
  });

  const { data: repos = [], isLoading: ghLoading } = useQuery({
    queryKey: ['github-repos'],
    queryFn: async () => {
      if (!GH_TOKEN) return [];
      const res = await fetch('https://api.github.com/user/repos?per_page=10', {
        headers: { Authorization: `token ${GH_TOKEN}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 60000,
  });

  if (!canView('developer')) return <AccessDenied section="Developer" />;

  const isLoading = akLoading || whLoading;

  const stats = [
    { label: 'API Keys', value: apiKeys.length, icon: Key, link: '/developer/api-keys' },
    { label: 'Webhooks', value: webhooks.filter(w => w.active).length, icon: Webhook, link: '/developer/webhooks' },
    { label: 'GitHub Repos', value: repos.length, icon: Github, link: '/developer/console' },
    { label: 'Recent Events', value: logs.length, icon: FileText, link: '/developer/logs' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Developer</h1>
          <p className="text-sm text-muted-foreground mt-1">API keys, webhooks, console, SDK access</p>
        </div>
      </div>

      {!GH_TOKEN && (
        <ConnectCard service="GitHub" instructions="Add VITE_GITHUB_TOKEN to unlock repo & CI/CD integration" />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.label} to={s.link} className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            {isLoading || ghLoading ? <Skeleton className="h-7 w-16" /> : (
              <p className="text-2xl font-bold font-mono">{s.value}</p>
            )}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent API Keys */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent API Keys</p>
            <Link to="/developer/api-keys" className="text-xs text-primary hover:underline">Manage →</Link>
          </div>
          {akLoading ? <Skeleton className="h-20 w-full" /> : apiKeys.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No API keys — <Link to="/developer/api-keys" className="text-primary">create one</Link></p>
          ) : (
            <div className="space-y-2">
              {apiKeys.slice(0, 3).map(k => (
                <div key={k.id} className="flex items-center justify-between">
                  <span className="text-xs font-medium">{k.name}</span>
                  <Badge variant={k.active ? 'default' : 'secondary'} className="text-[10px]">{k.active ? 'Active' : 'Revoked'}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Logs */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Access Events</p>
            <Link to="/developer/logs" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          {logsLoading ? <Skeleton className="h-20 w-full" /> : logs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No access events logged</p>
          ) : (
            <div className="space-y-1.5">
              {logs.slice(0, 4).map(l => (
                <div key={l.id} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${l.status === 'success' ? 'bg-accent' : 'bg-destructive'}`} />
                  <span className="flex-1 truncate">{l.action}</span>
                  <span className="text-muted-foreground font-mono">{l.ip || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}