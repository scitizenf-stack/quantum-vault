import React from 'react';
import { cn } from '@/lib/utils';

export default function LiveBadge({ timestamp, error }) {
  if (!timestamp && !error) return null;
  const ageMs = timestamp ? Date.now() - new Date(timestamp).getTime() : Infinity;
  const isLive = !error && ageMs < 60000;
  const isStale = !error && ageMs >= 60000;
  const isError = !!error;

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn(
        'w-2 h-2 rounded-full',
        isLive  && 'bg-accent animate-pulse',
        isStale && 'bg-yellow-400',
        isError && 'bg-destructive',
      )} />
      <span className={cn(
        'text-[10px] font-mono',
        isLive  && 'text-accent',
        isStale && 'text-yellow-400',
        isError && 'text-destructive',
      )}>
        {isLive  && 'LIVE'}
        {isStale && 'STALE'}
        {isError && 'ERROR'}
      </span>
      {timestamp && !isError && (
        <span className="text-[10px] text-muted-foreground font-mono">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      )}
    </div>
  );
}