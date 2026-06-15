'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BoostBadgeProps {
  label: string;
  mechanism: string;
  className?: string;
}

export default function BoostBadge({
  label,
  mechanism,
  className = '',
}: BoostBadgeProps) {
  const [showMechanism, setShowMechanism] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <motion.div
        className={`boost-badge ${className}`}
        onClick={() => setShowMechanism(!showMechanism)}
        onHoverStart={() => setShowMechanism(true)}
        onHoverEnd={() => setShowMechanism(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="boost-badge__pulse" />
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          trending_up
        </span>
        {label}
      </motion.div>

      <AnimatePresence>
        {showMechanism && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: 8,
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-inverse-surface)',
              color: 'var(--color-inverse-on-surface)',
              fontSize: 'var(--font-caption)',
              whiteSpace: 'nowrap',
              zIndex: 10,
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            {mechanism}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
