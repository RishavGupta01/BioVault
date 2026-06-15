'use client';

import React from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  icon?: string;
  type?: string;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export default function Input({
  value,
  onChange,
  placeholder,
  label,
  error,
  icon,
  type = 'text',
  className = '',
  autoFocus,
  onKeyDown,
}: InputProps) {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div
        className="input-field"
        style={error ? { borderColor: 'var(--color-error)' } : undefined}
      >
        {icon && (
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '20px',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
        />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
