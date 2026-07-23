import { base44 } from '@/api/base44Client';

export async function elephoneCall(method, entity, opts = {}) {
  const { id, body } = opts;
  const res = await base44.functions.invoke('elephoneApi', { method, entity, id, body });
  if (!res.data?.ok) {
    const detail = typeof res.data?.data === 'string' ? res.data.data : res.data?.data?.message;
    throw new Error(detail || `ElePhone ${method} ${entity} failed (${res.data?.status})`);
  }
  return res.data.data;
}

export function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}