import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { elephone } from '@/lib/elephoneClient';
import { toast } from 'sonner';
import { Search, Eye, Check, Pause, Play, MessageSquare, DollarSign } from 'lucide-react';
import AdjustBalanceModal from '@/components/clients/AdjustBalanceModal';

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const STATUS_CLASS = { active: 'text-accent', suspended: 'text-orange-400', closed: 'text-destructive', pending: 'text-yellow-400' };
const STATUS_BG = { active: 'bg-accent/15', suspended: 'bg-orange-500/15', closed: 'bg-destructive/15', pending: 'bg-yellow-500/15' };

function Row({ label, value }) {
  return <div className="flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span className="font-mono font-medium">{value}</span></div>;
}

export default function ClientsTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [adjust, setAdjust] = useState(null);
  const [detail, setDetail] = useState(null);
  const { data: accounts = [], isLoading } = useQuery({ queryKey: ['elephone-accounts'], queryFn: () => elephone.list('TradingAccount'), refetchInterval: 60000 });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return accounts.filter(a => (a.account_number || '').toLowerCase().includes(q) || (a.status || '').toLowerCase().includes(q));
  }, [accounts, search]);

  const total = accounts.length;
  const active = accounts.filter(a => a.status === 'active').length;
  const pending = accounts.filter(a => a.status === 'pending').length;
  const suspended = accounts.filter(a => a.status === 'suspended').length;

  const setStatus = async (a, status) => {
    try { await elephone.update('TradingAccount', a.id, { status }); toast.success(`${a.account_number} → ${status}`); qc.invalidateQueries({ queryKey: ['elephone-accounts'] }); }
    catch (e) { toast.error(`Failed: ${e.message}`); }
  };

  const cards = [['Total Clients', total, ''], ['Active', active, 'text-accent'], ['Pending', pending, 'text-yellow-400'], ['Suspended', suspended, 'text-orange-400']];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(([l, v, c]) => (
          <div key={l} className="rounded-xl bg-card border border-border p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{l}</p>
            <p className={`text-2xl font-mono font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by account or status…" className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-xs font-mono outline-none focus:ring-1 focus:ring-ring" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-card animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-12 text-center text-sm text-muted-foreground">No clients found</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-xs min-w-[860px]">
            <thead className="bg-secondary/40"><tr className="border-b border-border">{['Name', 'Status', 'AUM', 'Return %', 'Today P&L', 'Trading Since', 'Actions'].map(h => <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(a => {
                const ret = a.total_deposited ? ((a.total_profit_returned || 0) / a.total_deposited) * 100 : 0;
                const todayPnl = (a.balance_usd || 0) - (a.total_deposited || 0) - (a.total_profit_returned || 0);
                return (
                  <tr key={a.id} className="border-b border-border/40 hover:bg-secondary/20">
                    <td className="px-3 py-2 font-mono font-semibold">{a.account_number || a.id?.slice(-8)}</td>
                    <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_BG[a.status] || ''} ${STATUS_CLASS[a.status] || 'text-muted-foreground'}`}>{a.status || '—'}</span></td>
                    <td className="px-3 py-2 font-mono">{fmt(a.balance_usd)}</td>
                    <td className="px-3 py-2 font-mono text-accent">{ret.toFixed(2)}%</td>
                    <td className={`px-3 py-2 font-mono ${todayPnl >= 0 ? 'text-accent' : 'text-destructive'}`}>{todayPnl >= 0 ? '+' : ''}{fmt(todayPnl)}</td>
                    <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{a.created_date ? new Date(a.created_date).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button onClick={() => setDetail(a)} className="p-1 hover:bg-secondary rounded" title="View Details"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        {a.status !== 'active' && <button onClick={() => setStatus(a, 'active')} className="p-1 hover:bg-accent/10 rounded" title="Approve"><Check className="w-3.5 h-3.5 text-accent" /></button>}
                        {a.status === 'active'
                          ? <button onClick={() => setStatus(a, 'suspended')} className="p-1 hover:bg-orange-500/10 rounded" title="Suspend"><Pause className="w-3.5 h-3.5 text-orange-400" /></button>
                          : <button onClick={() => setStatus(a, 'active')} className="p-1 hover:bg-accent/10 rounded" title="Reactivate"><Play className="w-3.5 h-3.5 text-accent" /></button>}
                        <button onClick={() => toast(`Message queued for ${a.account_number}`)} className="p-1 hover:bg-secondary rounded" title="Message"><MessageSquare className="w-3.5 h-3.5 text-primary" /></button>
                        <button onClick={() => setAdjust(a)} className="p-1 hover:bg-secondary rounded" title="Adjust Balance"><DollarSign className="w-3.5 h-3.5 text-yellow-400" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdjustBalanceModal account={adjust} onClose={() => setAdjust(null)} onConfirm={async (amount, reason) => {
        try { await elephone.update('TradingAccount', adjust.id, { balance_usd: amount, admin_note: reason }); toast.success('Balance updated'); qc.invalidateQueries({ queryKey: ['elephone-accounts'] }); setAdjust(null); }
        catch (e) { toast.error(`Failed: ${e.message}`); }
      }} />

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDetail(null)}>
          <div className="bg-card border border-border rounded-xl p-5 w-full max-w-md space-y-2" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold mb-1">Client Details</h3>
            <Row label="Account" value={detail.account_number || detail.id?.slice(-8)} />
            <Row label="Status" value={detail.status || '—'} />
            <Row label="Balance" value={fmt(detail.balance_usd)} />
            <Row label="Deposited" value={fmt(detail.total_deposited)} />
            <Row label="Profit Returned" value={fmt(detail.total_profit_returned)} />
            <Row label="Auto-Trade" value={detail.auto_trading_enabled ? 'Enabled' : 'Disabled'} />
            <Row label="Keys Linked" value={detail.exchange_keys_linked ? 'Yes' : 'No'} />
            <Row label="Last Split" value={detail.last_split_at ? new Date(detail.last_split_at).toLocaleString() : '—'} />
            <Row label="Created" value={detail.created_date ? new Date(detail.created_date).toLocaleString() : '—'} />
            <button onClick={() => setDetail(null)} className="w-full mt-2 py-2 rounded-lg bg-secondary text-xs font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}