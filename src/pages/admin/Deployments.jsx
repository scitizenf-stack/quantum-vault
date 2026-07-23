import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RotateCcw, GitBranch } from 'lucide-react';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import ConnectCard from '@/components/shared/ConnectCard';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_ORG = import.meta.env.VITE_GITHUB_ORG;
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO;

async function fetchGitHubRuns() {
  if (!GITHUB_TOKEN || !GITHUB_ORG || !GITHUB_REPO) return null;
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_ORG}/${GITHUB_REPO}/actions/runs?per_page=10`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) return null;
  return res.json();
}

const statusVariant = s => ({ success: 'default', failure: 'destructive', cancelled: 'secondary', in_progress: 'outline' })[s] || 'outline';

export default function Deployments() {
  const { canAdmin } = useRBAC();

  const { data: ghData, isLoading: ghLoading } = useQuery({
    queryKey: ['github-runs'],
    queryFn: fetchGitHubRuns,
    refetchInterval: 30000,
    retry: false,
  });

  const { data: deploys = [], isLoading: dbLoading } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => base44.entities.Deployment.list('-created_date', 10),
    refetchInterval: 30000,
  });

  if (!canAdmin()) return <AccessDenied section="Deployments" />;

  const useGitHub = !!GITHUB_TOKEN;
  const runs = ghData?.workflow_runs || [];
  const isLoading = useGitHub ? ghLoading : dbLoading;

  if (!useGitHub) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Deployments</h1>
          <p className="text-xs text-muted-foreground mt-1">Pipeline history</p>
        </div>
        <ConnectCard
          service="GitHub Actions"
          instructions="Set VITE_GITHUB_TOKEN, VITE_GITHUB_ORG, and VITE_GITHUB_REPO environment secrets to pull live deployment data from GitHub Actions."
          docsUrl="https://docs.github.com/en/rest/actions/workflow-runs"
        />
        {/* Fallback: Deployment entity */}
        {dbLoading ? (
          <div className="space-y-2">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : deploys.length === 0 ? (
          <div className="bg-card border border-dashed border-muted-foreground/30 rounded-xl p-8 text-center text-muted-foreground text-sm">
            No deployment records. Add Deployment entity records or connect GitHub.
          </div>
        ) : (
          <div className="space-y-2">
            {deploys.map((d, i) => (
              <div key={i} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${d.status === 'success' ? 'bg-accent' : d.status === 'running' ? 'bg-yellow-400' : 'bg-destructive'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">{d.commitHash?.slice(0, 7) || '—'}</code>
                    <p className="text-xs font-medium">{d.version}</p>
                    <Badge variant="outline" className="text-[10px]">{d.environment}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {d.timestamp ? new Date(d.timestamp).toLocaleString() : '—'} · by {d.deployedBy || '—'}
                  </p>
                </div>
                <Badge variant={statusVariant(d.status)} className="text-[10px] flex-shrink-0">{d.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <GitBranch className="w-5 h-5 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Deployments</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {runs.length} runs · {GITHUB_ORG}/{GITHUB_REPO} · GitHub Actions
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : runs.length === 0 ? (
        <div className="bg-card border border-dashed border-muted-foreground/30 rounded-xl p-8 text-center text-muted-foreground text-sm">
          No workflow runs found in this repository.
        </div>
      ) : (
        <div className="space-y-2">
          {runs.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.conclusion === 'success' ? 'bg-accent' : r.status === 'in_progress' ? 'bg-yellow-400 animate-pulse' : 'bg-destructive'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">{r.head_sha?.slice(0, 7)}</code>
                  <p className="text-xs font-medium truncate">{r.display_title || r.name}</p>
                  <Badge variant="outline" className="text-[10px]">{r.head_branch}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(r.created_at).toLocaleString()} · by {r.triggering_actor?.login || '—'}
                </p>
              </div>
              <Badge variant={statusVariant(r.conclusion || r.status)} className="text-[10px] flex-shrink-0">
                {r.conclusion || r.status}
              </Badge>
              {r.conclusion === 'failure' && (
                <a href={r.html_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1 flex-shrink-0">
                    <RotateCcw className="w-3 h-3" /> View
                  </Button>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}