import React from 'react';
import { useOmegaStatus } from '@/hooks/useOmegaStatus';
import { Activity, Zap, Crosshair, Wifi } from 'lucide-react';

function MetricCard({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</p>
      </div>
      <p className={`text-2xl font-mono font-bold ${color}`}>{value}<span className="text-xs text-muted-foreground ml-1">{unit}</span></p>
    </div>
  );
}

const STATUS_COLOR = { live: 'text-accent', simulated: 'text-yellow-400', connecting: 'text-muted-foreground' };

export default function BrainMonitorTab() {
  const { status, scans, strikes, scanCount, lastStrikeTs, liveStatus } = useOmegaStatus();

  const scanRate = scans.length > 0 ? (scans.length / 5).toFixed(1) : '0';
  const latency = status?.latency_ms || (liveStatus === 'simulated' ? Math.round(180 + Math.random() * 40) : '—');
  const online = liveStatus === 'live' || liveStatus === 'simulated';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Activity} label="Scan Rate" value={scanRate} unit="ops/s" color="text-blue-400" />
        <MetricCard icon={Zap} label="Latency" value={latency} unit="ms" color="text-accent" />
        <MetricCard icon={Crosshair} label="Signals Detected" value={scanCount} unit="" color="text-yellow-400" />
        <MetricCard icon={Wifi} label="Status" value={liveStatus.toUpperCase()} unit="" color={STATUS_COLOR[liveStatus] || 'text-muted-foreground'} />
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold tracking-widest uppercase">Live Scan Feed</h3>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${online ? 'bg-accent animate-pulse' : 'bg-muted-foreground/40'}`} />
            <span className="text-[10px] font-mono text-muted-foreground">{online ? 'STREAMING' : 'OFFLINE'}</span>
          </div>
        </div>

        {scans.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Waiting for scan data…</p>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {scans.map((s, i) => {
              const color = s.status === 'STRIKE' ? 'text-accent' : s.status === 'GATE PASS' ? 'text-yellow-400' : 'text-muted-foreground';
              return (
                <div key={i} className="flex items-center justify-between text-[10px] font-mono px-2 py-1 rounded hover:bg-secondary/30">
                  <span className="text-muted-foreground">{s.ts.toLocaleTimeString()}</span>
                  <span className="font-semibold">{s.pair}</span>
                  <span className={color}>{s.status}</span>
                  <span className={s.spread >= 0 ? 'text-accent' : 'text-destructive'}>{s.spread >= 0 ? '+' : ''}{s.spread.toFixed(3)}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-xs font-bold tracking-widest uppercase mb-3">Strike Summary</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><p className="text-[10px] text-muted-foreground uppercase">Total Strikes</p><p className="text-xl font-mono font-bold text-accent">{strikes}</p></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Total Scans</p><p className="text-xl font-mono font-bold">{scanCount}</p></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Hit Rate</p><p className="text-xl font-mono font-bold text-yellow-400">{scanCount > 0 ? ((strikes / scanCount) * 100).toFixed(1) : '0.0'}%</p></div>
        </div>
        {lastStrikeTs && <p className="text-[10px] text-muted-foreground font-mono text-center mt-3">Last strike: {lastStrikeTs.toLocaleTimeString()}</p>}
      </div>
    </div>
  );
}