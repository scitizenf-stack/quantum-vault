import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, ShoppingBag, Menu, X, Shield, ChevronDown, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_SECTIONS } from '@/lib/navConfig';
import { base44 } from '@/api/base44Client';

function isGroupActive(item, pathname) {
  if (!item.children) return pathname === item.path;
  return item.children.some(c => pathname === c.path) || pathname === item.path;
}

export default function MobileNav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (id) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar/95 backdrop-blur-xl border-b border-sidebar-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">Quantum Vault</span>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-14" />

      {/* Full-screen drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-sidebar overflow-y-auto flex flex-col">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-bold">Quantum Vault</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-3 space-y-0.5">
            {NAV_SECTIONS.map(item => {
              const hasChildren = item.children?.length > 0;
              const groupActive = isGroupActive(item, location.pathname);
              const isOpen = openGroups[item.id];

              if (!hasChildren) {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleGroup(item.id)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full",
                      groupActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )} />
                  </button>
                  {isOpen && (
                    <div className="ml-6 border-l border-sidebar-border pl-3 mt-0.5 mb-1 space-y-0.5">
                      {item.children.map(child => {
                        const childActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                              "block px-3 py-2 text-sm rounded-md transition-all",
                              childActive
                                ? "text-primary bg-primary/10 font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Drawer footer */}
          <div className="p-3 border-t border-sidebar-border">
            <button
              onClick={() => base44.auth.logout()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}