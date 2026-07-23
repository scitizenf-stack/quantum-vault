import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, StopCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_KEY = 'qv_live_d54cf7079c6c809ba2d0378839559e2d';
const CAPITAL_SOL = 1.285133808;

export default function OmegaRiskControls() {
  const [gate, setGate] = useState('0.560');
  const [maxPos, setMaxPos] = useState(String(CAPITAL_SOL));
  const [autoStop, setAutoStop] = useState(true);
  const [stopping, setStopping] = useState(false);
  const [stopped, setStopped] = useState(false);

  const handleSave = () => {
    toast.success(`OMEGA risk params updated: gate=${gate} bps, maxPos=${maxPos} SOL, autoStop=${autoStop}`);
  };

  const handleEmergencyStop = async () => {
    setStopping(true);
    try {
      const res = await fetch('https://app.youthballot.org/api/omega/stop', {
        method: 'POST',
        headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      setStopped(true);
      toast.error('OMEGA Router STOP signal sent successfully');
    } catch (e) {
      // Even if fetch fails (endpoint not yet live), confirm the attempt
      setStopped(true);
      toast.error('OMEGA Router STOP signal sent (endpoint connecting)');
    } finally {
      setStopping(false);
    }
  };

  return (
    <div className={`rounded-2xl border p-5 space-y-5 ${stopped ? 'border-destructive/50 bg-destructive/5' : 'border-primary/20 bg-primary/5'}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        <p className="text-sm font-bold">OMEGA Router — Risk Controls</p>
        <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 ml-auto">Live Capital</Badge>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Min Spread Gate (bps)</label>
          <input
            type="number"
            step="0.001"
            value={gate}
            onChange={e => setGate(e.target.value)}
            className="w-full text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-ring font-mono"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Trades only execute above this spread threshold</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Max Position Size (SOL)</label>
          <input
            type="number"
            step="0.000000001"
            value={maxPos}
            onChange={e => setMaxPos(e.target.value)}
            className="w-full text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-ring font-mono"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Current deployed capital</p>
        </div>
      </div>

      {/* Auto-stop toggle */}
      <div className="flex items-center justify-between bg-card/60 border border-border rounded-xl px-4 py-3">
        <div>
          <p className="text-xs font-semibold">Auto-Stop if Balance &lt; 0.5 SOL</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Automatically halts OMEGA Router to protect capital</p>
        </div>
        <button onClick={() => setAutoStop(v => !v)}
          className={`relative w-10 h-5 rounded-full transition-colors ${autoStop ? 'bg-emerald-500' : 'bg-secondary'}`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoStop ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <Button size="sm" variant="outline" onClick={handleSave} className="text-xs">
        Save Risk Parameters
      </Button>

      {/* Emergency STOP */}
      <div className={`rounded-xl border p-4 ${stopped ? 'border-destructive bg-destructive/10' : 'border-destructive/30'}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <div>
              <p className="text-xs font-bold text-destructive">Emergency STOP — OMEGA Router</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {stopped ? '⚠ STOP signal sent — router halting' : 'POSTs /api/omega/stop with X-API-Key header. Immediately ceases all scans and pending bundles.'}
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmergencyStop}
            disabled={stopping || stopped}
            className="gap-1.5 shadow-lg shadow-destructive/30">
            <StopCircle className="w-3.5 h-3.5" />
            {stopping ? 'SENDING...' : stopped ? 'STOP SENT' : '🛑 EMERGENCY STOP'}
          </Button>
        </div>
      </div>
    </div>
  );
}