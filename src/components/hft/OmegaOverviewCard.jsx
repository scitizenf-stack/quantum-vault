import { useOmegaStatus } from '@/hooks/useOmegaStatus';
import { Badge } from '@/components/ui/badge';
import { Radio, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_STYLE = {
  'STRIKE':     'text-emerald-400 font-bold',
  'GATE PASS':  'text-yellow-400',
  'BELOW GATE': 'text-muted-foreground',
};

const BADGE_STYLE = {
  'STRIKE':     'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'GATE PASS':  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'BELOW GATE': 'bg-secondary text-muted-foreground border-border',
};

export default function OmegaOverviewCard() {
  const { status, scans, strikes, scanCount, liveStatus } = useOmegaStatus();

  const running = status?.running ?? true;
  const displayStrikes = status?.strikes ?? strikes;
  const displayScans = status?.scans ?? scanCount;
  const last3 = scans.slice(0, 3);

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${running ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-destructive/30 bg-destructive/5'}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Radio className={`w-5 h-5 ${running ? 'text-emerald-400 animate-pulse' : 'text-destructive'}`} />
        <div>
          <p className="text-sm font-bold">OMEGA Router — Primary Active Strategy</p>
          <p className="text-[10px] text-muted-foreground font-mono">Jito Atomic Arbitrage · SOL/USDC · Live Solana Mainnet</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge className={`text-xs font-bold px-3 py-1 ${running ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-destructive/20 text-destructive border-destructive/40'}`}>
            {running ? '● RUNNING' : '● STOPPED'}
          </Badge>
          <Badge className={`text-[10px] ${liveStatus === 'live' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-300'}`}>
            {liveStatus === 'live' ? 'API LIVE' : 'SIMULATED'}
          </Badge>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card/60 border border-border rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Scans Today</p>
          <p className="text-lg font-bold font-mono">{displayScans?.toLocaleString() ?? 0}</p>
        </div>
        <div className="bg-card/60 border border-emerald-500/20 rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">STRIKEs Today</p>
          <p className="text-lg font-bold text-emerald-400 font-mono">{displayStrikes ?? 0}</p>
        </div>
        <div className="bg-card/60 border border-border rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Scan Rate</p>
          <p className="text-lg font-bold font-mono">4 Hz</p>
        </div>
      </div>

      {/* Last 3 scans */}
      {last3.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Last 3 Scans</p>
          <div className="space-y-1">
            {last3.map((scan, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-mono bg-card/40 border border-border/50 rounded-lg px-3 py-1.5">
                <span className="text-muted-foreground text-[10px]">
                  {scan.ts instanceof Date ? scan.ts.toLocaleTimeString() : new Date(scan.ts).toLocaleTimeString()}
                </span>
                <span className="text-foreground">{scan.pair}</span>
                <span className={STATUS_STYLE[scan.status]}>{scan.spread > 0 ? '+' : ''}{scan.spread} bps</span>
                <Badge className={`text-[10px] py-0 ml-auto ${BADGE_STYLE[scan.status]}`}>{scan.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link to="/hft/executions" className="text-[10px] text-primary hover:underline flex items-center gap-1">
        <Zap className="w-3 h-3" /> View full scan log →
      </Link>
    </div>
  );
}