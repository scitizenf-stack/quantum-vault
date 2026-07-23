import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings as SettingsIcon, CheckCircle, XCircle } from 'lucide-react';
import ElePhonePanel from '@/components/settings/ElePhonePanel';

const SECRETS = [
  { key: 'VITE_TWILIO_ACCOUNT_SID', label: 'Twilio Account SID' },
  { key: 'VITE_CF_API_TOKEN', label: 'Cloudflare API Token' },
  { key: 'VITE_STRIPE_SECRET_KEY', label: 'Stripe Secret Key' },
  { key: 'VITE_GITHUB_TOKEN', label: 'GitHub Token' },
  { key: 'VITE_WALLET_ADDRESS_SOL', label: 'Solana Wallet Address' },
];

export default function Settings() {
  const { canView, user } = useRBAC();
  const qc = useQueryClient();

  const { data: settingsRaw = [], isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.Settings.list(),
  });

  const upsertSetting = useMutation({
    mutationFn: async ({ key, value }) => {
      const existing = settingsRaw.find(s => s.key === key);
      if (existing) return base44.entities.Settings.update(existing.id, { value, updatedAt: new Date().toISOString() });
      return base44.entities.Settings.create({ key, value, updatedAt: new Date().toISOString() });
    },
    onSuccess: () => qc.invalidateQueries(['settings']),
  });

  const getSetting = (key, def = '') => settingsRaw.find(s => s.key === key)?.value || def;

  const isFounderAdmin = user?.role === 'admin' || user?.role === 'founder' || user?.email === 'securecitizenfoundation@gmail.com';
  if (!canView('settings') && !isFounderAdmin) return <AccessDenied section="Settings" />;

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* General */}
      <Section title="General">
        {isLoading ? <Skeleton className="h-24 w-full" /> : (
          <div className="space-y-3">
            {[
              { key: 'app_name', label: 'App Name', placeholder: 'Omega Protocol' },
              { key: 'timezone', label: 'Timezone', placeholder: 'UTC' },
              { key: 'currency', label: 'Currency', placeholder: 'USD' },
              { key: 'api_endpoint', label: 'API Endpoint', placeholder: 'https://app.youthballot.org' },
              { key: 'wallet_address', label: 'Wallet Address', placeholder: 'Eida3teSJATMJW7BBqFZUKdrNXbr5ek7kGGftegBsxmp' },
            ].map(f => (
              <div key={f.key} className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground w-32">{f.label}</label>
                <input
                  className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm flex-1 ml-4"
                  defaultValue={getSetting(f.key)}
                  placeholder={f.placeholder}
                  onBlur={e => upsertSetting.mutate({ key: f.key, value: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        {[
          { key: 'notify_email', label: 'Email notifications' },
          { key: 'notify_sms', label: 'SMS notifications' },
        ].map(f => (
          <div key={f.key} className="flex items-center justify-between py-2">
            <span className="text-sm">{f.label}</span>
            <Switch
              checked={getSetting(f.key) === 'true'}
              onCheckedChange={v => upsertSetting.mutate({ key: f.key, value: String(v) })}
            />
          </div>
        ))}
      </Section>

      {/* Security */}
      <Section title="Security">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm">Session timeout (minutes)</span>
          <input
            type="number"
            className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm w-24"
            defaultValue={getSetting('session_timeout', '60')}
            onBlur={e => upsertSetting.mutate({ key: 'session_timeout', value: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">Authentication provider</span>
          <Badge variant="outline">Base44 Auth</Badge>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">Current role</span>
          <Badge variant="outline">{user?.role?.toUpperCase() || 'USER'}</Badge>
        </div>
      </Section>

      {/* ElePhone Integration */}
      <ElePhonePanel />

      {/* Integrations */}
      <Section title="Integrations">
        <p className="text-xs text-muted-foreground mb-3">Configure secrets in Base44 Settings → Secrets to enable integrations.</p>
        <div className="space-y-2">
          {SECRETS.map(s => {
            const connected = !!import.meta.env[s.key];
            return (
              <div key={s.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  {connected ? <CheckCircle className="w-4 h-4 text-accent" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm">{s.label}</span>
                </div>
                {connected ? (
                  <Badge className="bg-accent/20 text-accent text-xs">Connected</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">Not connected</Badge>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl bg-card border border-border p-5 space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}