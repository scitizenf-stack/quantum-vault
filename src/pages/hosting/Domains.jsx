import React, { useState } from 'react';
import { Globe, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DOMAINS = [
  { domain: 'quantumvaultsolutions.com', registrar: 'Cloudflare', expiry: 'Dec 14, 2027', autoRenew: true, status: 'active' },
  { domain: 'elephone.io', registrar: 'Namecheap', expiry: 'Aug 02, 2026', autoRenew: true, status: 'active' },
  { domain: 'qvault.dev', registrar: 'Google Domains', expiry: 'Mar 30, 2026', autoRenew: false, status: 'expiring' },
  { domain: 'sovereign-mesh.net', registrar: 'Cloudflare', expiry: 'Nov 18, 2027', autoRenew: true, status: 'active' },
];

export default function Domains() {
  const [renew, setRenew] = useState(DOMAINS.map(d => d.autoRenew));
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Domains</h1>
        <p className="text-xs text-muted-foreground mt-1">{DOMAINS.length} registered domains</p>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {['Domain', 'Registrar', 'Expires', 'Auto-Renew', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOMAINS.map((d, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-mono font-medium">{d.domain}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.registrar}</td>
                <td className="px-4 py-3 text-xs">{d.expiry}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setRenew(r => r.map((v, j) => j === i ? !v : v))}
                    className={`relative w-9 h-5 rounded-full transition-colors ${renew[i] ? 'bg-accent' : 'bg-secondary'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${renew[i] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={d.status === 'active' ? 'default' : 'destructive'} className="text-[10px]">{d.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}