'use client';

import React, { useState, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import VehicleSelector from '@/components/ui/VehicleSelector';
import TimePicker from '@/components/ui/TimePicker';
import { useTimelineStore } from '@/store/useTimelineStore';
import { resolveEntity, isResolutionSuccess } from '@/engine/entityResolver';
import { fuzzySearch } from '@/engine/fuzzyMatcher';
import type { Vehicle } from '@/types/ui';
import type { AIResolvedCacheEntry } from '@/db/schema';
import { useRouter } from 'next/navigation';

export default function AddPage() {
  const router = useRouter();
  const { addEntry } = useTimelineStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ generic_name: string; category: string; score: number }>>([]);
  const [resolvedEntity, setResolvedEntity] = useState<AIResolvedCacheEntry | null>(null);
  const [resolveSource, setResolveSource] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>('water');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setError('');
    if (value.length >= 2) {
      const fuzzyResults = fuzzySearch(value, 8);
      setResults(fuzzyResults.map(r => ({ generic_name: r.item.generic_name, category: r.item.category, score: r.score })));
    } else {
      setResults([]);
    }
  }, []);

  const handleResolve = async (input: string) => {
    setIsResolving(true);
    setError('');
    try {
      const result = await resolveEntity(input);
      if (isResolutionSuccess(result)) {
        setResolvedEntity(result.entry);
        setResolveSource(result.source);
        setQuery(result.entry.generic_name);
        setResults([]);
      } else {
        setError(result.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Resolution failed');
    } finally {
      setIsResolving(false);
    }
  };

  const handleSave = async () => {
    if (!resolvedEntity) return;
    setIsSaving(true);
    try {
      await addEntry({
        profile_id: 'default',
        scheduled_time: selectedTime,
        item_name: query,
        generic_resolved: resolvedEntity.generic_name,
        vehicle: selectedVehicle,
      });
      router.push('/timeline');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
    medicine: { bg: 'var(--color-primary-light)', text: 'var(--color-primary)', icon: 'medication' },
    supplement: { bg: 'var(--color-secondary-container)', text: 'var(--color-secondary)', icon: 'pill' },
    food: { bg: '#FEF3C7', text: '#D97706', icon: 'restaurant' },
  };

  return (
    <AppShell>
      <div style={{ padding: 'var(--spacing-panel)', maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 600, marginBottom: 8 }}>Add to Timeline</h2>
        <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)', marginBottom: 32 }}>Search for a medication, supplement, or food item.</p>

        {/* Search */}
        <Input value={query} onChange={handleSearch} placeholder="e.g. Synthroid 50mcg, Vitamin D3, Coffee..." icon="search" label="Search Item" />

        {/* Fuzzy Results */}
        {results.length > 0 && !resolvedEntity && (
          <GlassCard style={{ marginTop: 8, padding: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {results.map((r, i) => {
              const cat = categoryColors[r.category] || categoryColors.medicine;
              return (
                <div key={i} onClick={() => handleResolve(r.generic_name)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', borderBottom: i < results.length - 1 ? '1px solid var(--color-surface-container)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-container-low)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span className="material-symbols-outlined" style={{ color: cat.text, fontSize: 20 }}>{cat.icon}</span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{r.generic_name.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: 'var(--font-caption)', color: cat.text, background: cat.bg, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{r.category}</span>
                </div>
              );
            })}
          </GlassCard>
        )}

        {isResolving && (
          <GlassCard style={{ marginTop: 16, textAlign: 'center', padding: 24 }}>
            <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>Resolving entity...</p>
          </GlassCard>
        )}

        {error && <p style={{ color: 'var(--color-critical)', fontSize: 'var(--font-caption)', marginTop: 8 }}>{error}</p>}

        {/* Resolved Entity Details */}
        {resolvedEntity && (
          <div style={{ marginTop: 24 }}>
            <GlassCard style={{ borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: categoryColors[resolvedEntity.category]?.bg || 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: categoryColors[resolvedEntity.category]?.text || 'var(--color-primary)' }}>{categoryColors[resolvedEntity.category]?.icon || 'pill'}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--font-body)', fontWeight: 600 }}>{resolvedEntity.generic_name.replace(/_/g, ' ')}</h3>
                  <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>{resolvedEntity.category} • {resolvedEntity.optimal_slot.replace(/_/g, ' ')} • {resolveSource.replace(/_/g, ' ')}</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 'var(--font-caption)', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: resolvedEntity.confidence_level === 'HIGH' ? 'var(--color-secondary-container)' : 'var(--color-surface-container)', color: resolvedEntity.confidence_level === 'HIGH' ? 'var(--color-secondary)' : 'var(--color-on-surface-variant)' }}>{resolvedEntity.confidence_level}</span>
              </div>

              {/* Evidence Sources */}
              {resolvedEntity.evidence_sources.length > 0 && (
                <details style={{ marginTop: 12 }}>
                  <summary style={{ fontSize: 'var(--font-caption)', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>Evidence Sources ({resolvedEntity.evidence_sources.length})</summary>
                  <div style={{ marginTop: 8 }}>
                    {resolvedEntity.evidence_sources.map((src, i) => (
                      <div key={i} style={{ padding: '8px 0', borderTop: i > 0 ? '1px solid var(--color-surface-container)' : 'none' }}>
                        <p style={{ fontSize: 'var(--font-caption)', fontWeight: 600 }}>{src.title}</p>
                        <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>{src.summary}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </GlassCard>

            {/* Time Picker */}
            <div style={{ marginTop: 24 }}>
              <h4 style={{ fontSize: 'var(--font-body)', fontWeight: 600, marginBottom: 12 }}>Scheduled Time</h4>
              <TimePicker value={selectedTime} onChange={setSelectedTime} />
            </div>

            {/* Vehicle Selector */}
            <div style={{ marginTop: 24 }}>
              <h4 style={{ fontSize: 'var(--font-body)', fontWeight: 600, marginBottom: 12 }}>Taken With</h4>
              <VehicleSelector value={selectedVehicle} onChange={setSelectedVehicle} />
            </div>

            {/* Save Button */}
            <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
              <Button variant="primary" onClick={handleSave} disabled={isSaving} icon="check" loading={isSaving}>Add to Timeline</Button>
              <Button variant="ghost" onClick={() => { setResolvedEntity(null); setQuery(''); setResults([]); }}>Clear</Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
