import { useQuery } from '@tanstack/react-query';

const CF_TOKEN = import.meta.env.VITE_CF_API_TOKEN;
const CF_ACCOUNT = import.meta.env.VITE_CF_ACCOUNT_ID;

export const hasCfCreds = () => !!(CF_TOKEN);

async function cfFetch(path) {
  if (!CF_TOKEN) throw new Error('CF_MISSING');
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.errors?.[0]?.message || 'CF error');
  return json.result;
}

export function useCfZones() {
  return useQuery({
    queryKey: ['cf-zones'],
    queryFn: () => cfFetch('/zones?per_page=50'),
    refetchInterval: 30000,
    retry: 1,
  });
}

export function useCfDnsRecords(zoneId) {
  return useQuery({
    queryKey: ['cf-dns', zoneId],
    queryFn: () => cfFetch(`/zones/${zoneId}/dns_records`),
    enabled: !!zoneId,
    refetchInterval: 30000,
    retry: 1,
  });
}

export function useCfSslPacks(zoneId) {
  return useQuery({
    queryKey: ['cf-ssl', zoneId],
    queryFn: () => cfFetch(`/zones/${zoneId}/ssl/certificate_packs`),
    enabled: !!zoneId,
    refetchInterval: 30000,
    retry: 1,
  });
}

export function useCfWorkers() {
  return useQuery({
    queryKey: ['cf-workers'],
    queryFn: () => cfFetch(`/accounts/${CF_ACCOUNT}/workers/scripts`),
    enabled: !!CF_ACCOUNT,
    refetchInterval: 30000,
    retry: 1,
  });
}