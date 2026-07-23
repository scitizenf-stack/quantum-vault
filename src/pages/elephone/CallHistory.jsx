import React from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneCall } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { useTwilioCalls, hasTwilioCreds } from '@/lib/useTwilioData';
import { Skeleton } from '@/components/ui/skeleton';
import ConnectCard from '@/components/shared/ConnectCard';
import { format } from 'date-fns';

const TypeIcon = ({ type }) => {
  const direction = type?.toLowerCase() === 'inbound' ? 'inbound' : 'outbound';
  if (direction === 'inbound') return <PhoneIncoming className="w-4 h-4 text-accent" />;
  return <PhoneOutgoing className="w-4 h-4 text-primary" />;
};

export default function CallHistory() {
  const { canView } = useRBAC();
  const { data: callData = {}, isLoading, isError } = useTwilioCalls();
  const hasCreds = hasTwilioCreds();

  if (!canView('telecom')) return <AccessDenied section="Call History" />;
  
  const calls = callData.calls || [];

  if (!hasCreds) return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Call History</h1></div>
      <ConnectCard service="Twilio" instructions="Configure Twilio credentials to view call history" />
    </div>
  );

  if (isError) return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Call History</h1></div>
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
        <p className="text-sm text-destructive">Failed to load call history</p>
      </div>
    </div>
  );
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Call History</h1>
        <p className="text-xs text-muted-foreground mt-1">Real-time calls from Twilio</p>
      </div>
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded" />)}</div>
      ) : calls.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-12 flex flex-col items-center gap-4 text-center">
          <PhoneCall className="w-8 h-8 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">No calls this month</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['From', 'To', 'Duration', 'Status', 'Date', 'Cost'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calls.map(c => (
                <tr key={c.sid} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs font-mono">{c.from}</td>
                  <td className="px-4 py-3 text-xs font-mono">{c.to}</td>
                  <td className="px-4 py-3 text-xs">{c.duration} sec</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{c.status}</Badge></td>
                  <td className="px-4 py-3 text-xs">{format(new Date(c.date_created), 'MMM d, HH:mm')}</td>
                  <td className="px-4 py-3 text-xs font-mono">${(c.price || 0).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}