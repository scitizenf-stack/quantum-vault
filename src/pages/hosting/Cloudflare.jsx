import React from 'react';
import { Shield, Zap, Lock, Globe, CheckCircle } from 'lucide-react';

const STATS = [
  { label: 'Threats Blocked (30d)', value: '1,247', icon: Shield, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' },
  { label: 'Zero Trust Tunnels', value: '8 Active', icon: Lock, color: 'text-primary', bg: 'bg-primary/10 border-primary/30' },
  { label: 'DDoS Protection', value: 'Active', icon: Zap, color: 'text-accent', bg: 'bg-accent/10 border-accent/30' },
  { label: 'TLS Version', value: '1.3', icon: Globe, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
];

const SERVICES = [
  { name: 'WAF (Web Application Firewall)', status: 'active', detail: 'OWASP Top 10 + Custom Rules' },
  { name: 'DDoS Mitigation', status: 'active', detail: 'Layer 3/4/7 protection' },
  { name: 'Zero Trust Access', status: 'active', detail: '8 tunnels, 23 policies' },
  { name: 'Bot Management', status: 'active', detail: 'ML-based bot scoring' },
  { name: 'Page Shield', status: 'active', detail: 'Script monitoring enabled' },
  { name: 'Rate Limiting', status: 'active', detail: '100 req/min per IP' },
];

export default function Cloudflare() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cloudflare</h1>
          <p className="text-xs text-muted-foreground mt-1">Security & Performance Platform</p>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-xl px-4 py-2">
          <CheckCircle className="w-4 h-4 text-accent" />
          <div>
            <p className="text-sm font-bold text-accent">87 / 100</p>
            <p className="text-[10px] text-muted-foreground">Security Score</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.bg}`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">Active Services</p>
        </div>
        {SERVICES.map((s, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-secondary/20">
            <div>
              <p className="text-xs font-medium">{s.name}</p>
              <p className="text-[10px] text-muted-foreground">{s.detail}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />Active
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}