'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ProfileAvatar from '@/components/ui/ProfileAvatar';
import { useAppStore } from '@/store/useAppStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import type { UserProfile } from '@/db/schema';

const AVATAR_COLORS = ['#4f46e5', '#006b5f', '#7e3000', '#9333ea', '#dc2626', '#0891b2', '#65a30d', '#c2410c'];

export default function ProfilesPage() {
  const { profiles, activeProfile, loadProfiles, addProfile, removeProfile, setActiveProfile } = useAppStore();
  const { setActiveProfile: setTimelineProfile } = useTimelineStore();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(AVATAR_COLORS[0]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const profile: UserProfile = {
      id: `profile_${Date.now()}`,
      name: newName.trim(),
      avatar_color: newColor,
      created_at: Date.now(),
    };
    await addProfile(profile);
    setNewName('');
    setShowModal(false);
  };

  const handleSwitch = (id: string) => {
    setActiveProfile(id);
    setTimelineProfile(id);
  };

  return (
    <AppShell>
      <div style={{ padding: 'var(--spacing-panel)', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 600 }}>Family Profiles</h2>
            <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)' }}>Manage individual health timelines</p>
          </div>
          <Button variant="primary" icon="person_add" onClick={() => setShowModal(true)}>Add Profile</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {profiles.map((profile) => (
            <GlassCard key={profile.id} variant={activeProfile?.id === profile.id ? 'selected' : 'default'}
              onClick={() => handleSwitch(profile.id)}
              style={{ borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}>
                <ProfileAvatar name={profile.name} color={profile.avatar_color} size="lg" />
                <h3 style={{ fontSize: 'var(--font-body)', fontWeight: 600, marginTop: 12 }}>{profile.name}</h3>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)' }}>
                  {activeProfile?.id === profile.id ? '● Active' : 'Tap to switch'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-outline)', marginTop: 8 }}>
                  Created {new Date(profile.created_at).toLocaleDateString()}
                </p>
                {profile.id !== 'default' && (
                  <button onClick={(e) => { e.stopPropagation(); removeProfile(profile.id); }}
                    style={{ marginTop: 12, fontSize: 'var(--font-caption)', color: 'var(--color-critical)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Remove
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Add Profile Modal */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowModal(false)}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }} />
            <GlassCard variant="elevated" style={{ position: 'relative', width: 400, maxWidth: '90vw', borderRadius: 'var(--radius-lg)', padding: 32 }}
              onClick={undefined}>
              <div onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 600, marginBottom: 24 }}>New Profile</h3>
                <Input value={newName} onChange={setNewName} placeholder="Name" icon="person" label="Profile Name" />
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 'var(--font-caption)', fontWeight: 600, marginBottom: 8 }}>Avatar Color</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {AVATAR_COLORS.map((color) => (
                      <button key={color} onClick={() => setNewColor(color)}
                        style={{ width: 36, height: 36, borderRadius: '50%', background: color, border: newColor === color ? '3px solid var(--color-on-surface)' : '2px solid transparent', cursor: 'pointer', transition: 'transform 0.15s' }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <Button variant="primary" onClick={handleAdd} icon="check">Create</Button>
                  <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </AppShell>
  );
}
