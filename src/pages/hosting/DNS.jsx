import React from 'react';

const RECORDS = [
  { type: 'A', name: '@', value: '104.21.44.132', ttl: '300', proxy: true },
  { type: 'A', name: 'www', value: '104.21.44.132', ttl: '300', proxy: true },
  { type: 'CNAME', name: 'api', value: 'api.quantumvaultsolutions.com', ttl: '3600', proxy: false },
  { type: 'MX', name: '@', value: 'mail.quantumvaultsolutions.com', ttl: '3600', proxy: false },
  { type: 'TXT', name: '@', value: 'v=spf1 include:_spf.google.com ~all', ttl: '3600', proxy: false },
  { type: 'TXT', name: '_dmarc', value: 'v=DMARC1; p=reject; rua=mailto:dmarc@qv.io', ttl: '3600', proxy: false },
  { type: 'AAAA', name: '@', value: '2606:4700:3034::ac43:a527', ttl: '300', proxy: true },
  { type: 'NS', name: '@', value: 'ns1.cloudflare.com', ttl: 'auto', proxy: false },
];

const typeColor = (t) => ({ A: 'text-primary', AAAA: 'text-cyan-400', CNAME: 'text-purple-400', MX: 'text-yellow-400', TXT: 'text-orange-400', NS: 'text-muted-foreground' })[t] || 'text-foreground';

export default function DNS() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">DNS Records</h1>
        <p className="text-xs text-muted-foreground mt-1">quantumvaultsolutions.com · {RECORDS.length} records</p>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {['Type', 'Name', 'Value', 'TTL', 'Proxied'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECORDS.map((r, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                <td className="px-4 py-3"><span className={`text-xs font-bold font-mono ${typeColor(r.type)}`}>{r.type}</span></td>
                <td className="px-4 py-3 text-xs font-mono">{r.name}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground truncate max-w-[240px]">{r.value}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.ttl}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${r.proxy ? 'text-orange-400' : 'text-muted-foreground'}`}>
                    {r.proxy ? '🟠 Proxied' : '⚪ DNS Only'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}