import React, { useState, useEffect } from 'react';
import { Database, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PROCHAIN_TOKENS = [
  { token: 'QGG', name: 'Quantum Gold Genesis',    units: 1000000 },
  { token: 'QSG', name: 'Quantum Silver Genesis',  units: 5000000 },
  { token: 'QOB', name: 'Quantum Oil Barrel',      units: 500000  },
  { token: 'QOW', name: 'Quantum Oil Well',        units: 100000  },
];

// Price keys from Oracle for backing assets
const BACKING = { QGG: 'XAU', QSG: null, QOB: null, QOW: null };

function fmt$(n) {
  if (n == null) return '—';
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Blockchain() {
  const [oracleData, setOracleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOracle = async () => {
      try {
        const res = await fetch('https://quantumvaultsolutions.com/api/dashboard', {
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const raw = await res.json();
          const payload = raw.success && raw.data ? raw.data : raw;
          setOracleData(payload);
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchOracle();
  }, []);

  const prices = oracleData?.prices || {};
  const goldPrice = prices.XAU?.price ?? null;

  const rows = PROCHAIN_TOKENS.map(t => {
    // Only QGG is gold-backed — others show oracle price as N/A until endpoint provides it
    const oraclePrice = t.token === 'QGG' ? goldPrice : null;
    const totalValue = oraclePrice != null ? t.units * oraclePrice : null;
    return { ...t, oraclePrice, totalValue };
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Blockchain</h1>
        <p className="text-xs text-muted-foreground mt-1">Prochain Token Registry · Cloudflare D1</p>
      </div>

      {/* Important disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
        <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-yellow-400">Token Registry — Not On-Chain</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            These tokens are database records in the Prochain D1 registry. They are NOT spendable wallet assets and are NOT included in your portfolio total.
          </p>
        </div>
      </div>

      {/* Token Registry Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Database className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-semibold">Prochain Token Registry</p>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/40 text-yellow-400 font-semibold ml-auto">Token Registry (not on-chain)</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 rounded" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Token</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Name</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Units Issued</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Oracle Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Total Registry Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.token} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 font-mono font-bold text-primary text-xs">{r.token}</td>
                  <td className="px-4 py-3 text-xs">{r.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-right">{r.units.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-mono text-right">
                    {r.oraclePrice != null ? fmt$(r.oraclePrice) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-right">
                    {r.totalValue != null ? fmt$(r.totalValue) : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-4 py-2 border-t border-border bg-secondary/10">
          <p className="text-[10px] text-muted-foreground">Data sourced from quantumvaultsolutions.com/api/dashboard · Oracle prices updated every 30s</p>
        </div>
      </div>
    </div>
  );
}