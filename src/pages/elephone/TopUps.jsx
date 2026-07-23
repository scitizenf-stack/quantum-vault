import React, { useState } from 'react';
import { Zap, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { useTwilioAccount, hasTwilioCreds } from '@/lib/useTwilioData';
import ConnectCard from '@/components/shared/ConnectCard';

const PACKAGES = [
  { id: 1, name: 'Starter', price: 10, data: '5GB', voice: '100 min', sms: '50 SMS', highlight: false },
  { id: 2, name: 'Standard', price: 25, data: '15GB', voice: '300 min', sms: '200 SMS', highlight: true },
  { id: 3, name: 'Premium', price: 50, data: '50GB', voice: 'Unlimited', sms: 'Unlimited', highlight: false },
];

export default function TopUps() {
  const { canView } = useRBAC();
  const { data: account = {}, isLoading } = useTwilioAccount();
  const hasCreds = hasTwilioCreds();

  if (!canView('telecom')) return <AccessDenied section="Top-Ups" />;

  const balance = parseFloat(account.balance || 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Top-Ups</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage your Twilio balance</p>
      </div>

      {!hasCreds && <ConnectCard service="Twilio" instructions="Configure Twilio credentials" />}

      {hasCreds && (
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Current Balance</p>
          <p className="text-4xl font-bold font-mono">${balance.toFixed(2)}</p>
          <a href="https://console.twilio.com/billing" target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ExternalLink className="w-4 h-4" /> Recharge on Twilio Console
          </a>
        </div>
      )}
    </div>
  );
}