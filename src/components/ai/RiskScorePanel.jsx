import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

export default function RiskScorePanel({ riskData }) {
  const score = riskData?.overall_score ?? 50;
  const isLow = score < 40;
  const isHigh = score > 70;
  const Icon = isLow ? ShieldCheck : isHigh ? ShieldAlert : Shield;
  const color = isLow ? 'text-emerald-400' : isHigh ? 'text-destructive' : 'text-yellow-400';
  const barColor = isLow ? 'bg-emerald-500' : isHigh ? 'bg-destructive' : 'bg-yellow-500';

  const factors = riskData?.factors || [];

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <h3 className="text-xs font-semibold mb-3 tracking-wide">Portfolio Risk Score</h3>
      <div className="flex items-center gap-4 mb-4">
        <div className={cn('w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center', isHigh ? 'border-destructive/30' : isLow ? 'border-emerald-500/30' : 'border-yellow-500/30')}>
          <Icon className={cn('w-6 h-6', color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className={cn('text-3xl font-bold font-mono', color)}>{score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
          <div className="mt-1.5 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>
      {factors.length > 0 && (
        <div className="space-y-2">
          {factors.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{f.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1 bg-secondary rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', f.score > 70 ? 'bg-destructive' : f.score < 40 ? 'bg-emerald-500' : 'bg-yellow-500')} style={{ width: `${f.score}%` }} />
                </div>
                <span className="font-mono text-foreground w-6 text-right">{f.score}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}