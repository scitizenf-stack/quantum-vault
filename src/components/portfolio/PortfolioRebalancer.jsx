import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Sliders, RefreshCw, CheckCircle2, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ASSET_TYPES = ['crypto', 'stock', 'etf', 'bond', 'commodity'];

const TYPE_COLORS = {
  crypto:    'bg-chart-3',
  stock:     'bg-primary',
  etf:       'bg-accent',
  bond:      'bg-chart-4',
  commodity: 'bg-chart-5',
};

const TEXT_COLORS = {
  crypto:    'text-chart-3',
  stock:     'text-primary',
  etf:       'text-accent',
  bond:      'text-chart-4',
  commodity: 'text-chart-5',
};

function buildCurrentAlloc(assets) {
  const total = assets.reduce((s, a) => s + (a.quantity || 0) * (a.current_price || 0), 0);
  const map = {};
  ASSET_TYPES.forEach(t => { map[t] = 0; });
  assets.forEach(a => {
    const val = (a.quantity || 0) * (a.current_price || 0);
    if (map[a.type] !== undefined) map[a.type] += total > 0 ? (val / total) * 100 : 0;
  });
  return map;
}

export default function PortfolioRebalancer({ assets = [] }) {
  const currentAlloc = buildCurrentAlloc(assets);
  const [targets, setTargets] = useState(() => {
    const t = {};
    ASSET_TYPES.forEach(ty => { t[ty] = Math.round(currentAlloc[ty] || 0); });
    return t;
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const totalTarget = Object.values(targets).reduce((s, v) => s + v, 0);
  const valid = Math.abs(totalTarget - 100) <= 1;

  const setTarget = (type, val) => {
    setTargets(prev => ({ ...prev, [type]: Math.max(0, Math.min(100, Number(val))) }));
  };

  const generatePlan = async () => {
    setLoading(true);
    setPlan(null);
    const totalValue = assets.reduce((s, a) => s + (a.quantity || 0) * (a.current_price || 0), 0);
    const prompt = `You are a portfolio rebalancing advisor. Analyze the following and produce a concise rebalancing action plan.

Current portfolio total value: $${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}

Current allocation:
${ASSET_TYPES.map(t => `- ${t}: ${currentAlloc[t].toFixed(1)}%`).join('\n')}

Target allocation:
${ASSET_TYPES.map(t => `- ${t}: ${targets[t]}%`).join('\n')}

Assets held:
${assets.map(a => `- ${a.name} (${a.symbol}), type: ${a.type}, value: $${((a.quantity||0)*(a.current_price||0)).toLocaleString(undefined,{maximumFractionDigits:0})}`).join('\n')}

Output a JSON object with:
- summary: one-sentence plan overview
- actions: array of { asset, action (BUY/SELL/HOLD), amount_usd, rationale }
- risk_note: brief risk warning`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                asset: { type: 'string' },
                action: { type: 'string' },
                amount_usd: { type: 'number' },
                rationale: { type: 'string' },
              },
            },
          },
          risk_note: { type: 'string' },
        },
      },
    });
    setPlan(result);
    setLoading(false);
  };

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Sliders className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Portfolio Rebalancer</h3>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground">
          Total target: <span className={cn('font-bold', valid ? 'text-accent' : 'text-destructive')}>{totalTarget}%</span>
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Allocation Sliders */}
        <div className="space-y-3">
          {ASSET_TYPES.map(type => (
            <div key={type} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={cn('font-medium capitalize', TEXT_COLORS[type])}>{type}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-mono">Now: {currentAlloc[type].toFixed(1)}%</span>
                  <span className="font-mono font-bold w-10 text-right">{targets[type]}%</span>
                </div>
              </div>
              <div className="relative h-5 flex items-center gap-2">
                {/* current marker */}
                <div className="absolute top-0 h-full w-full pointer-events-none">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-muted-foreground/50 rounded"
                    style={{ left: `${currentAlloc[type]}%` }}
                  />
                </div>
                <input
                  type="range" min={0} max={100} value={targets[type]}
                  onChange={e => setTarget(type, e.target.value)}
                  className="w-full h-1.5 appearance-none rounded-full bg-secondary cursor-pointer accent-primary"
                />
              </div>
              {/* Bar visual */}
              <div className="h-1 rounded-full bg-secondary overflow-hidden">
                <div className={cn('h-full rounded-full transition-all', TYPE_COLORS[type])} style={{ width: `${targets[type]}%` }} />
              </div>
            </div>
          ))}
        </div>

        {!valid && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Target allocations must sum to 100% (currently {totalTarget}%)
          </div>
        )}

        <Button
          onClick={generatePlan}
          disabled={!valid || loading || assets.length === 0}
          className="w-full gap-2"
          size="sm"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {loading ? 'Generating AI Rebalance Plan...' : 'Generate Rebalance Plan'}
        </Button>

        {/* Plan output */}
        {plan && (
          <div className="space-y-3 pt-2">
            <div className="rounded-lg bg-secondary/40 px-4 py-3">
              <p className="text-xs font-medium text-foreground">{plan.summary}</p>
            </div>
            <div className="space-y-2">
              {(plan.actions || []).map((a, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/20 px-3 py-2.5">
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded border flex-shrink-0 mt-0.5',
                    a.action === 'BUY'  ? 'bg-accent/10 text-accent border-accent/20' :
                    a.action === 'SELL' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                         'bg-secondary text-muted-foreground border-border'
                  )}>
                    {a.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">{a.asset}</p>
                      {a.amount_usd > 0 && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          ${a.amount_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{a.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
            {plan.risk_note && (
              <div className="flex items-start gap-2 text-[11px] text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                {plan.risk_note}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}