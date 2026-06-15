'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Severity } from '@/types/ui';

interface ConflictAlertProps {
  severity: Severity;
  title: string;
  mechanism: string;
  resolution?: string;
  className?: string;
}

export default function ConflictAlert({
  severity,
  title,
  mechanism,
  resolution,
  className = '',
}: ConflictAlertProps) {
  const icon = severity === 'critical' ? 'error' : 'warning';

  return (
    <motion.div
      className={`conflict-alert conflict-alert--${severity} ${className}`}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div
        className={`conflict-alert__icon conflict-alert__icon--${severity}`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="conflict-alert__body">
        <div className="conflict-alert__title">
          <span className={`chip chip--${severity}`} style={{ marginRight: 8 }}>
            {severity}
          </span>
          {title}
        </div>
        <div className="conflict-alert__mechanism">{mechanism}</div>
        {resolution && (
          <div className="conflict-alert__resolution">💡 {resolution}</div>
        )}
      </div>
    </motion.div>
  );
}
