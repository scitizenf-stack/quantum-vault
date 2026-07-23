import { useOmegaStatus } from '@/hooks/useOmegaStatus';
import { Badge } from '@/components/ui/badge';
import { Radio } from 'lucide-react';

function minutesSince(ts) {
  if (!ts) return null;
  return Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
}

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

export default function OmegaScanLog() {
  const { scans, strikes, scanCount, lastStrikeTs, liveStatus, status } = useOmegaStatus();

  const lastScan = scans[0];
  const minsAgo = minutesSince(lastStrikeTs || status?.lastStrike);
  const running = status?.running ?? true;
  const displayStrikes = status?.strikes ?? strikes;
  const displayScans = status?.scans ?? scanCount;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${running ? 'text-emerald-400 animate-pulse' : 'text-muted-foreground'}`} />
          <span className="text-sm font-bold">OMEGA Scanner — Live Scan Log</span>
        </div>
        <Badge className={`text-[10px] ${liveStatus === 'live' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-300'}`}>
          {liveStatus === 'live' ? 'API LIVE' : 'SIMULATED · 4 Hz'}
        </Badge>
        <div className="ml-auto flex flex-wrap gap-4 text-xs font-mono text-muted-foreground">
          <span>Scans: <span className="text-foreground font-bold">{displayScans?.toLocaleString() ?? 0}</span></span>
          <span>STRIKEs: <span className="text-emerald-400 font-bold">{displayStrikes ?? 0}</span></span>
          {minsAgo !== null && (
            <span>Last STRIKE: <span className="text-emerald-400 font-bold">{minsAgo}m ago</span>
              {lastStrikeTs && scans.find(s => s.status === 'STRIKE') &&
                <span className="text-emerald-300"> · {scans.find(s => s.status === 'STRIKE')?.spread} bps</span>
              }
            </span>
          )}
        </div>
      </div>

      {/* Scan log table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-secondary/50 border-b border-border px-3 py-2 grid grid-cols-4 gap-2 text-[10px] font-semibold text-muted-foreground">
          <span>Time</span>
          <span>Pair</span>
          <span>Spread (bps)</span>
          <span>Result</span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {scans.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              <div className="flex justify-center mb-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              OMEGA Router scanning at 4 Hz — results will appear here
            </div>
          ) : scans.map((scan, i) => (
            <div key={i} className={`grid grid-cols-4 gap-2 px-3 py-1.5 text-xs border-b border-border/30 font-mono hover:bg-secondary/20 ${i === 0 ? 'bg-secondary/30' : ''}`}>
              <span className="text-muted-foreground text-[10px]">
                {scan.ts instanceof Date ? scan.ts.toLocaleTimeString() : new Date(scan.ts).toLocaleTimeString()}
              </span>
              <span className="text-foreground">{scan.pair}</span>
              <span className={STATUS_STYLE[scan.status]}>{scan.spread > 0 ? '+' : ''}{scan.spread}</span>
              <span>
                <Badge className={`text-[10px] py-0 ${BADGE_STYLE[scan.status]}`}>{scan.status}</Badge>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}