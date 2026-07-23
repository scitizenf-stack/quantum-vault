import React from 'react';

const LINES = [
  { line: 'Line 1 — Primary', data: { used: 48.3, total: 100 }, voice: { used: 847, total: 1200 }, sms: { used: 234, total: 500 } },
  { line: 'Line 2 — Roaming', data: { used: 2.1, total: 15 }, voice: { used: 12, total: 200 }, sms: { used: 7, total: 100 } },
  { line: 'Line 3 — IoT', data: { used: 0.4, total: 5 }, voice: { used: 0, total: 0 }, sms: { used: 312, total: 1000 } },
];

function Bar({ used, total, color }) {
  if (!total) return <span className="text-[10px] text-muted-foreground">N/A</span>;
  const pct = Math.min(100, (used / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
        <span>{used} / {total}</span><span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full"><div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function TelecomUsage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Usage</h1>
        <p className="text-xs text-muted-foreground mt-1">Billing cycle resets Jun 1, 2026</p>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Line</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-40">Data (GB)</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-40 hidden md:table-cell">Voice (min)</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-40 hidden md:table-cell">SMS</th>
            </tr>
          </thead>
          <tbody>
            {LINES.map(l => (
              <tr key={l.line} className="border-b border-border/50">
                <td className="px-4 py-4 text-xs font-medium">{l.line}</td>
                <td className="px-4 py-4"><Bar used={l.data.used} total={l.data.total} color="bg-primary" /></td>
                <td className="px-4 py-4 hidden md:table-cell"><Bar used={l.voice.used} total={l.voice.total} color="bg-accent" /></td>
                <td className="px-4 py-4 hidden md:table-cell"><Bar used={l.sms.used} total={l.sms.total} color="bg-chart-3" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}