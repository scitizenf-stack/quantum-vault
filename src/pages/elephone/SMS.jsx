import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { useTwilioMessages, hasTwilioCreds } from '@/lib/useTwilioData';
import { Skeleton } from '@/components/ui/skeleton';
import ConnectCard from '@/components/shared/ConnectCard';
import { format } from 'date-fns';

export default function SMS() {
  const { canView } = useRBAC();
  const { data: msgData = {}, isLoading, isError } = useTwilioMessages();
  const hasCreds = hasTwilioCreds();

  if (!canView('telecom')) return <AccessDenied section="SMS" />;

  const messages = msgData.messages || [];

  if (!hasCreds) return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">SMS</h1></div>
      <ConnectCard service="Twilio" instructions="Configure Twilio credentials to view SMS" />
    </div>
  );

  if (isError) return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">SMS</h1></div>
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"><p className="text-sm text-destructive">Failed to load SMS</p></div>
    </div>
  );
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">SMS</h1>
        <p className="text-xs text-muted-foreground mt-1">Real-time messages from Twilio</p>
      </div>
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded" />)}</div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-12 flex flex-col items-center gap-4 text-center">
          <MessageSquare className="w-8 h-8 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">No SMS this month</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(m => (
            <div key={m.sid} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary/30">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">{(m.from || '').slice(-2)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{m.from}</p>
                  <span className="text-xs text-muted-foreground">{format(new Date(m.date_created), 'MMM d, HH:mm')}</span>
                </div>
                <p className="text-xs text-muted-foreground">{m.body}</p>
              </div>
              <Badge variant={m.direction === 'outbound' ? 'default' : 'outline'} className="text-[10px] flex-shrink-0">{m.direction}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}