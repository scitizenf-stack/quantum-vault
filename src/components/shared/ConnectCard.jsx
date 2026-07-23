import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export default function ConnectCard({ service, instructions, docsUrl }) {
  return (
    <div className="rounded-xl border border-dashed border-yellow-500/40 bg-yellow-500/5 p-8 flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-yellow-500" />
      </div>
      <div>
        <p className="text-sm font-semibold">{service} not connected</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">{instructions}</p>
      </div>
      {docsUrl && (
        <a href={docsUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline">
          <ExternalLink className="w-3.5 h-3.5" /> Configure now
        </a>
      )}
    </div>
  );
}