import React from 'react';
import { Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { useTwilioNumbers, hasTwilioCreds } from '@/lib/useTwilioData';
import { Skeleton } from '@/components/ui/skeleton';
import ConnectCard from '@/components/shared/ConnectCard';

export default function SIMeSIM() {
  const { canView } = useRBAC();
  const { data: numberData = {}, isLoading } = useTwilioNumbers();
  const hasCreds = hasTwilioCreds();

  if (!canView('telecom')) return <AccessDenied section="SIM/eSIM" />;
  const numbers = numberData.incoming_phone_numbers || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">SIM / eSIM</h1>
        <p className="text-xs text-muted-foreground mt-1">Registered phone numbers and eSIMs</p>
      </div>

      {!hasCreds && <ConnectCard service="Twilio" instructions="Configure Twilio to view phone numbers" />}

      {hasCreds && (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
        ) : numbers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-muted-foreground/30 p-12 flex flex-col items-center gap-4 text-center">
            <Wifi className="w-8 h-8 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No Twilio numbers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {numbers.map(n => (
              <div key={n.sid} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-mono font-bold">{n.phone_number}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.friendly_name}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Active</Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <p><span className="text-muted-foreground">Capabilities:</span> Voice, SMS, MMS</p>
                  <p><span className="text-muted-foreground">Type:</span> {n.sms_fallback_method === 'POST' ? 'eSIM' : 'Virtual'}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}