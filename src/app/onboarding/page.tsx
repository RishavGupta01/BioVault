'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ScoreRing from '@/components/ui/ScoreRing';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/db/schema';

const COLORS = ['#4f46e5', '#006b5f', '#9333ea', '#dc2626', '#0891b2', '#65a30d'];
const STEPS = ['Welcome', 'Profile', 'Get Started', 'Your Score'];

export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboarded, addProfile } = useAppStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [direction, setDirection] = useState(1);

  const next = () => { setDirection(1); setStep(s => Math.min(s + 1, 3)); };
  const prev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };

  const handleComplete = async () => {
    if (name.trim()) {
      const profile: UserProfile = { id: 'default', name: name.trim(), avatar_color: color, created_at: Date.now() };
      await addProfile(profile);
    }
    setOnboarded(true);
    router.push('/');
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-panel)', fontFamily: 'var(--font-family)' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ width: 48, height: 4, borderRadius: 2, background: i <= step ? 'var(--color-primary)' : 'var(--color-surface-container-high)', transition: 'background 0.3s' }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', minHeight: 400 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ position: 'absolute', width: '100%' }}>
            
            {step === 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 20px 40px rgba(79,70,229,0.3)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#fff' }}>health_and_safety</span>
                </div>
                <h1 style={{ fontSize: 'var(--font-hero)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12, background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BioVault</h1>
                <p style={{ fontSize: 'var(--font-h3)', color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>Local-First Clinical Interaction Engine</p>
                <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-outline)', maxWidth: 360, margin: '0 auto 32px' }}>
                  Track medications, supplements, and food interactions with zero data leaving your device.
                </p>
                <Button variant="primary" onClick={next} icon="arrow_forward">Get Started</Button>
              </div>
            )}

            {step === 1 && (
              <GlassCard style={{ borderRadius: 'var(--radius-lg)', padding: 32 }}>
                <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 600, marginBottom: 8 }}>Create Your Profile</h2>
                <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)', marginBottom: 24 }}>Your data stays on your device. Always.</p>
                <Input value={name} onChange={setName} placeholder="Your name" icon="person" label="Name" />
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 'var(--font-caption)', fontWeight: 600, marginBottom: 8 }}>Pick a color</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setColor(c)} style={{ width: 40, height: 40, borderRadius: '50%', background: c, border: color === c ? '3px solid var(--color-on-surface)' : '2px solid transparent', cursor: 'pointer', transition: 'transform 0.2s', transform: color === c ? 'scale(1.15)' : 'scale(1)' }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                  <Button variant="ghost" onClick={prev}>Back</Button>
                  <Button variant="primary" onClick={next} disabled={!name.trim()}>Continue</Button>
                </div>
              </GlassCard>
            )}

            {step === 2 && (
              <GlassCard style={{ borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--color-primary)', marginBottom: 16, display: 'block' }}>rocket_launch</span>
                <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 600, marginBottom: 8 }}>You&apos;re all set, {name || 'there'}!</h2>
                <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)', marginBottom: 24 }}>
                  Add your first medications, supplements, or meals to see your wellness score and interaction analysis.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
                  {[
                    { icon: 'timeline', label: 'Timeline tracking' },
                    { icon: 'analytics', label: 'Interaction scoring' },
                    { icon: 'search', label: 'Symptom detective' },
                    { icon: 'psychology', label: 'AI resolution' },
                  ].map(f => (
                    <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 20 }}>{f.icon}</span>
                      <span style={{ fontSize: 'var(--font-caption)' }}>{f.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <Button variant="ghost" onClick={prev}>Back</Button>
                  <Button variant="primary" onClick={next}>See Your Score</Button>
                </div>
              </GlassCard>
            )}

            {step === 3 && (
              <div style={{ textAlign: 'center' }}>
                <ScoreRing score={100} size="lg" />
                <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Perfect Score!</h2>
                <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)', marginBottom: 32 }}>
                  Your timeline is clean. Add items to start tracking interactions.
                </p>
                <Button variant="primary" onClick={handleComplete} icon="check">Enter BioVault</Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Skip */}
      <button onClick={handleComplete} style={{ position: 'fixed', top: 24, right: 24, fontSize: 'var(--font-caption)', color: 'var(--color-outline)', background: 'none', border: 'none', cursor: 'pointer' }}>Skip</button>
    </div>
  );
}
