import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

const TABS = ['Exchange API', 'Wallet Address'];

export default function ConnectAccountModal({ open, onClose, onConnected }) {
  const [tab, setTab] = useState(0);
  const [exchange, setExchange] = useState('coinbase');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setApiKey(''); setApiSecret(''); setWalletAddress(''); setLabel(''); setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = tab === 0
      ? { type: 'exchange', exchange, apiKey: apiKey.slice(0, 6) + '••••••', apiSecret: '••••••', label: label || exchange, connectedAt: new Date().toISOString(), status: 'active' }
      : { type: 'wallet', walletAddress, label: label || walletAddress.slice(0, 10) + '…', connectedAt: new Date().toISOString(), status: 'active' };
    await base44.entities.ConnectedAccount.create(payload);
    setSaving(false);
    reset();
    onConnected?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Account</DialogTitle>
        </DialogHeader>
        <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-4">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${tab === i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>
          ))}
        </div>

        {tab === 0 ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Exchange</label>
              <select value={exchange} onChange={e => setExchange(e.target.value)} className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground">
                <option value="coinbase">Coinbase</option>
                <option value="kraken">Kraken</option>
                <option value="binance">Binance</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">API Key</label>
              <Input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Paste your API key" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">API Secret</label>
              <Input type="password" value={apiSecret} onChange={e => setApiSecret(e.target.value)} placeholder="Paste your API secret" />
            </div>
            <p className="text-[11px] text-yellow-500">⚠️ Read-only keys only. Never grant withdrawal permissions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Public Wallet Address (ETH or BTC)</label>
              <Input value={walletAddress} onChange={e => setWalletAddress(e.target.value)} placeholder="0x... or bc1..." />
            </div>
          </div>
        )}

        <div className="mt-2">
          <label className="text-xs text-muted-foreground mb-1 block">Label (optional)</label>
          <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. My Coinbase" />
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving || (tab === 0 ? !apiKey : !walletAddress)}>
            {saving ? 'Saving…' : 'Connect'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}