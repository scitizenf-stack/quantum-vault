import React from 'react';
import { Badge } from '@/components/ui/badge';

const WORKERS = [
  { name: 'qv-auth-gateway', routes: ['api.quantumvaultsolutions.com/auth/*'], requests: '84,211', lastDeploy: '2026-05-18 10:14', status: 'active' },
  { name: 'qv-rate-limiter', routes: ['api.quantumvaultsolutions.com/*'], requests: '210,490', lastDeploy: '2026-05-15 08:30', status: 'active' },
  { name: 'qv-kyc-webhook', routes: ['hooks.quantumvaultsolutions.com/kyc'], requests: '1,204', lastDeploy: '2026-05-10 14:00', status: 'active' },
  { name: 'qv-geo-router', routes: ['quantumvaultsolutions.com/*'], requests: '392,741', lastDeploy: '2026-05-07 09:45', status: 'active' },
  { name: 'qv-cache-warmer', routes: ['cdn.quantumvaultsolutions.com/*'], requests: '18,092', lastDeploy: '2026-04-30 16:20', status: 'paused' },
];

export default function Workers() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Workers</h1>
        <p className="text-xs text-muted-foreground mt-1">{WORKERS.length} deployed workers</p>
      </div>
      <div className="space-y-3">
        {WORKERS.map((w, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-mono font-semibold">{w.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{w.requests} req/day</p>
              </div>
              <Badge variant={w.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{w.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {w.routes.map(r => (
                <span key={r} className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">{r}</span>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">Last deployed: {w.lastDeploy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}