import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ELEPHONE = 'https://spectral-quantum-link-core.base44.app/api/entities';
const API_KEY = Deno.env.get('ELEPHONE_API_KEY');
const FOUNDER_EMAIL = 'securecitizenfoundation@gmail.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.email !== FOUNDER_EMAIL) {
      return Response.json({ error: 'Forbidden — owner only' }, { status: 403 });
    }

    const { method = 'GET', entity, id, body } = await req.json().catch(() => ({}));
    if (!entity) return Response.json({ error: 'entity required' }, { status: 400 });

    let url = `${ELEPHONE}/${entity}`;
    if (id) url += `/${id}`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'api_key': API_KEY || '' },
      body: method !== 'GET' ? JSON.stringify(body || {}) : undefined,
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return Response.json({ ok: res.ok, status: res.status, data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});