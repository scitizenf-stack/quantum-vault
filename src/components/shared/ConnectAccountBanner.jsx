import React, { useState } from 'react';
import { Link2, Wallet, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConnectAccountModal from './ConnectAccountModal';

export default function ConnectAccountBanner({ onConnected }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Link2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold mb-1">Connect Your Account</p>
          <p className="text-xs text-muted-foreground">No verified balances yet.<br />Connect an exchange or wallet to see your real holdings.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button size="sm" onClick={() => setOpen(true)}>
            <Building2 className="w-3.5 h-3.5 mr-1" /> Connect Coinbase
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            <Wallet className="w-3.5 h-3.5 mr-1" /> Add Wallet
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            <Building2 className="w-3.5 h-3.5 mr-1" /> Connect Kraken
          </Button>
        </div>
      </div>
      <ConnectAccountModal open={open} onClose={() => setOpen(false)} onConnected={onConnected} />
    </>
  );
}