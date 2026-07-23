import React, { useState } from 'react';
import { kycApi, walletApi, rpcApi } from '../qvApi';
import { toast } from 'sonner';
import { Shield, CreditCard, Network, Loader2, CheckCircle, Clock } from 'lucide-react';

const CLIENTS = [
  { id: 'hedge-fund-01', name: 'Hedge Fund 01', split: 60, method: 'stripe_card', kyc: 'APPROVED' },
  { id: 'individual-pool', name: 'Individual Pool', split: 20, method: 'usdc', kyc: 'PENDING' },
];

const CHAINS = ['eth', 'sol', 'base', 'arb'];

const CHAIN_COLORS = {
  eth: 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20',
  sol: 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20',
  base: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20',
  arb: 'text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20',
};

export default function ConsoleKycTab() {
  const [clients, setClients] = useState(CLIENTS);
  const [busy, setBusy] = useState({});

  const run = async (key, fn, successMsg) => {
    setBusy(prev => ({ ...prev, [key]: true }));
    try {
      await fn();
      toast.success(successMsg, { duration: 3500 });
    } catch (e) {
      toast.error(e.message, { duration: 3500 });
    } finally {
      setBusy(prev => ({ ...prev, [key]: false }));
    }
  };

  const forceApprove = (clientId) => {
    run(`approve:${clientId}`, () => kycApi.forceApprove(clientId), `KYC approved for ${clientId}`);
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, kyc: 'APPROVED' } : c));
  };

  const issueCard = (clientId) => {
    run(`card:${clientId}`, () => walletApi.issueCard(clientId), `Stripe card issued for ${clientId}`);
  };

  const spawnRpc = (clientId, chain) => {
    run(`rpc:${clientId}:${chain}`, () => rpcApi.spawn(clientId, chain), `RPC spawned: ${clientId} → ${chain}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {clients.map(client => (
        <div key={client.id} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-100">{client.name}</h3>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">{client.id}</p>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
              client.kyc === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
            }`}>
              {client.kyc === 'APPROVED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {client.kyc}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#121212] rounded-lg px-3 py-2">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">Split</p>
              <p className="text-sm font-bold text-gray-100">{client.split}%</p>
            </div>
            <div className="bg-[#121212] rounded-lg px-3 py-2">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">Payout Method</p>
              <p className="text-sm font-bold font-mono text-gray-100">{client.method}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => forceApprove(client.id)}
                disabled={busy[`approve:${client.id}`] || client.kyc === 'APPROVED'}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors"
              >
                {busy[`approve:${client.id}`] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                {client.kyc === 'APPROVED' ? 'KYC Approved' : 'Force Approve KYC'}
              </button>
              <button
                onClick={() => issueCard(client.id)}
                disabled={busy[`card:${client.id}`]}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40 transition-colors"
              >
                {busy[`card:${client.id}`] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                Issue Stripe Card
              </button>
            </div>

            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Network className="w-3 h-3" /> Spawn RPC Endpoint
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {CHAINS.map(chain => (
                  <button
                    key={chain}
                    onClick={() => spawnRpc(client.id, chain)}
                    disabled={busy[`rpc:${client.id}:${chain}`]}
                    className={`flex items-center justify-center py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors disabled:opacity-40 ${CHAIN_COLORS[chain]}`}
                  >
                    {busy[`rpc:${client.id}:${chain}`] ? <Loader2 className="w-3 h-3 animate-spin" /> : chain}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}