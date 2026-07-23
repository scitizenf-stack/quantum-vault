import React from 'react';
import { cn } from '@/lib/utils';

export default function AdminStatCard({ title, value, sub, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    green: 'text-emerald-400 bg-emerald-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
  };

  return (
    <div className="rounded-xl bg-card border border-border p-5 flex items-center gap-4">
      <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0', colorMap[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{title}</p>
        <p className="text-xl font-bold font-mono truncate">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}