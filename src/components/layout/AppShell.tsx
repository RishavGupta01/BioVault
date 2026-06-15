'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import CommandPalette from '@/components/ui/CommandPalette';

interface AppShellProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

const commandItems = [
  {
    id: 'home',
    label: 'Go to Home',
    icon: 'grid_view',
    hint: 'Dashboard',
    href: '/',
  },
  {
    id: 'timeline',
    label: 'Open Timeline',
    icon: 'timeline',
    hint: 'Schedule',
    href: '/timeline',
  },
  {
    id: 'add',
    label: 'Add Item',
    icon: 'add_circle',
    hint: 'Quick Entry',
    href: '/add',
  },
  {
    id: 'score',
    label: 'View Score',
    icon: 'analytics',
    hint: 'Wellness',
    href: '/score',
  },
  {
    id: 'detective',
    label: 'Stomach-Ache Detective',
    icon: 'search',
    hint: 'Investigate',
    href: '/detective',
  },
  {
    id: 'resolver',
    label: 'Clinical Resolver',
    icon: 'psychology',
    hint: 'Entity Lookup',
    href: '/resolver',
  },
  {
    id: 'profiles',
    label: 'Family Profiles',
    icon: 'group',
    hint: 'Manage',
    href: '/profiles',
  },
];

export default function AppShell({ children, rightPanel }: AppShellProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Cmd+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const paletteItems = commandItems.map((item) => ({
    ...item,
    action: () => router.push(item.href),
  }));

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <div className="app-shell__sidebar">
        <Sidebar />
      </div>

      {/* Mobile/Tablet Top Bar */}
      <div className="app-shell__topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="sidebar__logo-icon"
            style={{ width: 32, height: 32, fontSize: 18 }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              biotech
            </span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>BioVault</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCommandOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              search
            </span>
          </button>
          {rightPanel && (
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                insights
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main
        className={`app-shell__main ${
          rightPanel ? 'app-shell__main--with-right' : ''
        }`}
      >
        {children}
      </main>

      {/* Right Panel */}
      {rightPanel && (
        <aside
          className={`app-shell__right-panel ${
            rightPanelOpen ? 'app-shell__right-panel--open' : ''
          }`}
        >
          {rightPanel}
        </aside>
      )}

      {/* Mobile Bottom Nav */}
      <div className="app-shell__bottom-nav">
        <BottomNav />
      </div>

      {/* Command Palette */}
      <CommandPalette
        items={paletteItems}
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
      />
    </div>
  );
}
