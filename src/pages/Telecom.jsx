import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { meshApi } from '@/lib/meshClient';
import { Radio, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TABS = ['Usage', 'Plans', 'Top-Ups', 'Devices', 'Regions'];

export default function Telecom() {
  const [tab, setTab] = useState('Usage');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['telecom'],
    queryFn: () => meshApi.getTelecom(),
    refetchInterval: 60000,
  });

  const usageData = data?.usage_history || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Telecom</h1>
          <p className="text-sm text-muted-foreground mt-1">Usage, plans, and connectivity controls</p>
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

      {tab === 'Usage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Data Used', value: data?.data_used_gb != null ? `${data.data_used_gb} GB` : '—', sub: 'this cycle' },
              { label: 'Minutes', value: data?.minutes_used ?? '—', sub: 'voice calls' },
              { label: 'SMS Sent', value: data?.sms_count ?? '—', sub: 'messages' },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-xl bg-card border border-border">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                {isLoading ? <Skeleton className="h-7 w-24 mt-1" /> : <p className="text-2xl font-bold font-mono mt-1">{s.value}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-xs font-semibold mb-4">7-Day Data Usage (MB)</p>
            {isLoading ? <Skeleton className="h-[200px] w-full" /> : usageData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">No usage data from Mesh API</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Bar dataKey="mb" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {tab === 'Plans' && (
        <LiveTabPanel label="Plans" endpoint="/api/telecom/plans" items={data?.plans} isLoading={isLoading}
          render={item => (
            <div key={item.id || item.name} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold">{item.price}</p>
                <Badge variant="outline" className="text-[10px] mt-1">{item.status}</Badge>
              </div>
            </div>
          )}
        />
      )}

      {tab === 'Top-Ups' && (
        <LiveTabPanel label="Top-Ups" endpoint="/api/telecom/topups" items={data?.topups} isLoading={isLoading}
          render={item => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div>
                <p className="text-sm font-medium">{item.amount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
            </div>
          )}
        />
      )}

      {tab === 'Devices' && (
        <LiveTabPanel label="Devices" endpoint="/api/telecom/devices" items={data?.devices} isLoading={isLoading}
          render={item => (
            <div key={item.id || item.name} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.imei}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
            </div>
          )}
        />
      )}

      {tab === 'Regions' && (
        <LiveTabPanel label="Regions" endpoint="/api/telecom/regions" items={data?.regions} isLoading={isLoading}
          render={item => (
            <div key={item.code || item.name} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.carrier}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">{item.coverage}</Badge>
            </div>
          )}
        />
      )}
    </div>
  );
}

function LiveTabPanel({ label, endpoint, items, isLoading, render }) {
  if (isLoading) return <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-8 text-center text-muted-foreground">
        <Radio className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">{label} — live from <span className="font-mono text-xs">{endpoint}</span></p>
      </div>
    );
  }
  return <div className="space-y-3">{items.map(render)}</div>;
}