import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Cpu, Sparkles, Loader2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HFTStrategyOptimizer({ strategies = [], metrics = null }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const optimize = async () => {
    setLoading(true);
    setResult(null);

    const strategySummary = strategies.length > 0
      ? strategies.map(s =>
          `Strategy: ${s.name}, type: ${s.type}, active: ${s.active}, trades_today: ${s.trades_today??0}, pnl_today: $${s.pnl_today??0}, fill_rate: ${s.fill_rate??'?'}%, latency: ${s.latency_us??'?'}µs, params: ${JSON.stringify(s.params||{})}`
        ).join('\n')
      : 'No strategies loaded';

    const metricsSummary = metrics
      ? `Total PnL today: $${metrics.total_pnl_today??0}, orders/sec: ${metrics.orders_per_sec??0}, avg latency: ${metrics.avg_latency_us??0}µs`
      : 'No aggregate metrics available';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert HFT quant engineer. Analyze the following trading strategies and system metrics, then provide specific optimization recommendations.

Strategies:
${strategySummary}

Aggregate Metrics:
${metricsSummary}

Provide a JSON response with:
- overall_score: current system efficiency score 0-100
- health_label: "Excellent" | "Good" | "Fair" | "Poor"
- summary: 1-2 sentence system health overview
- optimizations: array (max 5) of { strategy_name, parameter, current_value, suggested_value, expected_improvement, rationale }
- quick_wins: array of strings (max 3) — immediate low-risk actions to take
- warnings: array of strings — risk flags or anomalies detected`,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number' },
          health_label:  { type: 'string' },
          summary:       { type: 'string' },
          optimizations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                strategy_name:        { type: 'string' },
                parameter:            { type: 'string' },
                current_value:        { type: 'string' },
                suggested_value:      { type: 'string' },
                expected_improvement: { type: 'string' },
                rationale:            { type: 'string' },
              },
            },
          },
          quick_wins: { type: 'array', items: { type: 'string' } },
          warnings:   { type: 'array', items: { type: 'string' } },
        },
      },
    });
    setResult(result);
    setLoading(false);
  };

  const scoreColor = (score) =>
    score >= 80 ? 'text-accent' : score >= 60 ? 'text-yellow-400' : 'text-destructive';

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <button
        className="w-full px-5 py-4 border-b border-border flex items-center gap-2 hover:bg-secondary/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <Cpu className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">AI Strategy Optimizer</h3>
        {result && (
          <span className={cn('ml-2 text-xs font-bold font-mono', scoreColor(result.overall_score || 0))}>
            {result.health_label} · {result.overall_score}/100
          </span>
        )}
        <span className="ml-auto">
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </span>
      </button>

      {expanded && (
        <div className="p-5 space-y-4">
          <Button onClick={optimize} disabled={loading || strategies.length === 0} size="sm" className="w-full gap-2">
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing strategies...</>
              : <><Sparkles className="w-3.5 h-3.5" /> Run AI Optimization Analysis</>
            }
          </Button>

          {loading && (
            <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm">Crunching quant data...</span>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Score & Summary */}
              <div className="flex items-center gap-4 rounded-lg bg-secondary/30 px-4 py-3">
                <div className="text-center">
                  <p className={cn('text-3xl font-bold font-mono', scoreColor(result.overall_score || 0))}>
                    {result.overall_score}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Score</p>
                </div>
                <div className="flex-1">
                  <p className={cn('text-xs font-semibold', scoreColor(result.overall_score || 0))}>{result.health_label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {/* Quick Wins */}
              {(result.quick_wins || []).length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Wins</p>
                  <div className="space-y-1.5">
                    {result.quick_wins.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] bg-accent/5 border border-accent/20 rounded-lg px-3 py-2 text-accent">
                        <span className="flex-shrink-0">✓</span> {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Param Optimizations */}
              {(result.optimizations || []).length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Parameter Optimizations</p>
                  <div className="space-y-2">
                    {result.optimizations.map((o, i) => (
                      <div key={i} className="rounded-lg bg-secondary/20 border border-border/50 p-3 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold truncate">{o.strategy_name}</p>
                          <span className="text-[10px] font-mono text-primary flex-shrink-0">{o.parameter}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="text-muted-foreground line-through">{o.current_value}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-accent font-bold">{o.suggested_value}</span>
                          {o.expected_improvement && (
                            <span className="ml-auto text-muted-foreground">{o.expected_improvement}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{o.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {(result.warnings || []).length > 0 && (
                <div className="space-y-1.5">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2 text-yellow-400">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {w}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}