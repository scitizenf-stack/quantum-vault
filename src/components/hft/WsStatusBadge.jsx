import React from 'react';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const configs = {
  live:         { label: 'LIVE',         color: 'text-emerald-400', dot: 'bg-emerald-400', icon: Wifi },
  connecting:   { label: 'CONNECTING',   color: 'text-yellow-400',  dot: 'bg-yellow-400',  icon: RefreshCw, spin: true },
  reconnecting: { label: 'RECONNECTING', color: 'text-yellow-400',  dot: 'bg-yellow-400',  icon: RefreshCw, spin: true },
  error:        { label: 'DISCONNECTED', color: 'text-destructive', dot: 'bg-destructive',  icon: WifiOff },
};

export default function WsStatusBadge({ status }) {
  const cfg = configs[status] || configs.connecting;
  const Icon = cfg.icon;
  return (
    <div className={cn('flex items-center gap-1.5 text-[10px] font-bold tracking-widest', cfg.color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot, status === 'live' && 'animate-pulse')} />
      <Icon className={cn('w-3 h-3', cfg.spin && 'animate-spin')} />
      {cfg.label}
    </div>
  );
}