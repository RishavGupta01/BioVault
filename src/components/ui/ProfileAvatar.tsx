'use client';

import React from 'react';

interface ProfileAvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gradients: Record<string, string> = {
  indigo: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  teal: 'linear-gradient(135deg, #006b5f, #059669)',
  amber: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  rose: 'linear-gradient(135deg, #ef4444, #ec4899)',
  sky: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
  emerald: 'linear-gradient(135deg, #10b981, #14b8a6)',
  purple: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  orange: 'linear-gradient(135deg, #f97316, #ef4444)',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ProfileAvatar({
  name,
  color = 'indigo',
  size = 'md',
  className = '',
}: ProfileAvatarProps) {
  const gradient = gradients[color] || gradients.indigo;

  return (
    <div
      className={`profile-avatar profile-avatar--${size} ${className}`}
      style={{ background: gradient }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
