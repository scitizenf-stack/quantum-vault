import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function marketOpen() {
  const d = new Date();
  const mins = d.getUTCHours() * 60 + d.getUTCMinutes();
  return mins >= 13 * 60 + 30 && mins < 20 * 60;
}

export default function CommandHeader({ aum }) {
  const now = useClock();
  const open = marketOpen();
  const time = now.toISOString().slice(11, 19);
  const aumStr = aum != null
    ? `$${Number(aum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* Left: logo + OMEGA badge */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold tracking-tight leading-none">QUANTUM VAULT</h1>
          <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase mt-0.5">Command Center</p>
        </div>
        <span className="ml-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest" style={{ backgroundColor: 'hsl(51 100% 50% / 0.12)', color: 'hsl(51 100% 50%)' }}>OMEGA</span>
      </div>

      {/* Center: live clock */}
      <div className="text-center">
        <span className="text-xl font-mono font-bold tabular-nums tracking-widest text-foreground">{time}</span>
        <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">UTC · Live</p>
      </div>

      {/* Right: AUM + market status */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">Total AUM</p>
          <p className="text-lg font-mono font-bold text-foreground tabular-nums">{aumStr}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest font-mono whitespace-nowrap ${open ? 'bg-accent/15 text-accent' : 'bg-destructive/15 text-destructive'}`}>
          {open ? 'MARKET OPEN' : 'MARKET CLOSED'}
        </span>
      </div>
    </div>
  );
}