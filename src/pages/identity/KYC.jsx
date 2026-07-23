import React from 'react';
import { CheckCircle, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const STEPS = [
  { step: 1, title: 'Identity Verification', desc: 'Government-issued ID verified against biometric data', date: 'Jan 15, 2024', method: 'Passport + Liveness Check' },
  { step: 2, title: 'Address Verification', desc: 'Proof of residence confirmed and cross-referenced', date: 'Jan 16, 2024', method: 'Utility Bill + Bank Statement' },
  { step: 3, title: 'Enhanced Due Diligence', desc: 'Full AML/KYB screening and source of funds verification', date: 'Jan 22, 2024', method: 'EDD Review + PEP/Sanctions' },
];

export default function KYC() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">KYC Status</h1>
          <p className="text-xs text-muted-foreground mt-1">Know Your Customer verification levels</p>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-xl px-4 py-2">
          <Award className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs font-bold text-accent">Level 3</p>
            <p className="text-[10px] text-muted-foreground">Enhanced</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {STEPS.map((s, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-accent" />
              </div>
              {i < STEPS.length - 1 && <div className="w-0.5 h-full bg-accent/30 mt-1" />}
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex-1 mb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">Step {s.step}: {s.title}</p>
                <Badge variant="default" className="text-[10px] bg-accent/20 text-accent border-accent/30">Verified</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
              <div className="flex gap-4 text-[10px] text-muted-foreground">
                <span>Method: <span className="text-foreground">{s.method}</span></span>
                <span>Date: <span className="text-foreground">{s.date}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}