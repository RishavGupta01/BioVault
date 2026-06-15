'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import GlassCard from '@/components/ui/GlassCard';
import ScoreRing from '@/components/ui/ScoreRing';
import ConflictAlert from '@/components/ui/ConflictAlert';
import BoostBadge from '@/components/ui/BoostBadge';
import { useTimelineStore } from '@/store/useTimelineStore';

export default function ScorePage() {
  const { wellnessScore, scoreBreakdown, conflicts, boosts, loadEntries } = useTimelineStore();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    loadEntries('default');
    setTimeout(() => setAnimate(true), 100);
  }, [loadEntries]);

  const breakdownItems = [
    { key: 'absorption', label: 'Absorption', icon: 'science', color: '#6366F1', description: 'How well items are absorbed based on timing and combinations' },
    { key: 'critical', label: 'Critical', icon: 'warning', color: '#EF4444', description: 'Dangerous drug interactions or contraindications' },
    { key: 'gastric', label: 'Gastric', icon: 'medical_information', color: '#F59E0B', description: 'Stomach irritation and GI compatibility' },
    { key: 'cumulative', label: 'Cumulative', icon: 'stacked_line_chart', color: '#8B5CF6', description: 'Overall load and scheduling density' },
  ];

  return (
    <AppShell>
      <div style={{ padding: 'var(--spacing-panel)', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 600, marginBottom: 8 }}>Wellness Score</h2>
        <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)', marginBottom: 32 }}>
          S = 100 − (0.40×Absorption + 0.25×Critical + 0.20×Gastric + 0.15×Cumulative)
        </p>

        {/* Hero Score Ring */}
        <GlassCard style={{ display: 'flex', justifyContent: 'center', padding: 48, borderRadius: 'var(--radius-lg)', marginBottom: 32 }}>
          <ScoreRing score={wellnessScore} size="lg" />
        </GlassCard>

        {/* Breakdown Bars */}
        <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
          {breakdownItems.map(({ key, label, icon, color, description }) => {
            const value = scoreBreakdown[key as keyof typeof scoreBreakdown];
            return (
              <GlassCard key={key} style={{ borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span className="material-symbols-outlined" style={{ color, fontSize: 20 }}>{icon}</span>
                  <span style={{ fontWeight: 600, flex: 1 }}>{label}</span>
                  <span style={{ fontSize: 'var(--font-caption)', color: value > 30 ? 'var(--color-critical)' : 'var(--color-on-surface-variant)', fontWeight: 600 }}>
                    {value} / 100
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--color-surface-container-high)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: animate ? `${Math.min(value, 100)}%` : '0%',
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                    borderRadius: 4, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginTop: 4 }}>{description}</p>
              </GlassCard>
            );
          })}
        </div>

        {/* Conflicts Section */}
        {conflicts.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-critical)' }}>error</span>
              Active Conflicts ({conflicts.length})
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {conflicts.map((c, i) => (
                <ConflictAlert key={i} severity={c.rule.type === 'CRITICAL_BLOCK' ? 'critical' : 'warning'}
                  title={`${c.itemA.replace(/_/g, ' ')} ↔ ${c.itemB.replace(/_/g, ' ')}`}
                  mechanism={c.rule.mechanism} resolution={c.rule.resolution} />
              ))}
            </div>
          </div>
        )}

        {/* Boosts Section */}
        {boosts.length > 0 && (
          <div style={{ paddingBottom: 80 }}>
            <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>bolt</span>
              Active Synergies ({boosts.length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {boosts.map((b, i) => (
                <BoostBadge key={i} label={`${b.itemA.replace(/_/g, ' ')} + ${b.itemB.replace(/_/g, ' ')}`} mechanism={b.rule.mechanism} />
              ))}
            </div>
          </div>
        )}

        {conflicts.length === 0 && boosts.length === 0 && (
          <GlassCard style={{ textAlign: 'center', padding: 32, borderRadius: 'var(--radius-lg)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-success)', marginBottom: 8, display: 'block' }}>verified</span>
            <h3 style={{ fontSize: 'var(--font-h3)', marginBottom: 8 }}>All clear!</h3>
            <p style={{ color: 'var(--color-on-surface-variant)' }}>No conflicts or interactions detected in your current timeline.</p>
          </GlassCard>
        )}
      </div>
    </AppShell>
  );
}
