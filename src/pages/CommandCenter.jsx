import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVpsPrices } from '@/lib/useVpsData';
import { useRBAC } from '@/hooks/useRBAC';
import { elephone } from '@/lib/elephoneClient';
import AccessDenied from '@/components/shared/AccessDenied';
import CommandHeader from '@/components/commandcenter/CommandHeader';
import Dashboard from '@/pages/Dashboard';
import HFTTerminalTab from '@/components/commandcenter/HFTTerminalTab';
import ClientsTab from '@/components/commandcenter/ClientsTab';
import ProfitsTab from '@/components/commandcenter/ProfitsTab';
import AnalyticsTab from '@/components/commandcenter/AnalyticsTab';
import { LayoutDashboard, Zap, Users, DollarSign, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRICE_MAP = { BTC: 'btc_usd', ETH: 'eth_usd', SOL: 'sol_usd', XRP: 'xrp_usd', PAXG: 'gold_usd' };

const TABS = [
  { id: 'overview',  label: 'Overview',     icon: LayoutDashboard },
  { id: 'hft',       label: 'HFT Terminal', icon: Zap },
  { id: 'clients',   label: 'Clients',      icon: Users },
  { id: 'profits',   label: 'Profits',       icon: DollarSign },
  { id: 'analytics', label: 'Analytics',    icon: BarChart3 },
];

export default function CommandCenter() {
  const { canView, user } = useRBAC();
  const [tab, setTab] = useState('overview');
  const prices = useVpsPrices(30000);
  const { data: accounts = [] } = useQuery({
    queryKey: ['elephone-accounts'],
    queryFn: () => elephone.list('TradingAccount'),
    refetchInterval: 60000,
  });

  if (!canView('dashboard')) return <AccessDenied section="Command Center" />;

  const o = prices.data || {};
  const ownerHoldings = [
    { symbol: 'SOL',  qty: user?.tokens_balance || 0 },
    { symbol: 'BTC',  qty: user?.btc_balance || 0 },
    { symbol: 'PAXG', qty: user?.paxg_balance || 0 },
    { symbol: 'XRP',  qty: user?.xrp_balance || 0 },
  ];
  const ownerValue = ownerHoldings.reduce((s, h) => {
    const pk = PRICE_MAP[h.symbol];
    const price = pk ? (o[pk] || 0) : 0;
    return s + h.qty * price;
  }, 0);
  const clientAUM = accounts.reduce((s, a) => s + (a.balance_usd || 0), 0);
  const aum = clientAUM + ownerValue;

  return (
    <div className="space-y-4">
      <CommandHeader aum={aum} />

      {/* Tab bar */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 overflow-x-auto scrollbar-thin">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview'  && <Dashboard embedded />}
      {tab === 'hft'       && <HFTTerminalTab />}
      {tab === 'clients'   && <ClientsTab />}
      {tab === 'profits'   && <ProfitsTab />}
      {tab === 'analytics' && <AnalyticsTab />}
    </div>
  );
}