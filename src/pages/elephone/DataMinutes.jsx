import React from 'react';
import { Wifi, Phone, MessageSquare, CreditCard } from 'lucide-react';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { useTwilioUsage, hasTwilioCreds } from '@/lib/useTwilioData';
import { Skeleton } from '@/components/ui/skeleton';
import ConnectCard from '@/components/shared/ConnectCard';

function UsageGauge({ label, icon: IconComponent, used, total, unit, color }) {
  const Icon = IconComponent;
  const pct = Math.min(100, (used / total) * 100);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct / 100);
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 self-start">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={dash}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="70" y="65" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{pct.toFixed(0)}%</text>
        <text x="70" y="85" textAnchor="middle" fill="gray" fontSize="10">{used}{unit} / {total}{unit}</text>
      </svg>
      <div className="w-full bg-secondary/40 rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="flex justify-between w-full text-xs text-muted-foreground">
        <span>Used: <span className="text-foreground font-medium">{used}{unit}</span></span>
        <span>Remaining: <span className="text-foreground font-medium">{total - used}{unit}</span></span>
      </div>
    </div>
  );
}

export default function DataMinutes() {
  const { canView } = useRBAC();
  const { data: usage = {}, isLoading } = useTwilioUsage();
  const hasCreds = hasTwilioCreds();

  if (!canView('telecom')) return <AccessDenied section="Data & Minutes" />;

  if (!hasCreds) return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Data & Minutes</h1></div>
      <ConnectCard service="Twilio" instructions="Configure Twilio to view usage" />
    </div>
  );

  const records = usage.usage_records || [];
  const calls = records.find(r => r.category === 'calls-api')?.count || 0;
  const sms = records.find(r => r.category === 'sms')?.count || 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Data & Minutes</h1>
        <p className="text-xs text-muted-foreground mt-1">Current billing cycle</p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UsageGauge label="Minutes Used" icon={Phone} used={calls} total={1200} unit=" min" color="hsl(var(--accent))" />
          <UsageGauge label="SMS Sent" icon={MessageSquare} used={sms} total={500} unit=" msg" color="hsl(var(--chart-3))" />
          <UsageGauge label="Cost" icon={CreditCard} used={parseFloat(usage.total || 0)} total={50} unit="$" color="hsl(var(--primary))" />
        </div>
      )}
    </div>
  );
}