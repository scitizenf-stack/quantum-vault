import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Smartphone, Shield, DollarSign, Activity } from 'lucide-react';
import { engineApi } from '../qvApi';
import ConsoleDevicesTab from './ConsoleDevicesTab';
import ConsoleKycTab from './ConsoleKycTab';
import ConsoleProfitSplitsTab from './ConsoleProfitSplitsTab';
import ConsoleBrainMonitorTab from './ConsoleBrainMonitorTab';

const TABS = [
  { id: 'devices', label: 'Devices', icon: Smartphone },
  { id: 'kyc', label: 'KYC & Wallets', icon: Shield },
  { id: 'splits', label: 'Profit Splits', icon: DollarSign },
  { id: 'brain', label: 'Brain Monitor', icon: Brain },
];

export default function TelecomConsole() {
  const [activeTab, setActiveTab] = useState('devices');
  const [health, setHealth] = useState(null);

  const pollHealth = useCallback(async () => {
    try {
      const data = await engineApi.health();
      setHealth(data);
    } catch {
      setHealth(null);
    }
  }, []);

  useEffect(() => {
    pollHealth();
    const id = setInterval(pollHealth, 5000);
    return () => clearInterval(id);
  }, [pollHealth]);

  const isLive = health?.engine_ready ?? false;

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-gray-100">
      <div className="border-b border-[#1a1a1a] bg-[#0d0d0d] px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h1 className="text-sm font-bold tracking-wider uppercase">Quantum Vault · Telecom Console</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121212] border border-[#1a1a1a]">
          <span className="relative flex h-2.5 w-2.5">
            {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? 'bg-emerald-400' : 'bg-red-500'}`}></span>
          </span>
          <span className={`text-xs font-bold ${isLive ? 'text-emerald-400' : 'text-red-500'}`}>{isLive ? 'LIVE' : 'DOWN'}</span>
        </div>
      </div>

      <div className="flex gap-1 px-6 pt-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'devices' && <ConsoleDevicesTab />}
        {activeTab === 'kyc' && <ConsoleKycTab />}
        {activeTab === 'splits' && <ConsoleProfitSplitsTab />}
        {activeTab === 'brain' && <ConsoleBrainMonitorTab health={health} />}
      </div>
    </div>
  );
}