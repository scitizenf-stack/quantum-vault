/**
 * MeshTelemetry — Real-time Omega Mesh WebSocket telemetry panel
 * Subscribes to ticker, trades, orderbook, hft channels via useMeshStream
 */
import React, { useState } from 'react';
import { useMeshStream } from '@/lib/useMeshStream';
import { Activity, Zap, TrendingUp, TrendingDown, Radio, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  live:         { color: 'bg-accent',       label: 'LIVE',         pulse: true  },
  connecting:   { color: 'bg-yellow-500',   label: 'CONNECTING',   pulse: true  },
  reconnecting: { color: 'bg-yellow-400',   label: 'RECONNECTING', pulse: true  },
  error:        { color: 'bg-destructive',  label: 'ERROR',        pulse: false },
};

function StatusDot({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.connecting;
  return (
    <span className="relative flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.color, cfg.pulse && 'animate-pulse')} />
      <span className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground">{cfg.label}</span>
    </span>
  );
}

function TickerRow({ symbol, data }) {
  const up = (data?.change_24h ?? data?.change ?? 0) >= 0;
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary/40 transition-colors">
      <div className="flex items-center gap-2">
        {up ? <TrendingUp className="w-3 h-3 text-accent flex-shrink-0" /> : <TrendingDown className="w-3 h-3 text-destructive flex-shrink-0" />}
        <span className="text-xs font-mono font-semibold">{symbol}</span>
      </div>
      <div className="text-right">
        <p className="text-xs font-mono font-bold">{data?.price != null ? `$${Number(data.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : '—'}</p>
        <p className={cn('text-[10px] font-mono', up ? 'text-accent' : 'text-destructive')}>
          {up ? '+' : ''}{Number(data?.change_24h ?? data?.change ?? 0).toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

function TradeRow({ trade, idx }) {
  const isBuy = (trade?.side || trade?.type || '').toLowerCase() === 'buy';
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono hover:bg-secondary/40 transition-colors">
      <Badge className={cn('text-[9px] px-1.5 py-0 h-4 flex-shrink-0', isBuy ? 'bg-accent/20 text-accent border-accent/30' : 'bg-destructive/20 text-destructive border-destructive/30')}>
        {isBuy ? 'BUY' : 'SELL'}
      </Badge>
      <span className="text-muted-foreground flex-shrink-0">{trade?.symbol || '—'}</span>
      <span className="flex-1 truncate text-foreground">{trade?.quantity != null ? Number(trade.quantity).toFixed(4) : '—'}</span>
      <span className="text-muted-foreground flex-shrink-0">{trade?.price != null ? `$${Number(trade.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}</span>
    </div>
  );
}

const CHANNELS = ['ticker', 'trades', 'hft', 'orderbook'];
const TABS = ['Ticker', 'Trades', 'HFT', 'Order Book'];

export default function MeshTelemetry() {
  const [activeTab, setActiveTab] = useState('Ticker');
  const { feed, status, lastTick } = useMeshStream(CHANNELS);

  const ticker    = feed?.ticker?.data    || feed?.ticker?.tickers    || {};
  const trades    = feed?.trades?.data    || feed?.trades?.trades      || [];
  const hft       = feed?.hft?.data       || feed?.hft               || {};
  const orderbook = feed?.orderbook?.data || feed?.orderbook         || {};

  const tickerEntries = Object.entries(ticker);
  const tradesList    = Array.isArray(trades) ? trades.slice(0, 20) : [];

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Mesh Telemetry</span>
          <StatusDot status={status} />
        </div>
        {lastTick && (
          <span className="text-[10px] font-mono text-muted-foreground">
            {new Date(lastTick.ts || lastTick.timestamp || Date.now()).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={cn('flex-1 py-2 text-xs font-medium transition-colors',
              activeTab === t ? 'text-foreground border-b-2 border-primary bg-secondary/30' : 'text-muted-foreground hover:text-foreground'
            )}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[220px] max-h-[280px] overflow-y-auto py-2">

        {activeTab === 'Ticker' && (
          status === 'connecting' || status === 'reconnecting' ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
              <Activity className="w-6 h-6 animate-pulse" />
              <p className="text-xs">{status === 'connecting' ? 'Connecting to Mesh...' : 'Reconnecting...'}</p>
            </div>
          ) : tickerEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
              <Zap className="w-6 h-6 opacity-30" />
              <p className="text-xs">Awaiting ticker feed</p>
            </div>
          ) : (
            <div className="space-y-0.5 px-1">
              {tickerEntries.map(([sym, data]) => <TickerRow key={sym} symbol={sym} data={data} />)}
            </div>
          )
        )}

        {activeTab === 'Trades' && (
          tradesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
              <Activity className="w-6 h-6 opacity-30" />
              <p className="text-xs">Awaiting trade feed</p>
            </div>
          ) : (
            <div className="space-y-0.5 px-1">
              {tradesList.map((t, i) => <TradeRow key={t.id || i} trade={t} idx={i} />)}
            </div>
          )
        )}

        {activeTab === 'HFT' && (
          <div className="px-4 py-3 space-y-2">
            {Object.keys(hft).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-36 gap-2 text-muted-foreground">
                <Zap className="w-6 h-6 opacity-30" />
                <p className="text-xs">Awaiting HFT telemetry</p>
              </div>
            ) : (
              Object.entries(hft).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <span className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-mono font-semibold">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Order Book' && (
          <div className="px-3 py-2">
            {Object.keys(orderbook).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-36 gap-2 text-muted-foreground">
                <AlertTriangle className="w-6 h-6 opacity-30" />
                <p className="text-xs">Awaiting order book feed</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-1 px-1">Bids</p>
                  {(orderbook.bids || []).slice(0, 8).map((b, i) => (
                    <div key={i} className="flex justify-between px-1 py-0.5 text-[11px] font-mono">
                      <span className="text-accent">{Number(b[0]).toFixed(4)}</span>
                      <span className="text-muted-foreground">{Number(b[1]).toFixed(4)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider mb-1 px-1">Asks</p>
                  {(orderbook.asks || []).slice(0, 8).map((a, i) => (
                    <div key={i} className="flex justify-between px-1 py-0.5 text-[11px] font-mono">
                      <span className="text-destructive">{Number(a[0]).toFixed(4)}</span>
                      <span className="text-muted-foreground">{Number(a[1]).toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}