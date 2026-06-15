'use client';

import React, { useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import GlassCard from '@/components/ui/GlassCard';
import ScoreRing from '@/components/ui/ScoreRing';
import Button from '@/components/ui/Button';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';

function InsightCard({ borderColor, icon, iconColor, title, text, actionText, actionColor, onAction }: {
  borderColor: string; icon: string; iconColor: string; title: string; text: string;
  actionText?: string; actionColor?: string; onAction?: () => void;
}) {
  return (
    <GlassCard className="insight-card" style={{ borderLeft: `4px solid ${borderColor}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, padding: 8, opacity: 0.08 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 48 }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {iconColor && <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: 18 }}>{icon}</span>}
        <h4 style={{ fontSize: 'var(--font-body)', fontWeight: 600 }}>{title}</h4>
      </div>
      <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginBottom: actionText ? 12 : 0 }}>{text}</p>
      {actionText && <button onClick={onAction} style={{ color: actionColor || 'var(--color-secondary)', fontSize: 'var(--font-caption)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{actionText}</button>}
    </GlassCard>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { wellnessScore, timelineEntries, conflicts, boosts, loadEntries } = useTimelineStore();
  const { loadProfiles, activeProfile } = useAppStore();

  useEffect(() => {
    loadProfiles();
    loadEntries('default');
  }, [loadProfiles, loadEntries]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = activeProfile?.name || 'there';
  const upcomingItems = timelineEntries.slice(0, 4);

  // Right Panel — Insights
  const rightPanel = (
    <div style={{ padding: 'var(--spacing-panel)' }}>
      <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 600, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>lightbulb</span> Insights
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <InsightCard borderColor="var(--color-secondary)" icon="schedule" iconColor="" title="Best hour for absorption"
          text="Based on your timeline, taking Iron supplements at 3:00 PM yields optimal results."
          actionText="Apply to Timeline" actionColor="var(--color-secondary)" onAction={() => router.push('/timeline')} />
        {conflicts.length > 0 && (
          <InsightCard borderColor="var(--color-warning)" icon="warning" iconColor="var(--color-warning)" title="Potential conflict detected"
            text={`${conflicts.length} interaction${conflicts.length > 1 ? 's' : ''} found in your timeline that may reduce effectiveness.`}
            actionText="View Details" actionColor="var(--color-warning)" onAction={() => router.push('/score')} />
        )}
        {boosts.length > 0 && (
          <InsightCard borderColor="var(--color-primary)" icon="trending_up" iconColor="var(--color-primary)" title="Synergy detected"
            text={`${boosts.length} beneficial combination${boosts.length > 1 ? 's' : ''} found — great scheduling!`} />
        )}
        <InsightCard borderColor="var(--color-primary)" icon="local_fire_department" iconColor="" title="Consistency Streak"
          text="You've logged your vitals for 5 consecutive days. Keep it up!" />
      </div>
    </div>
  );

  return (
    <AppShell rightPanel={rightPanel}>
      <div style={{ padding: 'var(--spacing-panel)', maxWidth: 900 }}>
        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8, color: 'var(--color-on-surface)' }}>
            {getGreeting()}, {userName}
          </h2>
          <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)' }}>
            Here is your wellness overview for today.
          </p>
        </header>

        {/* Score + Timeline Preview Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-panel)', marginBottom: 32 }}>
          {/* Score Ring Card */}
          <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 500, position: 'absolute', top: 24, left: 24, color: 'var(--color-on-surface)' }}>Today&apos;s Score</h3>
            <div style={{ marginTop: 32 }}>
              <ScoreRing score={wellnessScore} size="md" />
            </div>
          </GlassCard>

          {/* Timeline Preview Card */}
          <GlassCard style={{ borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 500 }}>Timeline Preview</h3>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', cursor: 'pointer' }} onClick={() => router.push('/timeline')}>more_horiz</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-node-gap)', position: 'relative' }}>
              {/* Connecting line */}
              <div style={{ position: 'absolute', left: 24, top: 16, bottom: 16, width: 2, background: 'var(--color-surface-container-high)', zIndex: 0 }} />
              
              {upcomingItems.length > 0 ? upcomingItems.map((item, i) => {
                const icons: Record<string, string> = { medicine: 'medication', supplement: 'pill', food: 'restaurant' };
                const colors: Record<string, string> = { medicine: 'var(--color-primary)', supplement: 'var(--color-secondary)', food: 'var(--color-warning)' };
                const bgs: Record<string, string> = { medicine: 'var(--color-primary-light)', supplement: 'var(--color-secondary-container)', food: '#FEF3C7' };
                // Determine category from the generic resolved name (simplified)
                const cat = 'medicine';
                return (
                  <div key={item.id || i} style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1, padding: 12, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-container-low)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: bgs[cat], display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors[cat], flexShrink: 0 }}>
                      <span className="material-symbols-outlined">{icons[cat]}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 'var(--font-body)', fontWeight: 600 }}>{item.item_name}</h4>
                      <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>{item.scheduled_time} • {item.vehicle}</p>
                    </div>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-success)' }}>check_circle</span>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-on-surface-variant)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3, marginBottom: 8, display: 'block' }}>add_circle</span>
                  <p style={{ fontSize: 'var(--font-caption)' }}>No items yet. Add your first entry!</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, paddingBottom: 80 }}>
          {[
            { icon: 'local_drink', label: 'Water', href: '/add' },
            { icon: 'restaurant_menu', label: 'Meal', href: '/add' },
            { icon: 'pill', label: 'Meds', href: '/add' },
            { icon: 'search', label: 'Detective', href: '/detective' },
          ].map((action) => (
            <GlassCard key={action.label} onClick={() => router.push(action.href)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 28 }}>{action.icon}</span>
              <span style={{ fontSize: 'var(--font-caption)', fontWeight: 500 }}>{action.label}</span>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
