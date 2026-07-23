import { useQuery } from '@tanstack/react-query';

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const ORG = import.meta.env.VITE_GITHUB_ORG;
const REPO = import.meta.env.VITE_GITHUB_REPO;

export const hasGithubCreds = () => !!(TOKEN && ORG && REPO);

async function ghFetch(path) {
  if (!TOKEN) throw new Error('GH_MISSING');
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `token ${TOKEN}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
}

export function useGithubRepos() {
  return useQuery({
    queryKey: ['github-repos'],
    queryFn: () => ghFetch('/user/repos?per_page=10'),
    enabled: !!TOKEN,
    refetchInterval: 60000,
    retry: 1,
  });
}

export function useGithubActions() {
  return useQuery({
    queryKey: ['github-actions'],
    queryFn: () => ghFetch(`/repos/${ORG}/${REPO}/actions/runs?per_page=5`),
    enabled: !!(TOKEN && ORG && REPO),
    refetchInterval: 30000,
    retry: 1,
  });
}