import React from 'react';
import { cn } from '@/lib/utils';

export default function SentimentGauge({ sentiment }) {
  const score = sentiment?.score ?? 0.5; // 0=extreme fear, 1=extreme greed
  const pct = Math.round(score * 100);

  const getLabel = (s) => {
    if (s < 0.2) return { label: 'Extreme Fear', color: 'text-destructive' };
    if (s < 0.4) return { label: 'Fear', color: 'text-orange-400' };
    if (s < 0.6) return { label: 'Neutral', color: 'text-yellow-400' };
    if (s < 0.8) return { label: 'Greed', color: 'text-emerald-400' };
    return { label: 'Extreme Greed', color: 'text-emerald-300' };
  };

  const { label, color } = getLabel(score);

  // Arc path (semicircle)
  const r = 60;
  const cx = 80;
  const cy = 75;
  const startAngle = Math.PI;
  const endAngle = 0;
  const needleAngle = Math.PI - (score * Math.PI);
  const nx = cx + r * Math.cos(needleAngle);
  const ny = cy + r * Math.sin(needleAngle);

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <h3 className="text-xs font-semibold mb-3 tracking-wide">Market Sentiment</h3>
      <div className="flex flex-col items-center">
        <svg width="160" height="90" viewBox="0 0 160 90">
          {/* Background arc */}
          <path d={arcPath} fill="none" stroke="hsl(var(--border))" strokeWidth="10" strokeLinecap="round" />
          {/* Colored arc segments */}
          {[
            { start: 0, end: 0.2, color: '#ef4444' },
            { start: 0.2, end: 0.4, color: '#f97316' },
            { start: 0.4, end: 0.6, color: '#eab308' },
            { start: 0.6, end: 0.8, color: '#22c55e' },
            { start: 0.8, end: 1,   color: '#86efac' },
          ].map(({ start, end, color: c }, i) => {
            const sa = Math.PI - (start * Math.PI);
            const ea = Math.PI - (end * Math.PI);
            const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa);
            const x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea);
            return <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={c} strokeWidth="10" strokeLinecap="round" />;
          })}
          {/* Needle */}
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="4" fill="hsl(var(--foreground))" />
        </svg>
        <p className={cn('text-xl font-bold font-mono -mt-2', color)}>{pct}</p>
        <p className={cn('text-xs font-semibold mt-1', color)}>{label}</p>
        {sentiment?.sources && (
          <p className="text-[10px] text-muted-foreground mt-2">Based on {sentiment.sources} data sources</p>
        )}
      </div>
    </div>
  );
}