import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StripeConfig() {
  const [pubKey, setPubKey] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDesc, setPayDesc] = useState('');
  const [generatedLink, setGeneratedLink] = useState(null);
  const queryClient = useQueryClient();

  const { data: configs = [] } = useQuery({
    queryKey: ['stripe-configs'],
    queryFn: () => base44.entities.StripeConfig.list(),
  });

  const createConfigMutation = useMutation({
    mutationFn: (data) => base44.entities.StripeConfig.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-configs'] });
      setPubKey('');
    },
  });

  const isConfigured = configs.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stripe Integration</h1>
        <p className="text-sm text-muted-foreground mt-1">Accept payments from customers</p>
      </div>

      {isConfigured ? (
        <div className="rounded-xl bg-accent/5 border border-accent/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Stripe Connected</span>
            <Badge>Active</Badge>
          </div>
          <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
            Open Stripe Dashboard <ExternalLink className="w-3 h-3" />
          </a>
          <p className="text-xs text-muted-foreground mt-2">💰 Stripe collects payments FROM customers. To move funds OUT, use your Stripe Dashboard.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border p-6 space-y-3">
          <label className="text-xs text-muted-foreground block font-semibold">Stripe Publishable Key</label>
          <Input
            placeholder="pk_live_..."
            value={pubKey}
            onChange={(e) => setPubKey(e.target.value)}
            type="password"
          />
          <Button
            onClick={() => createConfigMutation.mutate({ publishableKey: pubKey })}
            disabled={!pubKey || createConfigMutation.isPending}
            className="w-full"
          >
            {createConfigMutation.isPending ? 'Saving...' : 'Save Stripe Key'}
          </Button>
        </div>
      )}

      {isConfigured && (
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold">Generate Payment Link</h2>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground block">Amount (USD)</label>
            <Input
              type="number"
              placeholder="99.99"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground block">Description</label>
            <Input
              placeholder="e.g. Premium Subscription"
              value={payDesc}
              onChange={(e) => setPayDesc(e.target.value)}
            />
          </div>
          <Button
            onClick={async () => {
              const link = await base44.functions.invoke('createStripePaymentLink', {
                amount: parseFloat(payAmount),
                description: payDesc,
              });
              setGeneratedLink(link.url);
            }}
            disabled={!payAmount || !payDesc}
            className="w-full"
          >
            Generate Payment Link
          </Button>

          {generatedLink && (
            <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-xs text-muted-foreground mb-2">Payment Link Generated:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 text-xs bg-secondary rounded px-2 py-1.5 border border-border text-foreground"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(generatedLink)}
                  className="h-8 w-8"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <a
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
              >
                Open in Stripe <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}