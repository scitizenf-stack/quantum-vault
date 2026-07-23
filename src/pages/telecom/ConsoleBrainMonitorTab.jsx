import React from 'react';
import { Cpu, Globe, Server, Zap, CheckCircle, XCircle, Clock, Wifi } from 'lucide-react';

const POP_TOPOLOGY = [
  { region: 'us-east4', exchanges: 'NYSE / NASDAQ', latency: '~0.3ms', color: 'text-emerald-400' },
  { region: 'us-central1', exchanges: 'CME / CBOE', latency: '~0.5ms', color: 'text-emerald-400' },
  { region: 'europe-west2', exchanges: 'LSE / Euronext', latency: '~0.8ms', color: 'text-yellow-400' },
  { region: 'asia-east1', exchanges: 'SGX / TSE', latency: '~1.1ms', color: 'text-yellow-400' },
];

const BRAIN_TUNNEL = '82.112.250.134:8797';

function HealthCard({ label, value, ready, icon: Icon }) {
  const isBool = typeof ready === 'boolean';
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
        </div>
        {isBool && (
          ready
            ? <CheckCircle className="w-4 h-4 text-emerald-400" />
            : <XCircle className="w-4 h-4 text-red-500" />
        )}
      </div>
      <p className={`text-lg font-bold font-mono ${isBool ? (ready ? 'text-emerald-400' : 'text-red-500') : 'text-gray-100'}`}>
        {isBool ? (ready ? 'READY' : 'OFFLINE') : (value || '—')}
      </p>
    </div>
  );
}

export default function ConsoleBrainMonitorTab({ health }) {
  const h = health || {};

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-gray-100">Engine Health</h2>
          <span className="text-[10px] text-gray-500">Polling every 5s</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <HealthCard label="Engine" ready={h.engine_ready} icon={Cpu} />
          <HealthCard label="Oracle" ready={h.oracle_ready} icon={Zap} />
          <HealthCard label="Telecom" ready={h.telecom_ready} icon={Wifi} />
          <HealthCard label="Version" value={h.version} icon={Server} />
          <HealthCard label="Uptime" value={h.uptime} icon={Clock} />
          <HealthCard label="Scan Rate" value={h.scan_rate} icon={Zap} />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-gray-100">PoP Topology</h2>
          <span className="text-[10px] text-gray-500">Point of Presence · Exchange latency</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {POP_TOPOLOGY.map(pop => (
            <div key={pop.region} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold font-mono text-gray-200">{pop.region}</p>
                <Globe className="w-3.5 h-3.5 text-gray-600" />
              </div>
              <p className="text-[10px] text-gray-500 mb-2">{pop.exchanges}</p>
              <p className={`text-lg font-bold font-mono ${pop.color}`}>{pop.latency}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Server className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-gray-100">Brain Tunnel</h2>
        </div>
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Secure Tunnel Endpoint</p>
              <p className="text-lg font-bold font-mono text-emerald-400">{BRAIN_TUNNEL}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121212] border border-[#1a1a1a]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Tunnel Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}