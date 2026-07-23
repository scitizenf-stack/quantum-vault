import { useQuery } from '@tanstack/react-query';

const ORACLE = 'https://app.youthballot.org';
const HEADERS = { 'X-API-Key': 'qv_live_d54cf7079c6c809ba2d0378839559e2d' };

async function vpsHealthFetch() {
  const res = await fetch(`${ORACLE}/api/system/health`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`VPS ${res.status}`);
  return res.json();
}

export function useVpsHealth() {
  return useQuery({
    queryKey: ['vps-health'],
    queryFn: vpsHealthFetch,
    refetchInterval: 30000,
    retry: 1,
  });
}