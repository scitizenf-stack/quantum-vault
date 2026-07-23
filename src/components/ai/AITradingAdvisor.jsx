import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Brain, Send, Loader2, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

const QUICK_QUERIES = [
  'What should I buy today?',
  'Analyze my risk exposure',
  'Best DeFi opportunities',
  'When to take profits on SOL?',
];

const ACTION_COLORS = {
  BUY:   'bg-accent/10 text-accent border-accent/20',
  SELL:  'bg-destructive/10 text-destructive border-destructive/20',
  HOLD:  'bg-secondary text-muted-foreground border-border',
  WATCH: 'bg-primary/10 text-primary border-primary/20',
};

export default function AITradingAdvisor({ portfolio = [], signals = [] }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);

  const portfolioSummary = portfolio.length > 0
    ? portfolio.map(a => `${a.symbol}: $${((a.quantity||0)*(a.current_price||0)).toLocaleString(undefined,{maximumFractionDigits:0})} (${a.type})`).join(', ')
    : 'No portfolio data available';

  const signalsSummary = signals.length > 0
    ? signals.slice(0,5).map(s => `${s.symbol||s.asset||'?'}: ${s.type} signal`).join(', ')
    : 'No active signals';

  const ask = async (q) => {
    const question = q || query;
    if (!question.trim()) return;
    setLoading(true);
    setAdvice(null);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert AI trading advisor for a sovereign crypto/equities portfolio. Be specific, data-driven, and concise.

Portfolio: ${portfolioSummary}
Active Signals: ${signalsSummary}
Current Date: ${new Date().toISOString().split('T')[0]}

User question: "${question}"

Respond with a JSON object:
- summary: 1-2 sentence direct answer
- recommendations: array (max 4) of { asset, action (BUY/SELL/HOLD/WATCH), confidence_pct (0-100), rationale, timeframe }
- market_context: brief relevant market context (1-2 sentences)
- caution: any important risk caveat`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                asset:          { type: 'string' },
                action:         { type: 'string' },
                confidence_pct: { type: 'number' },
                rationale:      { type: 'string' },
                timeframe:      { type: 'string' },
              },
            },
          },
          market_context: { type: 'string' },
          caution:        { type: 'string' },
        },
      },
    });
    setAdvice({ ...result, question });
    setLoading(false);
    setQuery('');
  };

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Brain className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold">AI Trading Advisor</h3>
        {advice && (
          <button onClick={() => setAdvice(null)} className="ml-auto text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> New query
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Quick queries */}
        {!advice && (
          <div className="flex flex-wrap gap-2">
            {QUICK_QUERIES.map(q => (
              <button key={q} onClick={() => ask(q)}
                className="text-[10px] px-3 py-1.5 rounded-full border border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        {!advice && (
          <div className="flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask()}
              placeholder="Ask the AI advisor anything..."
              className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
            />
            <Button size="sm" onClick={() => ask()} disabled={!query.trim() || loading} className="flex-shrink-0 gap-1.5">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            <span className="text-sm">Analyzing markets...</span>
          </div>
        )}

        {/* Advice output */}
        {advice && !loading && (
          <div className="space-y-4">
            <div className="text-[10px] font-mono text-muted-foreground px-1">Q: {advice.question}</div>

            {/* Summary */}
            <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 px-4 py-3">
              <p className="text-sm text-foreground leading-relaxed">{advice.summary}</p>
            </div>

            {/* Recommendations */}
            {(advice.recommendations || []).length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recommendations</p>
                {advice.recommendations.map((r, i) => (
                  <div key={i} className="rounded-lg bg-secondary/20 border border-border/50 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border', ACTION_COLORS[r.action] || ACTION_COLORS.HOLD)}>
                        {r.action}
                      </span>
                      <span className="text-sm font-semibold">{r.asset}</span>
                      <span className="ml-auto text-[10px] font-mono text-muted-foreground">{r.timeframe}</span>
                      {r.confidence_pct != null && (
                        <div className="flex items-center gap-1">
                          <div className="h-1 w-12 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${r.confidence_pct}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-accent">{r.confidence_pct}%</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{r.rationale}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Market context */}
            {advice.market_context && (
              <div className="text-[11px] text-muted-foreground bg-secondary/20 rounded-lg px-3 py-2 leading-relaxed">
                📊 {advice.market_context}
              </div>
            )}

            {/* Caution */}
            {advice.caution && (
              <div className="text-[11px] text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2 leading-relaxed">
                ⚠️ {advice.caution}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}