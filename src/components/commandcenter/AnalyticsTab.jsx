import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { elephone } from '@/lib/elephoneClient';
import { useVpsPrices } from '@/lib/useVpsData';
import { useRBAC } from '@/hooks/useRBAC';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const GREEN = 'hsl(151 100% 50%)';
const PRICE_KEY = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', XRP: 'xrp_usd', PAXG: 'gold_usd' };
const SIGNED = { buy: 1, transfer_in: 1, interest: 1, dividend: 1, sell: -1, transfer_out: -1 };

function ChartCard({ title, empty, children }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <h3 className="text-xs font-bold tracking-widest uppercase mb-3">{title}</h3>
      {empty ? <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">{empty}</div> : <ResponsiveContainer width="100%" height={240}>{children}</ResponsiveContainer>}
    </div>
  );
}

const tip = { background: 'hsl(222 41% 9%)', border: '1px solid hsl(215 28% 17%)', borderRadius: 8, fontSize: 11 };
const axis = { fontSize: 10, fill: 'hsl(215 20% 55%)' };

export default function AnalyticsTab() {
  const { user } = useRBAC();
  const prices = useVpsPrices(30000);
  const { data: accounts = [] } = useQuery({ queryKey: ['elephone-accounts'], queryFn: () => elephone.list('TradingAccount'), refetchInterval: 60000 });
  const { data: txns = [] } = useQuery({ queryKey: ['transactions'], queryFn: () => base44.entities.Transaction.list('-created_date', 500) });
  const { data: trades = [] } = useQuery({ queryKey: ['hft-trades'], queryFn: () => base44.entities.Trade.list('-created_date', 500) });

  const o = prices.data || {};

  const aumGrowth = useMemo(() => {
    const sorted = [...txns].filter(t => t.created_date).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    let cum = 0;
    return sorted.map(t => { cum += (SIGNED[t.type] || 0) * (t.total_amount || 0); return { label: new Date(t.created_date).toLocaleDateString(), value: Math.round(cum) }; });
  }, [txns]);

  const topAssets = useMemo(() => {
    const holdings = [
      { symbol: 'SOL', qty: user?.tokens_balance || 0 },
      { symbol: 'BTC', qty: user?.btc_balance || 0 },
      { symbol: 'PAXG', qty: user?.paxg_balance || 0 },
      { symbol: 'XRP', qty: user?.xrp_balance || 0 },
    ];
    return holdings.map(h => ({ name: h.symbol, value: Math.round(h.qty * (o[PRICE_KEY[h.symbol]] || 0)) })).filter(a => a.value > 0);
  }, [user, o]);

  const clientTrend = useMemo(() => {
    const sorted = [...accounts].filter(a => a.created_date).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    let cum = 0;
    return sorted.map(a => { cum++; return { label: new Date(a.created_date).toLocaleDateString(), value: cum }; });
  }, [accounts]);

  const profitMargin = useMemo(() => {
    const sorted = [...trades].filter(t => t.created_date).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    let cum = 0;
    return sorted.map(t => { cum += (t.pnl || 0); return { label: new Date(t.created_date).toLocaleDateString(), value: Math.round(cum) }; });
  }, [trades]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="AUM Growth Over Time" empty={aumGrowth.length === 0 ? 'No transaction history' : null}>
        <LineChart data={aumGrowth}><CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" /><XAxis dataKey="label" tick={axis} /><YAxis tick={axis} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} /><Tooltip contentStyle={tip} /><Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} /></LineChart>
      </ChartCard>

      <ChartCard title="Top Performing Assets" empty={topAssets.length === 0 ? 'No holdings' : null}>
        <BarChart data={topAssets}><CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" /><XAxis dataKey="name" tick={axis} /><YAxis tick={axis} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} /><Tooltip contentStyle={tip} /><Bar dataKey="value" fill={GREEN} radius={[4, 4, 0, 0]} /></BarChart>
      </ChartCard>

      <ChartCard title="Client Count Trend" empty={clientTrend.length === 0 ? 'No clients' : null}>
        <LineChart data={clientTrend}><CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" /><XAxis dataKey="label" tick={axis} /><YAxis tick={axis} /><Tooltip contentStyle={tip} /><Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} /></LineChart>
      </ChartCard>

      <ChartCard title="Profit Margin Over Time" empty={profitMargin.length === 0 ? 'No trade history' : null}>
        <LineChart data={profitMargin}><CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" /><XAxis dataKey="label" tick={axis} /><YAxis tick={axis} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} /><Tooltip contentStyle={tip} /><Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} /></LineChart>
      </ChartCard>
    </div>
  );
}