'use client';

import React from 'react';
import type { GlassCardVariant } from '@/types/ui';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: GlassCardVariant;
  onClick?: () => void;
  selected?: boolean;
  style?: React.CSSProperties;
}

const variantClassMap: Record<GlassCardVariant, string> = {
  default: 'glass-panel',
  elevated: 'glass-panel-elevated',
  selected: 'glass-panel-selected',
};

export default function GlassCard({
  children,
  className = '',
  variant = 'default',
  onClick,
  selected,
  style,
}: GlassCardProps) {
  const baseClass = selected
    ? 'glass-panel-selected'
    : variantClassMap[variant];

  return (
    <div
      className={`${baseClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        padding: 'var(--spacing-base)',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
