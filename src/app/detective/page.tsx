'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import ConflictAlert from '@/components/ui/ConflictAlert';
import { investigateStomachAche, type DiagnosticResult } from '@/engine/symptomDetective';

export default function DetectivePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [aiResult, setAiResult] = useState<{ likely_causes: Array<{ item: string; mechanism: string; confidence: string }>; recommendations: string[]; severity: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleInvestigate = async () => {
    setIsAnalyzing(true);
    setAiResult(null);
    try {
      const diagnostic = await investigateStomachAche('default');
      setResult(diagnostic);
      if (diagnostic.needs_ai_analysis && diagnostic.recent_items.length > 0) {
        setIsAiLoading(true);
        try {
          const res = await fetch('/api/analyze-symptoms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile_id: 'default',
              symptom: 'stomach ache / gastric discomfort',
              recent_items: diagnostic.recent_items.map(i => ({
                item_name: i.item_name, generic_resolved: i.generic_resolved,
                scheduled_time: i.scheduled_time, vehicle: i.vehicle,
              })),
            }),
          });
          if (res.ok) setAiResult(await res.json());
        } catch { /* AI unavailable */ }
        finally { setIsAiLoading(false); }
      }
    } catch { /* Investigation failed */ }
    finally { setIsAnalyzing(false); }
  };

  const severityColors = { MILD: 'var(--color-warning)', MODERATE: 'var(--color-warning)', SEVERE: 'var(--color-critical)' };

  return (
    <AppShell>
      <div style={{ padding: 'var(--spacing-panel)', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--color-warning)' }}>search</span>
          <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 600 }}>Stomach-Ache Detective</h2>
        </div>
        <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)', marginBottom: 32 }}>
          Analyze what you took in the last 3 hours to find potential causes of discomfort.
        </p>

        <Button variant="primary" icon="search" onClick={handleInvestigate} loading={isAnalyzing} disabled={isAnalyzing}>
          {isAnalyzing ? 'Investigating...' : 'Run Investigation'}
        </Button>

        {result && (
          <div style={{ marginTop: 32 }}>
            {/* Severity Badge */}
            <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, borderRadius: 'var(--radius-sm)', borderLeft: `4px solid ${severityColors[result.severity]}` }}>
              <span className="material-symbols-outlined" style={{ color: severityColors[result.severity] }}>
                {result.severity === 'SEVERE' ? 'error' : result.severity === 'MODERATE' ? 'warning' : 'info'}
              </span>
              <div>
                <p style={{ fontWeight: 600 }}>Severity: {result.severity}</p>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>
                  {result.warnings.length} warning{result.warnings.length !== 1 ? 's' : ''}, {result.interactions.length} interaction{result.interactions.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </GlassCard>

            {/* Recent Items */}
            <h4 style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>schedule</span>
              Last 3 Hours ({result.recent_items.length} items)
            </h4>
            {result.recent_items.length > 0 ? (
              <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
                {result.recent_items.map((item, i) => (
                  <GlassCard key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px var(--spacing-base)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: 'var(--font-caption)', color: 'var(--color-outline)', width: 50 }}>{item.scheduled_time}</span>
                    <span style={{ fontWeight: 500 }}>{item.item_name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>with {item.vehicle}</span>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard style={{ textAlign: 'center', padding: 24, marginBottom: 24 }}>
                <p style={{ color: 'var(--color-on-surface-variant)' }}>No items found in the last 3 hours.</p>
              </GlassCard>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <>
                <h4 style={{ fontWeight: 600, marginBottom: 12 }}>⚠️ Gastric Warnings</h4>
                <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
                  {result.warnings.map((w, i) => (
                    <ConflictAlert key={i} severity={w.confidence === 'HIGH' ? 'critical' : 'warning'}
                      title={w.item_name} mechanism={w.mechanism} resolution={`Confidence: ${w.confidence}`} />
                  ))}
                </div>
              </>
            )}

            {/* Interactions */}
            {result.interactions.length > 0 && (
              <>
                <h4 style={{ fontWeight: 600, marginBottom: 12 }}>🔗 Interactions Detected</h4>
                <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
                  {result.interactions.map((inter, i) => (
                    <ConflictAlert key={i} severity={inter.interaction_type === 'CRITICAL' ? 'critical' : 'warning'}
                      title={`${inter.item_a} + ${inter.item_b}`} mechanism={inter.mechanism} resolution={inter.interaction_type} />
                  ))}
                </div>
              </>
            )}

            {/* AI Analysis */}
            {isAiLoading && (
              <GlassCard style={{ textAlign: 'center', padding: 32, marginTop: 16 }}>
                <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>Running AI clinical synthesis...</p>
              </GlassCard>
            )}
            {aiResult && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>psychology</span>
                  AI Clinical Synthesis
                </h4>
                {aiResult.recommendations?.map((rec, i) => (
                  <GlassCard key={i} style={{ marginBottom: 8, padding: '12px 16px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-primary)' }}>
                    <p style={{ fontSize: 'var(--font-caption)' }}>{rec}</p>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
