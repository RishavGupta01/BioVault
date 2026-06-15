'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import GlassCard from '@/components/ui/GlassCard';
import ScoreRing from '@/components/ui/ScoreRing';
import TimelineNode from '@/components/ui/TimelineNode';
import ConflictAlert from '@/components/ui/ConflictAlert';
import BoostBadge from '@/components/ui/BoostBadge';
import Button from '@/components/ui/Button';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useRouter } from 'next/navigation';
import { exactLookup } from '@/engine/fuzzyMatcher';
import type { TimelineItemUI, Category } from '@/types/ui';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5); // 5 AM to 10 PM

export default function TimelinePage() {
  const router = useRouter();
  const { timelineEntries, wellnessScore, conflicts, boosts, scoreBreakdown, loadEntries, removeEntry, isDragging, shadowScore } = useTimelineStore();
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  useEffect(() => { loadEntries('default'); }, [loadEntries]);

  const displayScore = isDragging && shadowScore ? shadowScore.score : wellnessScore;
  const displayConflicts = isDragging && shadowScore ? shadowScore.conflicts : conflicts;
  const displayBoosts = isDragging && shadowScore ? shadowScore.boosts : boosts;

  const rightPanel = (
    <div style={{ padding: 'var(--spacing-panel)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <ScoreRing score={displayScore} size="sm" />
      </div>
      <h4 style={{ fontSize: 'var(--font-body)', fontWeight: 600, marginBottom: 12 }}>Score Breakdown</h4>
      {Object.entries(scoreBreakdown).map(([key, value]) => (
        <div key={key} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-caption)', marginBottom: 4 }}>
            <span style={{ textTransform: 'capitalize' }}>{key}</span>
            <span style={{ color: value > 30 ? 'var(--color-critical)' : 'var(--color-on-surface-variant)' }}>{value}/100</span>
          </div>
          <div style={{ height: 4, background: 'var(--color-surface-container-high)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: value > 50 ? 'var(--color-critical)' : value > 25 ? 'var(--color-warning)' : 'var(--color-primary)', borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      ))}
      {displayConflicts.length > 0 && (
        <>
          <h4 style={{ fontSize: 'var(--font-body)', fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Conflicts ({displayConflicts.length})</h4>
          {displayConflicts.map((c, i) => (
            <ConflictAlert key={i} severity={c.rule.type === 'CRITICAL_BLOCK' ? 'critical' : 'warning'} title={`${c.itemA} ↔ ${c.itemB}`} mechanism={c.rule.mechanism} resolution={c.rule.resolution} />
          ))}
        </>
      )}
      {displayBoosts.length > 0 && (
        <>
          <h4 style={{ fontSize: 'var(--font-body)', fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Boosts ({displayBoosts.length})</h4>
          {displayBoosts.map((b, i) => (
            <BoostBadge key={i} label={`${b.itemA} + ${b.itemB}`} mechanism={b.rule.mechanism} />
          ))}
        </>
      )}
    </div>
  );

  return (
    <AppShell rightPanel={rightPanel}>
      <div style={{ padding: 'var(--spacing-panel)', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 600 }}>Timeline Engine</h2>
            <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>Drag items to simulate schedule changes</p>
          </div>
          <Button variant="primary" icon="add" onClick={() => router.push('/add')}>Add Item</Button>
        </div>

        {/* Timeline Grid */}
        <div style={{ position: 'relative', minHeight: 600 }}>
          {HOURS.map((hour) => {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const hourEntries = timelineEntries.filter(e => {
              const h = parseInt(e.scheduled_time.split(':')[0]);
              return h === hour;
            });
            return (
              <div key={hour} style={{ display: 'flex', borderBottom: '1px solid var(--color-surface-container)', minHeight: 64, transition: 'background 0.15s' }}
                onMouseEnter={() => setHoveredHour(hour)} onMouseLeave={() => setHoveredHour(null)}
                className={hoveredHour === hour ? 'hour-row-hover' : ''}>
                <div style={{ width: 80, flexShrink: 0, padding: '8px 16px 8px 0', textAlign: 'right', fontSize: 'var(--font-caption)', color: 'var(--color-outline)', fontWeight: 500 }}>
                  {hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}
                </div>
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px 0', alignItems: 'flex-start' }}>
                  {hourEntries.map((entry) => {
                    const itemInfo = exactLookup(entry.generic_resolved);
                    const category = itemInfo?.category || 'medicine';
                    const conflictCount = displayConflicts.filter(c => 
                      (c.itemA.toLowerCase() === entry.generic_resolved.toLowerCase() && c.timeA === entry.scheduled_time) ||
                      (c.itemB.toLowerCase() === entry.generic_resolved.toLowerCase() && c.timeB === entry.scheduled_time)
                    ).length;

                    const itemUI: TimelineItemUI = {
                      id: String(entry.id),
                      name: entry.item_name,
                      scheduledTime: entry.scheduled_time,
                      vehicle: entry.vehicle,
                      category: category as Category,
                      conflicts: conflictCount,
                    };

                    return (
                      <TimelineNode
                        key={entry.id}
                        item={itemUI}
                        onClick={() => entry.id && removeEntry(entry.id)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {timelineEntries.length === 0 && (
          <GlassCard style={{ textAlign: 'center', padding: 48, borderRadius: 'var(--radius-lg)', marginTop: 24 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--color-outline)', opacity: 0.3, marginBottom: 16, display: 'block' }}>timeline</span>
            <h3 style={{ fontSize: 'var(--font-h3)', marginBottom: 8 }}>Your timeline is empty</h3>
            <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)', marginBottom: 24 }}>Add medications, supplements, or food to start tracking interactions.</p>
            <Button variant="primary" icon="add" onClick={() => router.push('/add')}>Add Your First Item</Button>
          </GlassCard>
        )}
      </div>
    </AppShell>
  );
}
