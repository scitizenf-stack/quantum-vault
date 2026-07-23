import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ELEPHONE_API = 'https://spectral-quantum-link-core.base44.app/api/entities/Transaction';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const trades = Array.isArray(body.trades) ? body.trades : (body.trade ? [body.trade] : []);
    if (!trades.length) return Response.json({ error: 'No trades provided' }, { status: 400 });

    const results = [];
    for (const t of trades) {
      const payload = {
        asset_name: t.pair || '',
        symbol: (t.pair || '').split('/')[0] || '',
        type: t.side === 'BUY' ? 'buy' : 'sell',
        total_amount: t.total || 0,
        status: 'completed',
        notes: `HFT Engine: ${t.strategy || 'unknown'}`,
      };
      const res = await fetch(ELEPHONE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }
      results.push({ pair: t.pair, side: t.side, ok: res.ok, status: res.status, data });
    }
    const failed = results.filter(r => !r.ok);
    return Response.json({
      synced: results.length - failed.length,
      failed: failed.length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});