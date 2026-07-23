import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function LiveBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between">
      <p className="text-xs text-amber-700 font-medium">📡 Live market prices powered by CoinGecko. Portfolio balances require account connection. This app does not hold or transfer funds.</p>
      <button onClick={() => setDismissed(true)} className="text-amber-600 hover:text-amber-700 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}