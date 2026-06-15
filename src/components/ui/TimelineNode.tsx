'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Vehicle, Category, TimelineItemUI } from '@/types/ui';

interface TimelineNodeProps {
  item: TimelineItemUI;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onClick?: () => void;
  className?: string;
}

const vehicleIconMap: Record<Vehicle, string> = {
  water: 'water_drop',
  milk: 'local_cafe',
  coffee: 'coffee',
  juice: 'local_bar',
  alcohol: 'liquor',
};

const categoryClassMap: Record<Category, string> = {
  medicine: 'timeline-node__icon--medicine',
  supplement: 'timeline-node__icon--supplement',
  food: 'timeline-node__icon--food',
};

const categoryChipMap: Record<Category, string> = {
  medicine: 'chip--indigo',
  supplement: 'chip--teal',
  food: 'chip--amber',
};

export default function TimelineNode({
  item,
  onDragStart,
  onDragEnd,
  onClick,
  className = '',
}: TimelineNodeProps) {
  return (
    <motion.div
      className={`timeline-node ${item.isGhost ? 'timeline-node--ghost' : ''} ${className}`}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: item.isGhost ? 0.5 : 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Conflict badges */}
      {item.conflicts && item.conflicts > 0 && (
        <div className="timeline-node__badges">
          <span className="badge badge--critical">{item.conflicts}</span>
        </div>
      )}

      {/* Vehicle icon */}
      <div className={`timeline-node__icon ${categoryClassMap[item.category]}`}>
        <span className="material-symbols-outlined">
          {vehicleIconMap[item.vehicle]}
        </span>
      </div>

      {/* Content */}
      <div className="timeline-node__content">
        <div className="timeline-node__name">{item.name}</div>
        <div className="timeline-node__time">{item.scheduledTime}</div>
      </div>

      {/* Category chip */}
      <span className={`chip ${categoryChipMap[item.category]}`}>
        {item.category}
      </span>
    </motion.div>
  );
}
