import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../qvApi';
import { toast } from 'sonner';
import { Loader2, Zap, TrendingUp } from 'lucide-react';

const STATUS_STYLES = {
  paid: 'bg-emerald-500/10 text-emerald-400',
  calculated: 'bg-yellow-500/10 text-yellow-400',
  pending: 'bg-yellow-500/10 text-yellow-400',
  disputed: 'bg-red-500/10 text-red-400',
  failed: 'bg-red-500/10 text-red-400',
};

function SplitRow({ s }) {
  const gross = s.gross_pnl ?? s.gross ?? 0;
  const fee = s.platform_fee ?? s.fee ?? gross * 0.20;
  const net = s.net_payout ?? s.net ?? gross - fee;
  return (
    <tr className="border-b border-[#1a1a1a] hover:bg-[#121212] transition-colors">
      <td className="px-4 py-3 text-gray-500">{s.date ? new Date(s.date).toLocaleDateString() : '—'}</td>
      <td className="px-4 py-3 text-gray-300 font-mono">{s.client || s.client_id || '—'}</td>
      <td className="px-4 py-3 text-gray-400 font-mono">{s.trade_id || '—'}</td>
      <td className="px-4 py-3 text-gray-300 font-mono">${Number(gross).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td className="px-4 py-3 text-gray-400 font-mono">${Number(fee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td className="px-4 py-3 text-emerald-400 font-mono font-bold">${Number(net).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td className="px-4 py-3 text-gray-400 font-mono">{s.method || '—'}</td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_STYLES[(s.status || 'pending').toLowerCase()] || STATUS_STYLES.pending}`}>
          {s.status || 'pending'}
        </span>
      </td>
    </tr>
  );
}

export default function ConsoleProfitSplitsTab() {
  const qc = useQueryClient();
  const [splitting, setSplitting] = useState(false);
  const [triggered, setTriggered] = useState([]);

  const { data: apiSplits = [], isLoading } = useQuery({
    queryKey: ['profit-splits'],
    queryFn: async () => {
      try { return await walletApi.listSplits(); } catch { return []; }
    },
    refetchInterval: 30000,
  });

  const apiList = Array.isArray(apiSplits) ? apiSplits : (apiSplits?.splits || apiSplits?.data || []);
  const allSplits = [...triggered, ...apiList];

  const totals = allSplits.reduce((acc, s) => {
    const gross = s.gross_pnl ?? s.gross ?? 0;
    const fee = s.platform_fee ?? s.fee ?? gross * 0.20;
    const net = s.net_payout ?? s.net ?? gross - fee;
    acc.gross += gross;
    acc.fee += fee;
    acc.net += net;
    return acc;
  }, { gross: 0, fee: 0, net: 0 });

  const triggerSplit = async () => {
    setSplitting(true);
    try {
      const result = await walletApi.splitTrade(500);
      toast.success('Test split triggered: $500 gross', { duration: 3500 });
      if (result && typeof result === 'object') {
        setTriggered(prev => [{
          date: result.date || new Date().toISOString(),
          client: result.client || 'test-client',
          trade_id: result.trade_id || result.id || 'TEST-500',
          gross_pnl: result.gross_pnl ?? 500,
          platform_fee: result.platform_fee ?? 100,
          net_payout: result.net_payout ?? 400,
          method: result.method || 'usdc',
          status: result.status || 'calculated',
          ...result,
        }, ...prev]);
      }
      qc.invalidateQueries({ queryKey: ['profit-splits'] });
    } catch (e) {
      toast.error(`Split failed: ${e.message}`, { duration: 3500 });
    } finally {
      setSplitting(false);
    }
  };

  const fmt = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-gray-100">Profit Splits</h2>
          <span className="text-[10px] text-gray-500">Platform fee @ 20%</span>
        </div>
        <button
          onClick={triggerSplit}
          disabled={splitting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-emerald-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors"
        >
          {splitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          Trigger Test Split ($500)
        </button>
      </div>

      <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] text-gray-500">
                <th className="text-left font-semibold px-4 py-3">Date</th>
                <th className="text-left font-semibold px-4 py-3">Client</th>
                <th className="text-left font-semibold px-4 py-3">Trade ID</th>
                <th className="text-left font-semibold px-4 py-3">Gross PnL</th>
                <th className="text-left font-semibold px-4 py-3">Platform Fee (20%)</th>
                <th className="text-left font-semibold px-4 py-3">Net Payout</th>
                <th className="text-left font-semibold px-4 py-3">Method</th>
                <th className="text-left font-semibold px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-600"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
              ) : allSplits.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-600">No profit splits yet. Trigger a test split to see the flow.</td></tr>
              ) : (
                allSplits.map((s, i) => <SplitRow key={s.id || s.trade_id || i} s={s} />)
              )}
            </tbody>
            {allSplits.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[#1a1a1a] bg-[#121212]">
                  <td className="px-4 py-3 font-bold text-gray-300" colSpan={3}>TOTALS</td>
                  <td className="px-4 py-3 font-bold font-mono text-gray-200">{fmt(totals.gross)}</td>
                  <td className="px-4 py-3 font-bold font-mono text-gray-400">{fmt(totals.fee)}</td>
                  <td className="px-4 py-3 font-bold font-mono text-emerald-400">{fmt(totals.net)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}