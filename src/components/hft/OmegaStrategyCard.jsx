import { Badge } from '@/components/ui/badge';
import { Radio, Cpu, Target, Wallet } from 'lucide-react';
import { useOmegaStatus } from '@/hooks/useOmegaStatus';

const WALLET = 'Eida3te...Bsxmp';

function minutesSince(ts) {
  if (!ts) return null;
  return Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
}

export default function OmegaStrategyCard() {
  const { status, strikes, scanCount, lastStrikeTs, liveStatus } = useOmegaStatus();

  const running = status?.running ?? true; // default to running while live
  const uptime = status?.uptime ?? null;
  const lastScan = status?.lastScan ?? status?.last_scan ?? null;
  const spreadBps = status?.spread ?? status?.lastSpread ?? null;
  const strikeCount = status?.strikes ?? strikes;
  const minsAgo = minutesSince(lastStrikeTs || status?.lastStrike);

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${running ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-destructive/40 bg-destructive/5'}`}>
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Radio className={`w-5 h-5 ${running ? 'text-emerald-400 animate-pulse' : 'text-destructive'}`} />
          <div>
            <p className="text-sm font-bold text-foreground">OMEGA Router — Jito Atomic Arbitrage</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">OMEGA Router v1.0 — Live on Solana Mainnet</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-[10px] font-bold ${running ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-destructive/20 text-destructive border-destructive/30'}`}>
            {running ? '● RUNNING' : '● STOPPED'}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">SOL/USDC Round-Trip Arbitrage</Badge>
          <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">Jito Atomic Bundle</Badge>
          <Badge className={`text-[10px] ${liveStatus === 'live' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-300'}`}>
            {liveStatus === 'live' ? 'API LIVE' : 'SIMULATED'}
          </Badge>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={<Cpu className="w-3 h-3" />} label="Scan Rate" value="4 Hz" />
        <Stat icon={<Target className="w-3 h-3" />} label="Gate Threshold" value="0.560 bps" />
        <Stat icon={<Target className="w-3 h-3" />} label="Current Spread" value={spreadBps != null ? `${spreadBps} bps` : '— bps'} />
        <Stat icon={<Radio className="w-3 h-3" />} label="STRIKEs Found" value={strikeCount ?? 0} highlight={!!strikeCount} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat icon={<Wallet className="w-3 h-3" />} label="Wallet" value={WALLET} mono />
        {uptime && <Stat label="Uptime" value={uptime} />}
        {lastScan && <Stat label="Last Scan" value={new Date(lastScan).toLocaleTimeString()} mono />}
        {minsAgo !== null && <Stat label="Last STRIKE" value={`${minsAgo}m ago`} highlight />}
        <Stat label="Scans (session)" value={(status?.scans ?? scanCount)?.toLocaleString() ?? '—'} />
        <Stat label="Jito Tip" value="0.000025 SOL" />
      </div>
    </div>
  );
}

function Stat({ icon, label, value, highlight, mono }) {
  return (
    <div className="bg-card/60 border border-border rounded-lg p-2.5">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
        {icon}{label}
      </div>
      <p className={`text-xs font-bold truncate ${highlight ? 'text-emerald-400' : 'text-foreground'} ${mono ? 'font-mono' : ''}`}>
        {String(value)}
      </p>
    </div>
  );
}