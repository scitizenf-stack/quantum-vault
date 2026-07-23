import React, { useState } from 'react';
import { Phone, MessageSquare, Clock, Users, Wifi, CreditCard, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { useTwilioUsage, useTwilioCalls, useTwilioMessages, useTwilioNumbers, hasTwilioCreds } from '@/lib/useTwilioData';
import ConnectCard from '@/components/shared/ConnectCard';

const TABS = [
  { id: 'dialpad',  label: 'Dialpad',      icon: Phone },
  { id: 'sms',      label: 'SMS',           icon: MessageSquare },
  { id: 'history',  label: 'Call History',  icon: Clock },
  { id: 'contacts', label: 'Contacts',      icon: Users },
  { id: 'data',     label: 'Data & Minutes', icon: Wifi },
  { id: 'topups',   label: 'Top-Ups',       icon: CreditCard },
  { id: 'sim',      label: 'SIM / eSIM',    icon: Smartphone },
];

export default function ElePhone() {
  const { canView } = useRBAC();
  const [activeTab, setActiveTab] = useState('dialpad');
  const [dialInput, setDialInput] = useState('');
  const usage = useTwilioUsage();
  const calls = useTwilioCalls();
  const messages = useTwilioMessages();
  const numbers = useTwilioNumbers();
  const hasCreds = hasTwilioCreds();

  if (!canView('telecom')) return <AccessDenied section="elePhone" />;

  const isLoading = usage.isLoading || calls.isLoading || messages.isLoading || numbers.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">elePhone</h1>
        <p className="text-sm text-muted-foreground mt-1">Sovereign telecom suite — calls, SMS, SIM management</p>
      </div>

      <div className="flex gap-1 flex-wrap bg-secondary/50 rounded-xl p-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.id ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground")}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {!hasCreds && <ConnectCard service="Twilio" instructions="Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in settings" />}

      {hasCreds && <div className="rounded-xl bg-card border border-border p-6">
        {activeTab === 'dialpad' && (
          <div className="max-w-xs mx-auto space-y-4">
            <div className="text-center">
              <p className="text-2xl font-mono font-bold tracking-widest min-h-[2rem]">{dialInput || ' '}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['1','2','3','4','5','6','7','8','9','*','0','#'].map(k => (
                <button key={k} onClick={() => setDialInput(p => p + k)}
                  className="py-4 rounded-xl bg-secondary text-lg font-semibold hover:bg-secondary/70 active:scale-95 transition-all font-mono">
                  {k}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-4 rounded-xl bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent/90 transition-all">
                <Phone className="w-5 h-5" /> Call
              </button>
              <button onClick={() => setDialInput(p => p.slice(0, -1))}
                className="px-6 py-4 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-all text-sm">
                ⌫
              </button>
            </div>
          </div>
        )}

        {activeTab === 'sms' && (
          <LiveList isLoading={messages.isLoading} items={messages.data?.messages} emptyMsg="No SMS data"
            render={msg => (
              <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-mono font-bold">{msg.from?.slice(0, 2)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{msg.from}</p>
                    <span className="text-xs text-muted-foreground">{msg.date ? format(new Date(msg.date), 'MMM d, h:mm a') : '—'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.body}</p>
                </div>
                <Badge variant="outline" className="text-[10px] flex-shrink-0">{msg.status}</Badge>
              </div>
            )} />
        )}

        {activeTab === 'history' && (
          <LiveList isLoading={calls.isLoading} items={calls.data?.calls} emptyMsg="No call history"
            render={call => (
              <div key={call.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30">
                <div className={cn("p-2 rounded-lg", call.type === 'incoming' ? 'bg-accent/10' : 'bg-destructive/10')}>
                  <Phone className={cn("w-3.5 h-3.5", call.type === 'incoming' ? 'text-accent' : 'text-destructive')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{call.number}</p>
                  <p className="text-xs text-muted-foreground">{call.date ? format(new Date(call.date), 'MMM d, h:mm a') : '—'} · {call.duration}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{call.type}</Badge>
              </div>
            )} />
        )}

        {activeTab === 'contacts' && (
          <LiveList isLoading={false} items={[]} emptyMsg="Contacts feature coming soon"
            render={c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{c.name?.slice(0, 2).toUpperCase()}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{c.number}</p>
                </div>
              </div>
            )} />
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            {isLoading ? <Skeleton className="h-24 w-full" /> : (
              <div className="grid grid-cols-2 gap-4">
                {[
                          { label: 'Account Balance', value: `$${(usage.data?.balance || 0).toFixed(2)}` },
                          { label: 'Calls Used', value: usage.data?.usage_records?.length || '0' },
                          { label: 'SMS Used', value: usage.data?.usage_records?.length || '0' },
                          { label: 'Last Updated', value: new Date().toLocaleDateString() },
                        ].map(s => (
                  <div key={s.label} className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold font-mono mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'topups' && (
          <LiveList isLoading={false} items={[]} emptyMsg="Top-ups feature coming soon"
            render={t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30">
                <div>
                  <p className="text-sm font-medium">{t.amount}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
              </div>
            )} />
        )}

        {activeTab === 'sim' && (
          <LiveList isLoading={numbers.isLoading} items={numbers.data?.incoming_phone_numbers} emptyMsg="No SIM data"
            render={sim => (
              <div key={sim.iccid || sim.id} className="p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{sim.type === 'esim' ? 'eSIM' : 'Physical SIM'}</p>
                  <Badge variant="outline" className="text-[10px]">{sim.status}</Badge>
                </div>
                <p className="text-xs font-mono text-muted-foreground">ICCID: {sim.iccid}</p>
                <p className="text-xs text-muted-foreground mt-1">{sim.carrier} · {sim.country}</p>
              </div>
            )} />
        )}
      </div>}
    </div>
  );
}

function LiveList({ isLoading, items, emptyMsg, render }) {
  if (isLoading) return <div className="space-y-2">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>;
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-xs">{emptyMsg}</p>
      </div>
    );
  }
  return <div className="space-y-1">{items.map(render)}</div>;
}