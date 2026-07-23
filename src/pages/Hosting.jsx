import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { meshApi } from '@/lib/meshClient';
import { Server, Globe, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const TABS = ['Domains', 'DNS', 'Cloudflare', 'Workers', 'SSL'];

export default function Hosting() {
  const [tab, setTab] = useState('Domains');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['hosting'],
    queryFn: () => meshApi.getSystemHealth(),
    refetchInterval: 30000,
  });

  const domains = data?.domains || [];
  const dns     = data?.dns_records || [];
  const workers = data?.workers   || [];
  const ssl     = data?.ssl_certs  || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hosting</h1>
          <p className="text-sm text-muted-foreground mt-1">Domains, DNS, Cloudflare, Workers, SSL</p>
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

      {tab === 'Domains' && (
        <HostingTable
          label="Registered Domains" isLoading={isLoading} items={domains}
          empty="No domains from Mesh API"
          columns={['Domain', 'Provider', 'SSL', 'Status']}
          renderRow={d => (
            <tr key={d.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
              <td className="px-5 py-3.5 font-mono text-sm flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-primary inline-block mr-1" />{d.name}</td>
              <td className="px-5 py-3.5"><Badge variant="outline" className="text-xs">{d.provider}</Badge></td>
              <td className="px-5 py-3.5">{d.ssl && <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">SSL ✓</Badge>}</td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1">
                  {d.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> : <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />}
                  <span className="text-xs capitalize">{d.status}</span>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {tab === 'DNS' && (
        <HostingTable
          label="DNS Records" isLoading={isLoading} items={dns}
          empty="No DNS records from Mesh API"
          columns={['Name', 'Type', 'Value', 'TTL']}
          renderRow={r => (
            <tr key={r.id || r.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
              <td className="px-5 py-3.5 font-mono text-xs">{r.name}</td>
              <td className="px-5 py-3.5"><Badge variant="outline" className="text-xs">{r.type}</Badge></td>
              <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground truncate max-w-xs">{r.value}</td>
              <td className="px-5 py-3.5 text-xs text-muted-foreground">{r.ttl}</td>
            </tr>
          )}
        />
      )}

      {tab === 'Workers' && (
        <HostingTable
          label="Cloudflare Workers" isLoading={isLoading} items={workers}
          empty="No Workers from Mesh API"
          columns={['Name', 'Route', 'Status', 'Requests']}
          renderRow={w => (
            <tr key={w.id || w.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
              <td className="px-5 py-3.5 text-sm font-medium">{w.name}</td>
              <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{w.route}</td>
              <td className="px-5 py-3.5">
                <Badge className={w.status === 'active' ? 'bg-accent/20 text-accent border-accent/30 text-xs' : 'text-xs'}>{w.status}</Badge>
              </td>
              <td className="px-5 py-3.5 text-xs font-mono">{w.requests?.toLocaleString()}</td>
            </tr>
          )}
        />
      )}

      {tab === 'SSL' && (
        <HostingTable
          label="SSL Certificates" isLoading={isLoading} items={ssl}
          empty="No SSL data from Mesh API"
          columns={['Domain', 'Issuer', 'Expires', 'Status']}
          renderRow={c => (
            <tr key={c.domain} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
              <td className="px-5 py-3.5 font-mono text-sm">{c.domain}</td>
              <td className="px-5 py-3.5 text-xs text-muted-foreground">{c.issuer}</td>
              <td className="px-5 py-3.5 text-xs font-mono">{c.expires}</td>
              <td className="px-5 py-3.5"><Badge className="bg-accent/20 text-accent border-accent/30 text-xs">{c.status}</Badge></td>
            </tr>
          )}
        />
      )}

      {tab === 'Cloudflare' && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cloudflare Account</p>
          {isLoading ? <Skeleton className="h-24 w-full" /> :
            !data?.cloudflare ? <p className="text-sm text-muted-foreground py-8 text-center">No Cloudflare data from Mesh API</p> :
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.cloudflare).map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-mono font-medium mt-0.5 truncate">{String(v)}</p>
                </div>
              ))}
            </div>
          }
        </div>
      )}
    </div>
  );
}

function HostingTable({ label, isLoading, items, empty, columns, renderRow }) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <Badge variant="outline" className="text-xs">{items.length}</Badge>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center">
          <Server className="w-8 h-8 mx-auto mb-3 opacity-30 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{empty}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">{columns.map(c => <th key={c} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">{c}</th>)}</tr></thead>
            <tbody>{items.map(renderRow)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}