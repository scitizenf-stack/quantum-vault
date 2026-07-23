import { base44 } from '@/api/base44Client';

async function call(payload) {
  const r = await base44.functions.invoke('elephoneApi', payload);
  return r.data; // { ok, status, data }
}

export const elephone = {
  list: async (entity) => {
    const r = await call({ method: 'GET', entity });
    if (!r.ok) throw new Error(`ElePhone ${entity} list failed (${r.status})`);
    return Array.isArray(r.data) ? r.data : [];
  },
  create: async (entity, body) => {
    const r = await call({ method: 'POST', entity, body });
    if (!r.ok) throw new Error(`ElePhone ${entity} create failed (${r.status})`);
    return r.data;
  },
  update: async (entity, id, body) => {
    const r = await call({ method: 'PUT', entity, id, body });
    if (!r.ok) throw new Error(`ElePhone ${entity} update failed (${r.status})`);
    return r.data;
  },
};