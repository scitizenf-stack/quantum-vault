import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, LogOut, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { NAV_SECTIONS } from '@/lib/navConfig';

const MAIN_IDS = ['dashboard', 'wallet', 'portfolio'];

function isGroupActive(item, pathname) {
  if (!item.children) return pathname === item.path;
  return item.children.some(c => pathname === c.path) || pathname === item.path;
}

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState(() => {
    // Auto-open the group that contains the current path
    const init = {};
    NAV_SECTIONS.forEach(item => {
      if (item.children && isGroupActive(item, location.pathname)) {
        init[item.id] = true;
      }
    });
    return init;
  });

  // Auto-open group on navigation
  useEffect(() => {
    NAV_SECTIONS.forEach(item => {
      if (item.children && isGroupActive(item, location.pathname)) {
        setOpenGroups(prev => ({ ...prev, [item.id]: true }));
      }
    });
  }, [location.pathname]);

  const toggleGroup = (id) => {
    if (collapsed) return;
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const mainItems = NAV_SECTIONS.filter(s => MAIN_IDS.includes(s.id));
  const groupItems = NAV_SECTIONS.filter(s => !MAIN_IDS.includes(s.id));

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-all duration-300",
      collapsed ? "w-[60px]" : "w-[248px]"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 h-14 border-b border-sidebar-border flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden min-w-0">
            <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight leading-none truncate">Quantum Vault</h1>
            <p className="text-[9px] text-muted-foreground font-mono tracking-widest uppercase mt-0.5">Command Center</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
        {/* Main section */}
        {!collapsed && (
          <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-3 mb-1">Main</p>
        )}
        {mainItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
            </Link>
          );
        })}

        {/* Groups */}
        {!collapsed && <div className="my-2 border-t border-sidebar-border" />}

        {groupItems.map(item => {
          const hasChildren = item.children?.length > 0;
          const groupActive = isGroupActive(item, location.pathname);
          const isOpen = openGroups[item.id] && !collapsed;

          if (!hasChildren) {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              </Link>
            );
          }

          return (
            <div key={item.id}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(item.id)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all w-full",
                  groupActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", groupActive && "text-primary")} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    <ChevronDown className={cn(
                      "w-3 h-3 flex-shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )} />
                  </>
                )}
              </button>

              {/* Children */}
              {isOpen && (
                <div className="ml-5 mt-0.5 mb-1 border-l border-sidebar-border pl-2.5 space-y-0.5">
                  {item.children.map(child => {
                    const childActive = location.pathname === child.path;
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "block px-2 py-1.5 text-xs rounded-md transition-all truncate",
                          childActive
                            ? "text-primary bg-primary/10 font-medium"
                            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
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

      {/* Footer */}
      <div className="px-2 pb-3 space-y-1 flex-shrink-0 border-t border-sidebar-border pt-2">
        <button
          onClick={() => base44.auth.logout()}
          title={collapsed ? 'Log Out' : undefined}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-1.5 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}