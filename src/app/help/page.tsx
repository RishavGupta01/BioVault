'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import GlassCard from '@/components/ui/GlassCard';

interface HelpSection {
  title: string;
  icon: string;
  description: string;
  points: string[];
}

const BIOVAULT_FUNCTIONS: HelpSection[] = [
  {
    title: 'Home / Onboarding Dashboard',
    icon: 'grid_view',
    description: 'Your central wellness control center. Provides an at-a-glance safety summary and quick actions.',
    points: [
      'Visualizes your current wellness safety score (S) from 0 to 100.',
      'Displays a summary of active conflicts (warnings/clashes) and synergistic boosts.',
      'Shows your next scheduled intake timeline node for rapid reference.'
    ]
  },
  {
    title: 'Timeline (Temporal Planner)',
    icon: 'timeline',
    description: 'A drag-and-drop chronological scheduler where you manage your daily health regimen.',
    points: [
      'Lists scheduled items (medications, supplements, foods) as visual timeline nodes.',
      'Enables dragging and adjusting ingestion times (represented as minutes past midnight).',
      'Uses a sliding evaluation window scan (O(N) bounds) to evaluate timing conflicts (e.g., separating Calcium from Thyroid medication by 4 hours).'
    ]
  },
  {
    title: 'Wellness Score Details',
    icon: 'analytics',
    description: 'A deep clinical safety compiler detailing how your score is calculated.',
    points: [
      'Breaks down the absolute safety score (S) across four distinct clinical vectors.',
      'Calculates Absorption chelation penalties (I_abs, e.g. calcium binding to antibiotics).',
      'Calculates Critical contraindications (I_crit, e.g. life-threatening combos).',
      'Calculates Gastric irritants (I_gastric, e.g. NSAIDs on empty stomach) and Cumulative chemical load (I_cum).'
    ]
  },
  {
    title: 'Add / Intake Intake Logger',
    icon: 'add_circle',
    description: 'A rapid lexical search panel to add new items to your daily profile timeline.',
    points: [
      'Employs Fuse.js fuzzy search matching across 1,300+ clinical medications, supplements, and dietary items.',
      'Includes options to choose scheduled time, dosage strength, and drinking vehicles.',
      'Resolves items locally in <2ms, bypassing the cloud to maintain privacy.'
    ]
  },
  {
    title: 'Clinical Symptom Detective',
    icon: 'search',
    description: 'An acute reverse-diagnostic tool that analyzes recent intakes to find symptom triggers.',
    points: [
      'Queries all timeline entries from the previous 180 minutes.',
      'Checks for dangerous local combinations (e.g. Ibuprofen + Alcohol) or known gastric irritants.',
      'Invokes the edge AI pipeline to run clinical synthesis on custom symptoms (e.g., headache, palpitations, dizziness).'
    ]
  },
  {
    title: 'Clinical Entity Resolver',
    icon: 'psychology',
    description: 'A cache management pipeline that tracks how new/unlisted items are analyzed.',
    points: [
      'Displays resolved cache records in IndexedDB to verify confidence levels and evidence citations.',
      'Permits purging cached entries to force an updated analysis.',
      'Demonstrates the 5-step cascade protocol (Fuzzy Match → IndexedDB Cache → Gemini Edge AI → Zod Shield → Commit).'
    ]
  },
  {
    title: 'Profiles (Family switcher)',
    icon: 'group',
    description: 'A household compartmentalization panel to manage multiple profiles.',
    points: [
      'Enables creating isolated timelines for different family members or clients.',
      'Maintains complete database privacy boundaries between profiles.',
      'Applies distinct safety scanning and clinical audits for each profile.'
    ]
  }
];

export default function HelpPage() {
  return (
    <AppShell>
      <div style={{ padding: 'var(--spacing-panel)', maxWidth: 850, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--color-primary)' }}>
            help
          </span>
          <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 600 }}>Help & Documentation</h2>
        </div>
        <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)', marginBottom: 32 }}>
          Learn about BioVault features, how interaction safety scores are computed, and why your choice of drinking vehicle matters.
        </p>

        <div style={{ display: 'grid', gap: 32 }}>

          {/* Section 1: Page Functions */}
          <div>
            <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 600, marginBottom: 16, borderBottom: '1px solid var(--color-outline)', paddingBottom: 8 }}>
              Website Features & Functions
            </h3>
            <div style={{ display: 'grid', gap: 16 }}>
              {BIOVAULT_FUNCTIONS.map((section, idx) => (
                <GlassCard key={idx} style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>{section.icon}</span>
                    <h4 style={{ fontWeight: 600, fontSize: 'var(--font-body)' }}>{section.title}</h4>
                  </div>
                  <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginBottom: 12 }}>
                    {section.description}
                  </p>
                  <ul style={{ paddingLeft: 18, fontSize: 'var(--font-caption)', display: 'grid', gap: 6 }}>
                    {section.points.map((p, i) => (
                      <li key={i} style={{ color: 'var(--color-on-surface)' }}>{p}</li>
                    ))}
                  </ul>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Section 2: Ingestion Vehicles */}
          <div>
            <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 600, marginBottom: 16, borderBottom: '1px solid var(--color-outline)', paddingBottom: 8 }}>
              The Impact of Drinking Vehicles
            </h3>
            <GlassCard style={{ padding: 24, display: 'grid', gap: 16 }}>
              <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>
                When adding an item, you can select the vehicle you take it with. The clinical engine evaluates these vehicles because they chemically alter bioavailability:
              </p>
              
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ paddingLeft: 12, borderLeft: '3px solid var(--color-secondary)' }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-caption)' }}>🥛 Milk / Dairy</p>
                  <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
                    High calcium content binds to tetracyclines (e.g. Doxycycline) and fluoroquinolones (e.g. Ciprofloxacin), forming insoluble chelates that pass through the GI tract without being absorbed.
                  </p>
                </div>
                
                <div style={{ paddingLeft: 12, borderLeft: '3px solid var(--color-warning)' }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-caption)' }}>☕ Coffee / Caffeine</p>
                  <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
                    Stimulates gastric acid production (irritating the stomach lining when taken with NSAIDs like Ibuprofen), binds to zinc/iron supplements (reducing absorption), and directly counteracts melatonin.
                  </p>
                </div>

                <div style={{ paddingLeft: 12, borderLeft: '3px solid var(--color-primary)' }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-caption)' }}>🍊 Juice (Grapefruit / Apple / Orange)</p>
                  <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
                    Grapefruit juice inhibits the CYP3A4 enzyme, leading to dangerous accumulation of statins and CCBs. Acidic juices can reduce antihistamine (Fexofenadine) absorption by 40% by blocking OATP1A2 transporters.
                  </p>
                </div>

                <div style={{ paddingLeft: 12, borderLeft: '3px solid var(--color-critical)' }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-caption)' }}>🍷 Alcohol</p>
                  <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
                    Synergistically damages the stomach lining when taken with NSAIDs (inducing micro-bleeding), increases liver toxicity when taken with Acetaminophen, and causes severe drowsiness with CNS sedatives.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
