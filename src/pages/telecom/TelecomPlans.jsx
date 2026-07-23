import React from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PLANS = [
  {
    name: 'Essential', price: '$29/mo', current: false,
    features: { 'Data': '10GB', 'Voice': '200 min', 'SMS': '100 SMS', 'Roaming': false, 'Multi-SIM': false, 'eSIM': true, '5G': false, 'Priority Network': false, 'Zero Trust VPN': false },
  },
  {
    name: 'Sovereign', price: '$79/mo', current: true,
    features: { 'Data': '100GB', 'Voice': '1200 min', 'SMS': '500 SMS', 'Roaming': true, 'Multi-SIM': true, 'eSIM': true, '5G': true, 'Priority Network': false, 'Zero Trust VPN': false },
  },
  {
    name: 'Omega', price: '$199/mo', current: false,
    features: { 'Data': 'Unlimited', 'Voice': 'Unlimited', 'SMS': 'Unlimited', 'Roaming': true, 'Multi-SIM': true, 'eSIM': true, '5G': true, 'Priority Network': true, 'Zero Trust VPN': true },
  },
];

const FEATS = Object.keys(PLANS[0].features);

export default function TelecomPlans() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Plans</h1>
        <p className="text-xs text-muted-foreground mt-1">Compare and upgrade your plan</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground bg-card border border-border rounded-tl-xl"></th>
              {PLANS.map(p => (
                <th key={p.name} className={`px-4 py-3 text-center bg-card border-t border-b border-r border-border ${p.current ? 'border-t-primary border-t-2' : ''}`}>
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-primary font-semibold mt-0.5">{p.price}</p>
                  {p.current && <Badge className="mt-1 text-[9px]">Current Plan</Badge>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATS.map((feat, i) => (
              <tr key={feat} className="hover:bg-secondary/10">
                <td className={`px-4 py-3 text-xs text-muted-foreground bg-card border-l border-b border-r border-border font-medium ${i === FEATS.length - 1 ? 'rounded-bl-xl' : ''}`}>{feat}</td>
                {PLANS.map((p, pi) => (
                  <td key={pi} className={`px-4 py-3 text-center bg-card border-b border-r border-border ${i === FEATS.length - 1 && pi === PLANS.length - 1 ? 'rounded-br-xl' : ''}`}>
                    {typeof p.features[feat] === 'boolean' ? (
                      p.features[feat]
                        ? <Check className="w-4 h-4 text-accent mx-auto" />
                        : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                    ) : (
                      <span className="text-xs font-medium">{p.features[feat]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}