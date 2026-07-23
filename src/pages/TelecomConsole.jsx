import React, { useState } from 'react';
import { Smartphone, ShieldCheck, PieChart, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import DevicesTab from '@/components/telecomconsole/DevicesTab';
import KycTab from '@/components/telecomconsole/KycTab';
import SplitsTab from '@/components/telecomconsole/SplitsTab';
import BrainMonitorTab from '@/components/telecomconsole/BrainMonitorTab';

const TABS = [
  { id: 'devices', label: 'Devices',       icon: Smartphone },
  { id: 'kyc',     label: 'KYC Profiles',  icon: ShieldCheck },
  { id: 'splits',  label: 'Portfolio Splits', icon: PieChart },
  { id: 'brain',   label: 'Brain Monitor', icon: BrainCircuit },
];

export default function TelecomConsole() {
  const [tab, setTab] = useState('devices');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Telecom Command Center</h1>
        <p className="text-xs text-muted-foreground">Devices · KYC · Splits · Brain Monitor</p>
      </div>

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

      {tab === 'devices' && <DevicesTab />}
      {tab === 'kyc'     && <KycTab />}
      {tab === 'splits'  && <SplitsTab />}
      {tab === 'brain'   && <BrainMonitorTab />}
    </div>
  );
}