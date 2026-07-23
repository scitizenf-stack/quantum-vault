import React from 'react';
import { Smartphone, Laptop, Tablet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DEVICES = [
  { name: 'iPhone 15 Pro Max', type: 'phone', imei: '35 456789 012345 6', carrier: 'QM-US', status: 'active', last: 'Now', sim: 'eSIM 1' },
  { name: 'Samsung Galaxy S24', type: 'phone', imei: '35 987654 321098 7', carrier: 'QM-EU', status: 'standby', last: '3 days ago', sim: 'eSIM 2' },
  { name: 'MacBook Pro M4', type: 'laptop', imei: 'N/A', carrier: 'Wi-Fi only', status: 'active', last: '1 hour ago', sim: 'N/A' },
  { name: 'iPad Pro 13"', type: 'tablet', imei: '35 111222 333444 5', carrier: 'QM-US', status: 'inactive', last: '2 weeks ago', sim: 'Physical SIM' },
];

const DevIcon = ({ type }) => {
  if (type === 'laptop') return <Laptop className="w-4 h-4 text-muted-foreground" />;
  if (type === 'tablet') return <Tablet className="w-4 h-4 text-muted-foreground" />;
  return <Smartphone className="w-4 h-4 text-muted-foreground" />;
};

const statusVariant = (s) => s === 'active' ? 'default' : s === 'standby' ? 'secondary' : 'outline';

export default function TelecomDevices() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Devices</h1>
        <p className="text-xs text-muted-foreground mt-1">{DEVICES.length} registered devices</p>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {['Device', 'IMEI', 'SIM', 'Carrier', 'Last Seen', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEVICES.map((d, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <DevIcon type={d.type} />
                    <span className="text-xs font-medium">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{d.imei}</td>
                <td className="px-4 py-3 text-xs">{d.sim}</td>
                <td className="px-4 py-3 text-xs">{d.carrier}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.last}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant(d.status)} className="text-[10px]">{d.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}