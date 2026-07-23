import React from 'react';
import { Shield, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DigitalID() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Digital ID</h1>
        <p className="text-xs text-muted-foreground mt-1">Sovereign identity credential</p>
      </div>
      <div className="max-w-md">
        {/* ID Card */}
        <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-primary/30 rounded-2xl p-6 overflow-hidden shadow-2xl">
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6 relative">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold tracking-widest text-primary uppercase">Quantum Vault</span>
            </div>
            <div className="flex items-center gap-1.5 bg-accent/20 border border-accent/40 rounded-full px-2.5 py-1">
              <CheckCircle className="w-3 h-3 text-accent" />
              <span className="text-[10px] text-accent font-semibold">Verified</span>
            </div>
          </div>
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary">ND</span>
          </div>
          {/* Info */}
          <div className="space-y-1 relative">
            <p className="text-xl font-bold tracking-tight">Nehemie Destine</p>
            <p className="text-xs text-muted-foreground">Identity Holder · Omega Class</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 relative">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">QV-ID Number</p>
              <p className="text-sm font-mono font-bold text-primary">QV-2024-0847</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">KYC Level</p>
              <p className="text-sm font-bold">Level 3 — Enhanced</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Issued</p>
              <p className="text-xs font-mono">Jan 15, 2024</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Expires</p>
              <p className="text-xs font-mono">Jan 15, 2027</p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-white/10 relative">
            <p className="text-[9px] text-muted-foreground font-mono tracking-widest">
              HASH: 0x4a2f8c91d3e7b042a1...f930
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button variant="outline" className="flex-1 gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
          <Button variant="outline" className="flex-1">Share Credential</Button>
        </div>
      </div>
    </div>
  );
}