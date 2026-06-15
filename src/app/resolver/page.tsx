'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { resolveEntity, isResolutionSuccess, type ResolutionResult } from '@/engine/entityResolver';
import { db } from '@/db/schema';

const PIPELINE_STEPS = ['Fuzzy Match', 'Cache Lookup', 'Edge API', 'Zod Validate', 'DB Index'];

export default function ResolverPage() {
  const [query, setQuery] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [result, setResult] = useState<ResolutionResult | null>(null);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(-1);
  const [cacheCount, setCacheCount] = useState(0);

  const loadCacheCount = async () => {
    try { setCacheCount(await db.ai_resolved_cache.count()); } catch { /* empty */ }
  };

  const handleResolve = async () => {
    if (!query.trim()) return;
    setIsResolving(true);
    setError('');
    setResult(null);
    setActiveStep(0);

    // Simulate pipeline steps
    const stepDelay = (step: number) => new Promise<void>(r => { setActiveStep(step); setTimeout(r, 300); });
    await stepDelay(0);
    
    try {
      const res = await resolveEntity(query);
      if (isResolutionSuccess(res)) {
        const sourceStep = res.source === 'fuzzy_match' ? 0 : res.source === 'cache_hit' ? 1 : 2;
        for (let i = 1; i <= Math.max(sourceStep, 3); i++) await stepDelay(i);
        await stepDelay(4);
        setResult(res);
      } else {
        setError(res.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Resolution failed');
    } finally {
      setIsResolving(false);
      setActiveStep(-1);
      loadCacheCount();
    }
  };

  const clearCache = async () => {
    try {
      await db.ai_resolved_cache.clear();
      setCacheCount(0);
    } catch { /* empty */ }
  };

  React.useEffect(() => { loadCacheCount(); }, []);

  return (
    <AppShell>
      <div style={{ padding: 'var(--spacing-panel)', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--color-primary)' }}>psychology</span>
          <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 600 }}>Clinical Resolver</h2>
        </div>
        <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)', marginBottom: 32 }}>
          5-step entity resolution: Fuzzy → Cache → Edge API → Validate → Index
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <div style={{ flex: 1 }}><Input value={query} onChange={setQuery} placeholder="Type any medication, supplement, or food..." icon="search" /></div>
          <Button variant="primary" onClick={handleResolve} loading={isResolving} disabled={isResolving}>Resolve</Button>
        </div>

        {/* Pipeline Status */}
        <GlassCard style={{ marginBottom: 24, borderRadius: 'var(--radius-lg)' }}>
          <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Resolution Pipeline</h4>
          <div style={{ display: 'flex', gap: 4 }}>
            {PIPELINE_STEPS.map((step, i) => {
              let status: 'idle' | 'active' | 'done' | 'source' = 'idle';
              if (activeStep === i) status = 'active';
              else if (activeStep > i) status = 'done';
              if (result && ((result.source === 'fuzzy_match' && i === 0) || (result.source === 'cache_hit' && i === 1) || (result.source === 'edge_api' && i === 2))) status = 'source';

              const colors = { idle: 'var(--color-surface-container)', active: 'var(--color-warning)', done: 'var(--color-surface-container-high)', source: 'var(--color-secondary)' };
              const textColors = { idle: 'var(--color-on-surface-variant)', active: '#FFF', done: 'var(--color-on-surface-variant)', source: '#FFF' };

              return (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '10px 4px', borderRadius: 'var(--radius-sm)', background: colors[status], color: textColors[status], fontSize: 11, fontWeight: 600, transition: 'all 0.3s ease' }}>
                  {status === 'active' && '⏳ '}{status === 'source' && '✓ '}{step}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {error && <p style={{ color: 'var(--color-critical)', fontSize: 'var(--font-caption)', marginBottom: 16 }}>{error}</p>}

        {/* Resolved Entity */}
        {result && (
          <GlassCard style={{ borderRadius: 'var(--radius-lg)', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 600 }}>{result.entry.generic_name.replace(/_/g, ' ')}</h3>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>
                  {result.entry.category} • {result.entry.optimal_slot.replace(/_/g, ' ')} • {result.entry.requires_food ? 'Take with food' : 'Can take on empty stomach'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 600 }}>{result.source.replace(/_/g, ' ')}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: result.entry.confidence_level === 'HIGH' ? 'var(--color-secondary-container)' : 'var(--color-surface-container)', color: result.entry.confidence_level === 'HIGH' ? 'var(--color-secondary)' : 'var(--color-on-surface-variant)', fontWeight: 600 }}>{result.entry.confidence_level}</span>
              </div>
            </div>
            <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-outline)' }}>Resolved in {result.latencyMs}ms</p>
            {result.entry.evidence_sources.length > 0 && (
              <div style={{ marginTop: 16, borderTop: '1px solid var(--color-surface-container)', paddingTop: 12 }}>
                <h4 style={{ fontSize: 'var(--font-caption)', fontWeight: 700, marginBottom: 8 }}>Evidence Sources</h4>
                {result.entry.evidence_sources.map((src, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 'var(--font-caption)', fontWeight: 600 }}>{src.title}</p>
                    <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>{src.summary}</p>
                    {src.url && <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--color-primary)' }}>{src.url}</a>}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* Cache Management */}
        <GlassCard style={{ borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontWeight: 600 }}>Resolution Cache</h4>
              <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>{cacheCount} entries cached in IndexedDB</p>
            </div>
            <Button variant="ghost" onClick={clearCache} icon="delete">Clear Cache</Button>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
