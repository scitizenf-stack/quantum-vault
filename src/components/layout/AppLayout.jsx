import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import LiveBanner from '../shared/LiveBanner';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Private Access Banner */}
      <div className="bg-destructive text-destructive-foreground text-center text-[11px] font-bold py-1 tracking-widest">
        ⚠ COMMAND CENTER — PRIVATE ACCESS ONLY
      </div>

      {/* Live Banner */}
      <LiveBanner />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      {/* Main Content */}
      <main className={`lg:transition-all lg:duration-300 min-h-screen ${collapsed ? 'lg:ml-[60px]' : 'lg:ml-[248px]'}`}>
        <div className="p-4 md:p-6 lg:p-8 pb-8 pt-4 lg:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}