import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Cpu, Zap, Brain, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Link } from 'react-router-dom';

const OLLAMA_MODELS = 11;

export default function AI() {
  const { canView } = useRBAC();

  const { data: aiLogs = [], isLoading: logsLoading, refetch } = useQuery({
    queryKey: ['ai-logs'],
    queryFn: () => base44.entities.AiLog.list('-created_date', 100),
    refetchInterval: 30000,
  });

  const { data: health, isLoading: hLoading } = useQuery({
    queryKey: ['vps-ai-health'],
    queryFn: async () => {
      const res = await fetch('https://quantumvaultsolutions.com/api/system/health', { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error('failed');
      return res.json();
    },
    refetchInterval: 30000,
    retry: 1,
  });

  if (!canView('ai')) return <AccessDenied section="AI/LLM" />;

  const now = new Date();
  const thisMonth = aiLogs.filter(l => {
    const d = new Date(l.created_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalTokens = thisMonth.reduce((s, l) => s + (l.prompt_tokens || 0) + (l.completion_tokens || 0), 0);
  const totalCost = thisMonth.reduce((s, l) => s + (l.cost || 0), 0);
  const isLoading = logsLoading || hLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI / LLM</h1>
          <p className="text-sm text-muted-foreground mt-1">Credits, usage analytics, model registry</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* VPS AI Status */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${health ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
        <div className="flex-1">
          <p className="text-xs font-semibold">VPS AI Status — Ollama @ port 11434</p>
          <p className="text-[10px] text-muted-foreground">{health ? `Online · ${health.version || 'v2.1.4'}` : 'Checking...'}</p>
        </div>
        <Badge variant={health ? 'default' : 'secondary'} className="text-[10px]">{health ? 'Online' : 'Unknown'}</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Models Available', value: OLLAMA_MODELS, icon: Brain, link: '/ai/models', color: 'text-chart-3' },
          { label: 'API Calls (Month)', value: thisMonth.length, icon: Zap, link: '/ai/credits', color: 'text-primary' },
          { label: 'Tokens Used', value: totalTokens.toLocaleString(), icon: Cpu, link: '/ai/credits', color: 'text-accent' },
          { label: 'Est. Cost', value: `$${totalCost.toFixed(4)}`, icon: Cpu, link: '/ai/credits', color: 'text-chart-4' },
        ].map(s => (
          <Link key={s.label} to={s.link} className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            {isLoading ? <Skeleton className="h-7 w-16" /> : <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>}
          </Link>
        ))}
      </div>

      {/* Recent AI Logs */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent AI Requests</p>
          <Link to="/ai/logs" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        {logsLoading ? <Skeleton className="h-24 w-full" /> : aiLogs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No AI logs yet. Create AiLog entities to track usage.</p>
        ) : (
          <div className="space-y-2">
            {aiLogs.slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-border/50 last:border-0">
                <span className="font-mono text-muted-foreground flex-shrink-0">{l.created_date ? new Date(l.created_date).toLocaleTimeString() : '—'}</span>
                <Badge variant="secondary" className="text-[10px] flex-shrink-0">{l.model}</Badge>
                <span className="text-muted-foreground">{(l.prompt_tokens || 0) + (l.completion_tokens || 0)} tok</span>
                <span className="ml-auto font-mono text-chart-3">${(l.cost || 0).toFixed(4)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}