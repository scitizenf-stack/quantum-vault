import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertOctagon, Zap } from 'lucide-react';

export default function CommandTopBar({ strategies, onEmergencyStop, stopping }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const totalPnl = strategies.reduce((s, st) => s + (st.pnl || 0), 0);
  const active = strategies.filter(s => s.status === 'ACTIVE').length;
  const stopped = strategies.filter(s => s.status === 'STOPPED').length;
  const status = strategies.length && stopped === strategies.length ? 'OFFLINE' : active > 0 ? 'NOMINAL' : 'DEGRADED';
  const statusColor = status === 'NOMINAL' ? 'text-accent' : status === 'DEGRADED' ? 'text-yellow-400' : 'text-destructive';
  const dotColor = status === 'NOMINAL' ? 'bg-accent animate-pulse' : status === 'DEGRADED' ? 'bg-yellow-400' : 'bg-destructive';

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wider">QUANTUM VAULT</p>
          <p className="text-[10px] text-muted-foreground">Command Center</p>
        </div>
      </div>

      <div className="flex items-center gap-5 flex-wrap">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Clock</p>
          <p className="text-sm font-mono font-bold tabular-nums">{now.toLocaleTimeString('en-US', { hour12: false })}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total P&L</p>
          <p className={`text-sm font-mono font-bold tabular-nums ${totalPnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</p>
          <p className="text-sm font-mono font-bold">{active}/{strategies.length}</p>
        </div>
        <div className="text-center flex flex-col items-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">System</p>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className={`text-xs font-bold ${statusColor}`}>{status}</span>
          </div>
        </div>
      </div>

      <Button variant="destructive" onClick={onEmergencyStop} disabled={stopping} className="gap-1.5 shadow-lg shadow-destructive/30">
        <AlertOctagon className="w-4 h-4" /> EMERGENCY STOP ALL
      </Button>
    </div>
  );
}