'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Home', href: '/', icon: 'grid_view' },
  { label: 'Timeline', href: '/timeline', icon: 'timeline' },
  { label: 'Add', href: '/add', icon: 'add_circle' },
  { label: 'Score', href: '/score', icon: 'analytics' },
  { label: 'More', href: '/profiles', icon: 'more_horiz' },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`bottom-nav__item ${
            isActive(item.href) ? 'bottom-nav__item--active' : ''
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span>{item.label}</span>
          {isActive(item.href) && <span className="bottom-nav__indicator" />}
        </Link>
      ))}
    </nav>
  );
}
