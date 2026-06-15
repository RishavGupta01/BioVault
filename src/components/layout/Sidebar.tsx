'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProfileAvatar from '@/components/ui/ProfileAvatar';
import Button from '@/components/ui/Button';
import type { NavItem } from '@/types/ui';

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: 'grid_view' },
  { label: 'Timeline', href: '/timeline', icon: 'timeline' },
  { label: 'Score', href: '/score', icon: 'analytics' },
  { label: 'Add', href: '/add', icon: 'add_circle' },
  { label: 'Detective', href: '/detective', icon: 'search' },
  { label: 'Resolver', href: '/resolver', icon: 'psychology' },
  { label: 'Profiles', href: '/profiles', icon: 'group' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];

const footerItems: NavItem[] = [
  { label: 'Help', href: '/help', icon: 'help' },
  { label: 'Sign Out', href: '/signout', icon: 'logout' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
            biotech
          </span>
        </div>
        <span className="sidebar__logo-text">BioVault</span>
      </div>

      {/* Profile */}
      <div className="sidebar__profile">
        <ProfileAvatar name="User" color="indigo" size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 'var(--font-caption)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            My Profile
          </div>
          <div
            style={{
              fontSize: 'var(--font-small)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--color-success)',
                display: 'inline-block',
              }}
            />
            Synced
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar__nav-item ${
              isActive(item.href) ? 'sidebar__nav-item--active' : ''
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Quick Entry */}
      <div className="sidebar__quick-entry">
        <Link href="/add">
          <Button variant="primary" icon="add" style={{ width: '100%' }}>
            Quick Entry
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <div className="sidebar__footer">
        {footerItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="sidebar__nav-item"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
