import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, AlertTriangle, Zap, Activity, RefreshCw } from 'lucide-react';

/**
 * Displays the live Sovereign Root state fields returned by /api/dashboard:
 * trading_state, circuit_breaker, backoff, consecutive_429s,
 * total_equity_usd, daily_volume_sol, open_positions, status
 */
export default function SovereignStateBar({ data, isLoading }) {
  if (isLoading) return null;

  const status       = data?.status          || 'UNKNOWN';
  const tradingState = data?.trading_state   || 'UNKNOWN';
  const cb           = data?.circuit_breaker;
  const backoff      = data?.backoff;
  const c429s        = data?.consecutive_429s ?? 0;
  const openPos      = data?.open_positions   ?? 0;

  const isOperational = status === 'OPERATIONAL';
  const isCB          = status === 'CIRCUIT_BREAKER';

  return (
    <div className={cn(
      'rounded-xl border px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono',
      isCB
        ? 'bg-destructive/10 border-destructive/30'
        : isOperational
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-secondary border-border'
    )}>
      {/* Status pill */}
      <div className="flex items-center gap-1.5">
        {isCB
          ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
          : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        }
        <span className={cn('font-bold tracking-widest text-[10px]', isCB ? 'text-destructive' : 'text-emerald-400')}>
          {status}
        </span>
      </div>

      <Field label="TRADING" value={tradingState} highlight={tradingState === 'ACTIVE'} />
      <Field label="CIRCUIT BREAKER" value={cb ? 'TRIGGERED' : 'CLEAR'} warn={!!cb} />
      <Field label="BACKOFF" value={backoff != null ? `${backoff}s` : '—'} />
      <Field label="429s" value={c429s} warn={c429s > 0} />
      <Field label="OPEN POS" value={openPos} />

      <div className="ml-auto flex items-center gap-1 text-muted-foreground">
        <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
        <span className="text-[9px] tracking-widest">SOVEREIGN ROOT · OMEGA v4</span>
      </div>
    </div>
  );
}

function Field({ label, value, highlight, warn }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground text-[9px] tracking-widest">{label}:</span>
      <span className={cn(
        'font-bold',
        highlight ? 'text-emerald-400' : warn ? 'text-yellow-400' : 'text-foreground'
      )}>
        {String(value)}
      </span>
    </div>
  );
}