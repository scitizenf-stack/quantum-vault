import React from 'react';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CERTS = [
  { domain: 'quantumvaultsolutions.com', issuer: "Let's Encrypt", issued: 'Apr 20, 2026', expires: 'Jul 19, 2026', days: 61 },
  { domain: '*.quantumvaultsolutions.com', issuer: 'Cloudflare', issued: 'Jan 01, 2026', expires: 'Dec 31, 2026', days: 226 },
  { domain: 'elephone.io', issuer: "Let's Encrypt", issued: 'May 01, 2026', expires: 'Jul 30, 2026', days: 72 },
  { domain: 'qvault.dev', issuer: "Let's Encrypt", issued: 'Mar 30, 2026', expires: 'Jun 28, 2026', days: 40 },
];

function DaysBar({ days }) {
  const max = 365;
  const pct = Math.min(100, (days / max) * 100);
  const color = days < 30 ? 'bg-destructive' : days < 60 ? 'bg-yellow-500' : 'bg-accent';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-secondary rounded-full">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground w-12 text-right">{days}d left</span>
    </div>
  );
}

export default function SSL() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">SSL Certificates</h1>
        <p className="text-xs text-muted-foreground mt-1">{CERTS.length} active certificates</p>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {['Domain', 'Issuer', 'Issued', 'Expires', 'Validity'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CERTS.map((c, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span className="text-xs font-mono">{c.domain}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.issuer}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.issued}</td>
                <td className="px-4 py-3 text-xs">{c.expires}</td>
                <td className="px-4 py-3 w-48"><DaysBar days={c.days} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}