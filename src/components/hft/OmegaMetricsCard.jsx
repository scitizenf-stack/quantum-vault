import { useOmegaStatus } from '@/hooks/useOmegaStatus';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Cpu, Radio } from 'lucide-react';

const CAPITAL_SOL = 1.285133808;
const JITO_TIP_SOL = 0.000025;

export default function OmegaMetricsCard() {
  const { status, strikes, scanCount, liveStatus } = useOmegaStatus();

  const displayStrikes = status?.strikes ?? strikes;
  const displayScans = status?.scans ?? scanCount;
  const tradesExecuted = status?.trades_executed ?? status?.tradesExecuted ?? 0;

  const stats = [
    { label: 'Scans This Session', value: displayScans?.toLocaleString() ?? '0', icon: <Cpu className="w-3 h-3" /> },
    { label: 'STRIKEs Found', value: displayStrikes ?? 0, icon: <Radio className="w-3 h-3" />, green: true },
    { label: 'Trades Executed', value: tradesExecuted, icon: <Zap className="w-3 h-3" /> },
    { label: 'Jito Tip / Trade', value: `${JITO_TIP_SOL} SOL`, icon: <Zap className="w-3 h-3" /> },
    { label: 'Capital Deployed', value: `${CAPITAL_SOL} SOL`, icon: <Shield className="w-3 h-3" /> },
    { label: 'Gate Threshold', value: '0.560 bps', icon: <Radio className="w-3 h-3" /> },
  ];

  return (
    <div className="bg-card border border-primary/20 rounded-2xl p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary animate-pulse" />
          <p className="text-sm font-bold">OMEGA Router Performance</p>
        </div>
        <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">Jito Zero-Loss Atomic Arbitrage</Badge>
        <Badge className={`text-[10px] ml-auto ${liveStatus === 'live' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
          {liveStatus === 'live' ? 'API LIVE' : 'SIMULATED'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-secondary/40 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1.5">
              {s.icon}{s.label}
            </div>
            <p className={`text-sm font-bold font-mono ${s.green ? 'text-emerald-400' : 'text-foreground'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-secondary/20 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span><span className="text-emerald-400 font-semibold">Jito revert protection:</span> failed bundles cost $0 — only successful trades pay the Jito tip.</span>
      </div>

      <p className="text-[10px] text-muted-foreground font-mono">
        OMEGA Router v1.0 — Live on Solana Mainnet · Strategy: SOL/USDC Round-Trip Arbitrage
      </p>
    </div>
  );
}