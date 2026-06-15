'use client';

import React, { useState } from 'react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

const quickSlots = [
  { label: 'Fasting', time: '06:00', desc: '6:00 AM' },
  { label: 'Breakfast', time: '08:00', desc: '8:00 AM' },
  { label: 'Lunch', time: '12:30', desc: '12:30 PM' },
  { label: 'Dinner', time: '19:00', desc: '7:00 PM' },
  { label: 'Before Bed', time: '22:00', desc: '10:00 PM' },
];

export default function TimePicker({
  value,
  onChange,
  className = '',
}: TimePickerProps) {
  const [isManual, setIsManual] = useState(false);

  return (
    <div className={`time-picker ${className}`}>
      <div className="time-picker__slots">
        {quickSlots.map((slot) => (
          <button
            key={slot.time}
            className={`time-picker__slot ${
              value === slot.time ? 'time-picker__slot--active' : ''
            }`}
            onClick={() => {
              onChange(slot.time);
              setIsManual(false);
            }}
            type="button"
          >
            {slot.label}
            <span
              style={{
                fontSize: 'var(--font-small)',
                opacity: 0.7,
                marginLeft: 4,
              }}
            >
              {slot.desc}
            </span>
          </button>
        ))}
        <button
          className={`time-picker__slot ${isManual ? 'time-picker__slot--active' : ''}`}
          onClick={() => setIsManual(true)}
          type="button"
        >
          Custom
        </button>
      </div>

      {isManual && (
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <div className="input-field" style={{ maxWidth: 160 }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, color: 'var(--color-on-surface-variant)' }}
            >
              schedule
            </span>
            <input
              type="time"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 'var(--font-body)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
