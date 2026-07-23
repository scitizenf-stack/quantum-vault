import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function StaleBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-2 py-0.5 ml-2">
      <AlertTriangle className="w-2.5 h-2.5" />
      stale
    </span>
  );
}