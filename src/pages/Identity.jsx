import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { meshApi } from '@/lib/meshClient';
import { Shield, Lock, RefreshCw, FileText, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const TABS = ['Digital ID', 'KYC', 'Document Vault', 'Access Logs'];

export default function Identity() {
  const [tab, setTab] = useState('Digital ID');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['identity'],
    queryFn: () => meshApi.getMeshMpc(),
    refetchInterval: 30000,
  });

  const identity  = data?.identity  || {};
  const kyc       = data?.kyc       || {};
  const documents = data?.documents || [];
  const accessLogs = data?.access_logs || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Identity</h1>
          <p className="text-sm text-muted-foreground mt-1">Sovereign digital identity and KYC management</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Digital ID' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold">Quantum Vault Identity</p>
                <p className="text-xs text-muted-foreground font-mono">Sovereign Root — Base44 Identity Stack</p>
              </div>
              <Badge className={`ml-auto ${identity.verified ? 'bg-accent/20 text-accent border-accent/30' : 'bg-secondary text-muted-foreground'}`}>
                {identity.verified ? 'VERIFIED' : 'PENDING'}
              </Badge>
            </div>
            {isLoading ? <Skeleton className="h-24 w-full" /> :
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Identity Level', identity.level || '—'],
                  ['KYC Status', kyc.status || '—'],
                  ['MPC Custody', identity.mpc_status || '—'],
                  ['Access Tier', identity.access_tier || '—'],
                  ['DID', identity.did || '—'],
                  ['Wallet Address', identity.wallet_address || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="p-3 rounded-xl bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-semibold mt-0.5 truncate font-mono">{value}</p>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      )}

      {tab === 'KYC' && (
        <div className="space-y-4">
          {isLoading ? <Skeleton className="h-48 w-full rounded-xl" /> :
            Object.keys(kyc).length === 0 ? (
              <div className="rounded-xl bg-card border border-border p-8 text-center text-muted-foreground">
                <Lock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No KYC data from Mesh API</p>
              </div>
            ) : (
              <div className="rounded-xl bg-card border border-border p-5">
                <h2 className="text-sm font-semibold mb-4">KYC Verification Status</h2>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(kyc).map(([k, v]) => (
                    <div key={k} className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.replace(/_/g,' ')}</p>
                      <p className="text-sm font-medium mt-0.5">{String(v)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </div>
      )}

      {tab === 'Document Vault' && (
        <div className="space-y-3">
          {isLoading ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />) :
            documents.length === 0 ? (
              <div className="rounded-xl bg-card border border-border p-8 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No documents from Mesh API</p>
              </div>
            ) :
            documents.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.type} · {doc.date}</p>
                </div>
                <Badge variant="outline" className="text-xs">{doc.status}</Badge>
              </div>
            ))
          }
        </div>
      )}

      {tab === 'Access Logs' && (
        <div className="space-y-2">
          {isLoading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />) :
            accessLogs.length === 0 ? (
              <div className="rounded-xl bg-card border border-border p-8 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No access logs from Mesh API</p>
              </div>
            ) :
            accessLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-card border border-border text-xs">
                <span className="text-muted-foreground font-mono flex-shrink-0">{log.timestamp}</span>
                <span className="flex-1">{log.action}</span>
                <Badge variant="outline" className="text-[10px]">{log.ip}</Badge>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}