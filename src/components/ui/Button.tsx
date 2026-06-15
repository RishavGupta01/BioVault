'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { ButtonVariant, ButtonSize } from '@/types/ui';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  icon?: string;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary: 'btn btn--primary',
  ghost: 'btn btn--ghost',
  danger: 'btn btn--danger',
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: 'btn--sm',
  md: '',
  lg: 'btn--lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  icon,
  loading = false,
  className = '',
  type = 'button',
  style,
}: ButtonProps) {
  const classes = [
    variantClassMap[variant],
    sizeClassMap[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      whileTap={{ scale: 0.97 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      style={style}
    >
      {loading ? (
        <motion.span
          className="material-symbols-outlined"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '20px' }}
        >
          progress_activity
        </motion.span>
      ) : icon ? (
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          {icon}
        </span>
      ) : null}
      {children}
    </motion.button>
  );
}
