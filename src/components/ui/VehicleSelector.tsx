'use client';

import React from 'react';
import type { Vehicle } from '@/types/ui';

interface VehicleSelectorProps {
  value: Vehicle;
  onChange: (vehicle: Vehicle) => void;
  className?: string;
}

const vehicles: { id: Vehicle; icon: string; label: string }[] = [
  { id: 'water', icon: 'water_drop', label: 'Water' },
  { id: 'milk', icon: 'local_cafe', label: 'Milk' },
  { id: 'coffee', icon: 'coffee', label: 'Coffee' },
  { id: 'juice', icon: 'local_bar', label: 'Juice' },
  { id: 'alcohol', icon: 'liquor', label: 'Alcohol' },
];

export default function VehicleSelector({
  value,
  onChange,
  className = '',
}: VehicleSelectorProps) {
  return (
    <div className={`vehicle-selector ${className}`}>
      {vehicles.map((v) => (
        <button
          key={v.id}
          className={`vehicle-selector__btn ${
            value === v.id ? 'vehicle-selector__btn--active' : ''
          }`}
          onClick={() => onChange(v.id)}
          title={v.label}
          type="button"
        >
          <span className="material-symbols-outlined">{v.icon}</span>
        </button>
      ))}
    </div>
  );
}
