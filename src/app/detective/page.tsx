'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import ConflictAlert from '@/components/ui/ConflictAlert';
import Input from '@/components/ui/Input';
import { investigateSymptom, type DiagnosticResult } from '@/engine/symptomDetective';
import { useTimelineStore } from '@/store/useTimelineStore';

const COMMON_SYMPTOMS = [
  { value: 'Stomach ache / Gastric discomfort', label: '🤢 Stomach Ache / Gastric Discomfort' },
  { value: 'Headache / Migraine', label: '🤕 Headache / Migraine' },
  { value: 'Dizziness / Vertigo / Lightheadedness', label: '🌀 Dizziness / Vertigo' },
  { value: 'Drowsiness / Extreme fatigue', label: '😴 Drowsiness / Extreme Fatigue' },
  { value: 'Heart palpitations / Rapid heartbeat', label: '💓 Heart Palpitations / Tachycardia' },
  { value: 'Nausea / Vomiting', label: '🤮 Nausea / Vomiting' },
  { value: 'Skin rash / Hives / Itching', label: '🔴 Skin Rash / Hives / Itching' },
  { value: 'custom', label: '✍️ Other / Custom Symptom...' }
];

export default function DetectivePage() {
  const activeProfileId = useTimelineStore(state => state.activeProfileId);
  const [selectedSymptom, setSelectedSymptom] = useState(COMMON_SYMPTOMS[0].value);
  const [customSymptom, setCustomSymptom] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [aiResult, setAiResult] = useState<{
    likely_causes: Array<{ item: string; mechanism: string; confidence: string }>;
    recommendations: string[];
    severity: string;
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>('');

  const getActiveSymptomText = () => {
    if (selectedSymptom === 'custom') {
      return customSymptom.trim() || 'Custom Symptom';
    }
    return selectedSymptom;
  };

  const handleInvestigate = async () => {
    setIsAnalyzing(true);
    setAiResult(null);
    setAiError('');
    setResult(null);
    const symptomText = getActiveSymptomText();

    try {
      const diagnostic = await investigateSymptom(activeProfileId, symptomText);
      setResult(diagnostic);

      if (diagnostic.needs_ai_analysis && diagnostic.recent_items.length > 0) {
        setIsAiLoading(true);
        setAiError('');
        try {
          const res = await fetch('/api/analyze-symptoms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile_id: activeProfileId,
              symptom: symptomText,
              recent_items: diagnostic.recent_items.map(i => ({
                item_name: i.item_name,
                generic_resolved: i.generic_resolved,
                scheduled_time: i.scheduled_time,
                vehicle: i.vehicle,
              })),
            }),
          });
          if (res.ok) {
            setAiResult(await res.json());
          } else {
            const errData = await res.json().catch(() => ({}));
            setAiError(errData.error 
              ? `${errData.error}${errData.details ? `: ${errData.details}` : ''}` 
              : `AI Analysis returned status ${res.status}`);
          }
        } catch (err) {
          console.error("AI Clinical analysis failed:", err);
          setAiError(err instanceof Error ? err.message : 'AI Clinical analysis failed');
        } finally {
          setIsAiLoading(false);
        }
      }
    } catch (err) {
      console.error("Local investigation failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const severityColors = { 
    MILD: 'var(--color-success)', 
    MODERATE: 'var(--color-warning)', 
    SEVERE: 'var(--color-critical)' 
  };

  return (
    <AppShell>
      <div style={{ padding: 'var(--spacing-panel)', maxWidth: 800, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--color-primary)' }}>
            detector_status
          </span>
          <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 600 }}>Clinical Symptom Detective</h2>
        </div>
        <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)', marginBottom: 24 }}>
          Input your current symptoms and we will analyze all medication, supplement, and dietary items consumed in the last 3 hours to locate pharmacological triggers, local conflicts, or side-effect correlations.
        </p>

        {/* Form controls */}
        <GlassCard style={{ padding: '24px', marginBottom: 32, display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontSize: 'var(--font-caption)', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
              What symptom are you experiencing?
            </label>
            <select
              value={selectedSymptom}
              onChange={(e) => setSelectedSymptom(e.target.value)}
              style={{
                width: '100%',
                padding: '12px var(--spacing-base)',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-outline)',
                color: 'var(--color-on-surface)',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: 'var(--font-body)'
              }}
            >
              {COMMON_SYMPTOMS.map((sym) => (
                <option key={sym.value} value={sym.value} style={{ background: '#1c1917', color: '#fff' }}>
                  {sym.label}
                </option>
              ))}
            </select>
          </div>

          {selectedSymptom === 'custom' && (
            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: 'var(--font-caption)', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
                Specify your symptom
              </label>
              <Input
                type="text"
                placeholder="e.g., metallic taste, muscle spasms, heart palpitations"
                value={customSymptom}
                onChange={setCustomSymptom}
              />
            </div>
          )}

          <Button 
            variant="primary" 
            icon="search" 
            onClick={handleInvestigate} 
            loading={isAnalyzing} 
            disabled={isAnalyzing || (selectedSymptom === 'custom' && !customSymptom.trim())}
            style={{ marginTop: 8 }}
          >
            {isAnalyzing ? 'Analyzing Clinical Timeline...' : 'Analyze Timeline context'}
          </Button>
        </GlassCard>

        {/* Results Area */}
        {result && (
          <div style={{ display: 'grid', gap: 24 }}>
            
            {/* Severity Card */}
            <GlassCard style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 16, 
              borderRadius: 'var(--radius-sm)', 
              borderLeft: `5px solid ${severityColors[result.severity] || 'var(--color-primary)'}`,
              padding: '16px 20px'
            }}>
              <span className="material-symbols-outlined" style={{ 
                color: severityColors[result.severity] || 'var(--color-primary)',
                fontSize: 28 
              }}>
                {result.severity === 'SEVERE' ? 'error' : result.severity === 'MODERATE' ? 'warning' : 'info'}
              </span>
              <div>
                <p style={{ fontWeight: 600, fontSize: 'var(--font-body)' }}>Severity Status: {result.severity}</p>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>
                  Evaluated {result.recent_items.length} recent intakes. Found {result.warnings.length} local warnings and {result.interactions.length} combination clashes.
                </p>
              </div>
            </GlassCard>

            {/* Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              
              {/* Left Column: Intakes & Local warnings */}
              <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
                
                {/* Last 3 hours intake list */}
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>schedule</span>
                    Intakes (Last 3 Hours)
                  </h4>
                  {result.recent_items.length > 0 ? (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {result.recent_items.map((item, i) => (
                        <GlassCard key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: 'var(--font-caption)', color: 'var(--color-outline)', width: 45 }}>{item.scheduled_time}</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 500 }}>{item.item_name}</span>
                            <span style={{ fontSize: 'var(--font-small)', color: 'var(--color-on-surface-variant)' }}>resolved as {item.generic_resolved}</span>
                          </div>
                          <span style={{ marginLeft: 'auto', fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>via {item.vehicle}</span>
                        </GlassCard>
                      ))}
                    </div>
                  ) : (
                    <GlassCard style={{ textAlign: 'center', padding: 24 }}>
                      <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--font-caption)' }}>No medications, supplements, or foods taken in the last 3 hours.</p>
                    </GlassCard>
                  )}
                </div>

                {/* Local Gastric Warnings */}
                {result.warnings.length > 0 && (
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-warning)' }}>warning</span>
                      Gastric Warnings
                    </h4>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {result.warnings.map((w, i) => (
                        <ConflictAlert 
                          key={i} 
                          severity={w.confidence === 'HIGH' ? 'critical' : 'warning'}
                          title={w.item_name} 
                          mechanism={w.mechanism} 
                          resolution={`Time: ${w.scheduled_time} | Confidence: ${w.confidence}`} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Local Interactions */}
                {result.interactions.length > 0 && (
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-critical)' }}>dangerous</span>
                      Dangerous Combinations
                    </h4>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {result.interactions.map((inter, i) => (
                        <ConflictAlert 
                          key={i} 
                          severity={inter.interaction_type === 'CRITICAL' ? 'critical' : 'warning'}
                          title={`${inter.item_a} + ${inter.item_b}`} 
                          mechanism={inter.mechanism} 
                          resolution={`Level: ${inter.interaction_type}`} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: AI Analysis */}
              <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
                
                {/* AI clinical loading */}
                {isAiLoading && (
                  <GlassCard style={{ textAlign: 'center', padding: 40 }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
                    <p style={{ fontWeight: 500 }}>Executing AI Clinical Synthesis...</p>
                    <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginTop: 8 }}>
                      Cross-referencing timeline against PubMed & FDA pharmacological database for "{getActiveSymptomText()}" correlations.
                    </p>
                  </GlassCard>
                )}

                {/* AI clinical error */}
                {aiError && (
                  <GlassCard style={{ padding: 20, borderLeft: '4px solid var(--color-critical)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-critical)' }}>
                      <span className="material-symbols-outlined">error</span>
                      <p style={{ fontWeight: 600 }}>AI Clinical Analysis Unavailable</p>
                    </div>
                    <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>
                      {aiError}
                    </p>
                    <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-outline)', marginTop: 12, lineHeight: 1.4 }}>
                      Please ensure your API keys (`GEMINI_API_KEY` or `GROK_API_KEY`) are correctly set in your environment configuration.
                    </p>
                  </GlassCard>
                )}

                {/* AI clinical analysis output */}
                {aiResult && (
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>psychology</span>
                      AI Clinical Synthesis
                    </h4>
                    <div style={{ display: 'grid', gap: 12 }}>
                      
                      {/* Clinical recommendations */}
                      {aiResult.recommendations && aiResult.recommendations.length > 0 && (
                        <GlassCard style={{ padding: 16 }}>
                          <p style={{ fontWeight: 600, fontSize: 'var(--font-caption)', color: 'var(--color-primary)', marginBottom: 10 }}>
                            Actionable Guidance:
                          </p>
                          <ul style={{ paddingLeft: 18, fontSize: 'var(--font-caption)', display: 'grid', gap: 8 }}>
                            {aiResult.recommendations.map((rec, i) => (
                              <li key={i} style={{ color: 'var(--color-on-surface)' }}>{rec}</li>
                            ))}
                          </ul>
                        </GlassCard>
                      )}

                      {/* Clinical mechanisms */}
                      {aiResult.likely_causes && aiResult.likely_causes.length > 0 ? (
                        <div style={{ display: 'grid', gap: 8 }}>
                          <p style={{ fontWeight: 600, fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', margin: '4px 0' }}>
                            Pharmacological Mechanisms Detected:
                          </p>
                          {aiResult.likely_causes.map((cause, i) => (
                            <GlassCard key={i} style={{ 
                              padding: 14, 
                              borderRadius: 'var(--radius-sm)', 
                              borderLeft: `3px solid ${cause.confidence === 'HIGH' ? 'var(--color-critical)' : 'var(--color-warning)'}`
                            }}>
                              <p style={{ fontWeight: 600, fontSize: 'var(--font-body)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{cause.item}</span>
                                <span style={{ 
                                  fontSize: 'var(--font-small)', 
                                  color: cause.confidence === 'HIGH' ? 'var(--color-critical)' : 'var(--color-warning)'
                                }}>
                                  {cause.confidence} Confidence
                                </span>
                              </p>
                              <p style={{ 
                                fontSize: 'var(--font-caption)', 
                                color: 'var(--color-on-surface-variant)', 
                                marginTop: 6,
                                lineHeight: '1.4'
                              }}>
                                {cause.mechanism}
                              </p>
                            </GlassCard>
                          ))}
                        </div>
                      ) : (
                        <GlassCard style={{ padding: 16, textAlign: 'center' }}>
                          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--font-caption)' }}>
                            No specific pharmacological side-effect correlations identified.
                          </p>
                        </GlassCard>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
