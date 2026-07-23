import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SDKS = [
  { name: 'Python SDK', version: 'v2.1.4', lang: 'Python', install: 'pip install quantum-vault-sdk', docs: '#', badge: 'Stable' },
  { name: 'Node.js SDK', version: 'v2.3.1', lang: 'JavaScript', install: 'npm install @quantum-vault/sdk', docs: '#', badge: 'Stable' },
  { name: 'REST API', version: 'v1.0', lang: 'HTTP', install: 'curl https://api.quantumvaultsolutions.com/v1/', docs: '#', badge: 'Stable' },
  { name: 'CLI Tool', version: 'v1.2.0', lang: 'Shell', install: 'npm install -g @quantum-vault/cli', docs: '#', badge: 'Beta' },
  { name: 'Go SDK', version: 'v0.9.0', lang: 'Go', install: 'go get github.com/quantum-vault/go-sdk', docs: '#', badge: 'Preview' },
];

const langColor = { Python: 'bg-blue-500/10 text-blue-400 border-blue-500/30', JavaScript: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', HTTP: 'bg-purple-500/10 text-purple-400 border-purple-500/30', Shell: 'bg-green-500/10 text-green-400 border-green-500/30', Go: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };

export default function SDKs() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">SDKs & Tools</h1>
        <p className="text-xs text-muted-foreground mt-1">Official Quantum Vault client libraries</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SDKS.map((sdk, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold">{sdk.name}</p>
                <p className="text-xs text-muted-foreground">{sdk.version}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono border px-2 py-0.5 rounded-md ${langColor[sdk.lang]}`}>{sdk.lang}</span>
                <Badge variant={sdk.badge === 'Stable' ? 'default' : sdk.badge === 'Beta' ? 'secondary' : 'outline'} className="text-[10px]">{sdk.badge}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#0a0c10] border border-border rounded-lg px-3 py-2">
              <code className="text-xs font-mono text-accent flex-1 truncate">{sdk.install}</code>
              <button className="text-muted-foreground hover:text-primary flex-shrink-0"><Copy className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex justify-end">
              <a href={sdk.docs} className="text-[11px] text-primary hover:underline flex items-center gap-1">
                Documentation <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}