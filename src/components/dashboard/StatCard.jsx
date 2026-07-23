import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, change, icon: Icon, trend, subtitle }) {
  const isPositive = trend === 'up';
  
  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border p-5 group hover:border-primary/30 transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8 group-hover:bg-primary/10 transition-all duration-500" />
      
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-2 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-[10px] font-mono text-muted-foreground mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs font-semibold",
              isPositive ? "text-accent" : "text-destructive"
            )}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPositive ? '+' : ''}{change}%</span>
              <span className="text-muted-foreground font-normal ml-1">24h</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}