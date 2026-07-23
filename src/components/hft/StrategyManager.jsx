import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

const STATUS_BORDER = { ACTIVE: 'border-accent/50', PAUSED: 'border-yellow-500/50', STOPPED: 'border-destructive/50' };
const STATUS_DOT = { ACTIVE: 'bg-accent', PAUSED: 'bg-yellow-400', STOPPED: 'bg-destructive' };

export default function StrategyManager({ strategies, isLoading, selectedId, onSelect, onToggle, onNew }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">Strategy Manager</p>
        <Button size="sm" className="gap-1.5 text-xs" onClick={onNew}>
          <Plus className="w-3.5 h-3.5" />New <kbd className="ml-1 text-[9px] opacity-60">Ctrl+N</kbd>
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : strategies.length === 0 ? (
        <div className="text-center text-xs text-muted-foreground py-8">No strategies configured</div>
      ) : (
        <div className="space-y-2">
          {strategies.map(s => (
            <button key={s.id} onClick={() => onSelect(s.id)}
              className={`w-full text-left rounded-xl border bg-card p-3 transition-colors hover:bg-secondary/30 ${STATUS_BORDER[s.status] || 'border-border'} ${selectedId === s.id ? 'ring-1 ring-primary' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-mono font-bold truncate">{s.name}</p>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[s.status] || 'bg-muted-foreground'}`} />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <Badge variant="outline" className="text-[9px]">{s.type}</Badge>
                <span className="text-[10px] font-mono text-muted-foreground">{s.targetPair || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                <div><p className="text-[9px] text-muted-foreground">P&L</p><p className={`text-[11px] font-mono font-bold ${(s.pnl || 0) >= 0 ? 'text-accent' : 'text-destructive'}`}>{s.pnl != null ? `${s.pnl >= 0 ? '+' : ''}$${s.pnl.toLocaleString('en-US', { minimumFractionDigits: 0 })}` : '—'}</p></div>
                <div><p className="text-[9px] text-muted-foreground">Win</p><p className="text-[11px] font-mono font-bold">{s.winRate != null ? `${s.winRate.toFixed(1)}%` : '—'}</p></div>
                <div><p className="text-[9px] text-muted-foreground">Trades</p><p className="text-[11px] font-mono font-bold">{s.trades?.toLocaleString() ?? '—'}</p></div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <span className="text-[9px] text-muted-foreground">{s.status}</span>
                <button onClick={(e) => { e.stopPropagation(); onToggle(s); }}
                  className={`relative w-9 h-5 rounded-full transition-colors ${s.status === 'ACTIVE' ? 'bg-accent' : 'bg-secondary'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}