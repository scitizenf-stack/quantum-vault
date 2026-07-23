import React from 'react';
import { Globe, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const REGIONS = [
  { region: 'North America', countries: 'US, CA, MX', coverage: 'Full 5G', status: 'operational', speed: '1.2 Gbps' },
  { region: 'Europe', countries: 'EU-27, UK, CH, NO', coverage: 'Full 5G', status: 'operational', speed: '980 Mbps' },
  { region: 'Asia Pacific', countries: 'JP, KR, SG, AU', coverage: 'LTE / 5G Partial', status: 'partial', speed: '450 Mbps' },
  { region: 'Middle East', countries: 'UAE, SA, QA', coverage: 'LTE', status: 'operational', speed: '320 Mbps' },
  { region: 'Latin America', countries: 'BR, AR, CO, CL', coverage: 'LTE Partial', status: 'partial', speed: '180 Mbps' },
  { region: 'Africa', countries: 'GH, NG, KE, ZA', coverage: 'LTE Limited', status: 'limited', speed: '80 Mbps' },
  { region: 'South Asia', countries: 'IN, PK, BD', coverage: 'LTE', status: 'operational', speed: '210 Mbps' },
  { region: 'CIS / Russia', countries: 'RU, KZ, BY, UA', coverage: 'Restricted', status: 'limited', speed: '90 Mbps' },
];

const StatusIcon = ({ s }) => {
  if (s === 'operational') return <CheckCircle className="w-4 h-4 text-accent" />;
  if (s === 'partial') return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  return <XCircle className="w-4 h-4 text-destructive" />;
};

const statusBg = (s) => s === 'operational' ? 'border-accent/30 bg-accent/5' : s === 'partial' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-destructive/30 bg-destructive/5';

export default function TelecomRegions() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Regions</h1>
        <p className="text-xs text-muted-foreground mt-1">Global coverage map — {REGIONS.filter(r => r.status === 'operational').length} regions fully operational</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REGIONS.map(r => (
          <div key={r.region} className={`border rounded-xl p-4 space-y-2 ${statusBg(r.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold">{r.region}</span>
              </div>
              <StatusIcon s={r.status} />
            </div>
            <p className="text-[10px] text-muted-foreground">{r.countries}</p>
            <p className="text-xs font-medium">{r.coverage}</p>
            <p className="text-[10px] text-muted-foreground">Peak: {r.speed}</p>
          </div>
        ))}
      </div>
    </div>
  );
}