import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import ConnectCard from '@/components/shared/ConnectCard';
import { CheckCircle, XCircle, GitBranch } from 'lucide-react';

const GH_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GH_ORG = import.meta.env.VITE_GITHUB_ORG;
const GH_REPO = import.meta.env.VITE_GITHUB_REPO;

const RESPONSES = {
  help: ['Available commands: status, ping, version, clear, whoami', ''],
  ping: ['PONG — 2ms', ''],
  version: ['Quantum Vault OS v2.1.4 · Build 20260518', ''],
  whoami: ['Quantum Vault Operator', ''],
  clear: null,
};

export default function Console() {
  const { canView } = useRBAC();
  const [lines, setLines] = useState(['$ quantum-vault status', '', '  Quantum Vault OS v2.1.4 — Ready', '']);
  const [input, setInput] = useState('');
  const bottomRef = useRef();

  const { data: health, isLoading: hLoading } = useQuery({
    queryKey: ['vps-health-console'],
    queryFn: async () => {
      const res = await fetch('https://quantumvaultsolutions.com/api/system/health', { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error('Health fetch failed');
      return res.json();
    },
    refetchInterval: 30000,
    retry: 1,
  });

  const { data: ciRuns = [], isLoading: ciLoading } = useQuery({
    queryKey: ['github-ci'],
    queryFn: async () => {
      if (!GH_TOKEN || !GH_ORG || !GH_REPO) return [];
      const res = await fetch(`https://api.github.com/repos/${GH_ORG}/${GH_REPO}/actions/runs?per_page=5`, {
        headers: { Authorization: `token ${GH_TOKEN}` },
      });
      if (!res.ok) return [];
      const d = await res.json();
      return d.workflow_runs || [];
    },
    refetchInterval: 60000,
  });

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [lines]);

  if (!canView('developer')) return <AccessDenied section="Console" />;

  const run = (e) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    setInput('');
    if (!cmd) return;
    if (cmd === 'clear') { setLines(['']); return; }
    const out = RESPONSES[cmd] || [`Command not found: ${cmd}. Type 'help' for commands.`, ''];
    setLines(l => [...l, `> ${cmd}`, ...out]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Console</h1>
        <p className="text-xs text-muted-foreground mt-1">System status & CI/CD pipeline</p>
      </div>

      {/* VPS Health */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">VPS Health Status</p>
        {hLoading ? <Skeleton className="h-16 w-full" /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Uptime', value: health?.uptime || '—' },
              { label: 'Version', value: health?.version || '—' },
              { label: 'Status', value: health?.status || 'unknown' },
              { label: 'Last Check', value: new Date().toLocaleTimeString() },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-lg bg-secondary/30">
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-sm font-mono font-semibold mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CI/CD Runs */}
      {(!GH_TOKEN || !GH_ORG || !GH_REPO) ? (
        <ConnectCard service="GitHub CI/CD" instructions="Set VITE_GITHUB_TOKEN, VITE_GITHUB_ORG, VITE_GITHUB_REPO to view pipeline runs" />
      ) : (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CI/CD Pipeline — {GH_ORG}/{GH_REPO}</p>
          </div>
          {ciLoading ? <Skeleton className="h-24 w-full" /> : ciRuns.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No workflow runs found</p>
          ) : (
            <div className="space-y-2">
              {ciRuns.map(run => (
                <div key={run.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  {run.conclusion === 'success' ? <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" /> : <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{run.display_title || run.name}</p>
                    <p className="text-[10px] text-muted-foreground">{run.head_branch} · {new Date(run.created_at).toLocaleString()}</p>
                  </div>
                  <Badge variant={run.conclusion === 'success' ? 'default' : 'destructive'} className="text-[10px]">{run.conclusion || run.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Terminal */}
      <div className="bg-[#0a0c10] border border-border rounded-xl overflow-hidden font-mono text-xs">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#111318] border-b border-border">
          <span className="w-3 h-3 rounded-full bg-destructive/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-accent/70" />
          <span className="ml-3 text-muted-foreground text-[10px]">quantum-vault — bash</span>
        </div>
        <div className="h-[300px] overflow-y-auto p-4 space-y-0.5">
          {lines.map((l, i) => (
            <div key={i} className={`leading-5 whitespace-pre ${l.startsWith('  ') ? 'text-accent/80' : l.startsWith('$') || l.startsWith('>') ? 'text-yellow-300' : 'text-gray-300'}`}>{l}</div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={run} className="flex items-center gap-2 px-4 py-3 border-t border-border">
          <span className="text-yellow-300">{'>'}</span>
          <input autoFocus value={input} onChange={e => setInput(e.target.value)}
            className="flex-1 bg-transparent text-gray-200 outline-none placeholder:text-gray-600 text-xs"
            placeholder="Type a command and press Enter..." />
        </form>
      </div>
    </div>
  );
}