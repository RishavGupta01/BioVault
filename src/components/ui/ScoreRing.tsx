'use client';

import React, { useEffect, useState } from 'react';
import type { ScoreRingSize } from '@/types/ui';

interface ScoreRingProps {
  score: number;
  size?: ScoreRingSize;
  className?: string;
  label?: string;
}

const sizeConfig: Record<
  ScoreRingSize,
  { dim: number; stroke: number; fontSize: string; statusSize: string }
> = {
  sm: { dim: 120, stroke: 8, fontSize: '28px', statusSize: '11px' },
  md: { dim: 192, stroke: 10, fontSize: '48px', statusSize: '13px' },
  lg: { dim: 256, stroke: 12, fontSize: '64px', statusSize: '16px' },
};

function getScoreColor(score: number): string {
  if (score >= 85) return 'teal';
  if (score < 40) return 'critical';
  return 'indigo';
}

function getStatusText(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  if (score >= 40) return 'Needs Attention';
  return 'Critical';
}

export default function ScoreRing({
  score,
  size = 'md',
  className = '',
  label,
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = sizeConfig[size];
  const radius = (config.dim - config.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;
  const colorName = getScoreColor(score);
  const statusText = label || getStatusText(score);

  useEffect(() => {
    // Animated count-up
    const duration = 1200;
    const startTime = performance.now();
    let rafId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [score]);

  return (
    <div
      className={`score-ring ${className}`}
      style={{ width: config.dim, height: config.dim }}
    >
      <svg
        width={config.dim}
        height={config.dim}
        viewBox={`0 0 ${config.dim} ${config.dim}`}
      >
        {/* Soft inner shadow filter */}
        <defs>
          <filter id={`inner-shadow-${size}`}>
            <feFlood floodColor="rgba(0,0,0,0.06)" />
            <feComposite in2="SourceGraphic" operator="in" />
            <feGaussianBlur stdDeviation="3" />
            <feComposite
              in2="SourceGraphic"
              operator="arithmetic"
              k2="1"
              k3="1"
            />
          </filter>
        </defs>

        {/* Track */}
        <circle
          className="score-ring__track"
          cx={config.dim / 2}
          cy={config.dim / 2}
          r={radius}
          strokeWidth={config.stroke}
          filter={`url(#inner-shadow-${size})`}
        />

        {/* Progress */}
        <circle
          className={`score-ring__progress score-ring__progress--${colorName}`}
          cx={config.dim / 2}
          cy={config.dim / 2}
          r={radius}
          strokeWidth={config.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>

      {/* Center label */}
      <div className="score-ring__label">
        <span
          className="score-ring__value"
          style={{ fontSize: config.fontSize }}
        >
          {animatedScore}
        </span>
        <span
          className="score-ring__status"
          style={{ fontSize: config.statusSize }}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}
