'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { db } from '@/db/schema';
import { useTimelineStore } from '@/store/useTimelineStore';

export default function SettingsPage() {
  const activeProfileId = useTimelineStore(state => state.activeProfileId);
  const [timelineCount, setTimelineCount] = useState(0);
  const [cacheCount, setCacheCount] = useState(0);
  const [profileCount, setProfileCount] = useState(0);
  const [isWiping, setIsWiping] = useState(false);
  const [wiped, setWiped] = useState(false);

  const [geminiKey, setGeminiKey] = useState('');
  const [grokKey, setGrokKey] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showGrok, setShowGrok] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadStats() {
      const tc = await db.user_timeline.count();
      const cc = await db.ai_resolved_cache.count();
      const pc = await db.user_profiles.count();
      setTimelineCount(tc);
      setCacheCount(cc);
      setProfileCount(pc);
    }
    loadStats();
  }, [wiped]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGeminiKey(localStorage.getItem('user_gemini_api_key') || '');
      setGrokKey(localStorage.getItem('user_grok_api_key') || '');
    }
  }, []);

  const handleSaveKeys = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_gemini_api_key', geminiKey.trim());
      localStorage.setItem('user_grok_api_key', grokKey.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleClearKeys = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_gemini_api_key');
      localStorage.removeItem('user_grok_api_key');
      setGeminiKey('');
      setGrokKey('');
      alert("API keys successfully removed from your local storage.");
    }
  };

  // Export local DB as JSON
  const handleExport = async () => {
    try {
      const timeline = await db.user_timeline.toArray();
      const profiles = await db.user_profiles.toArray();
      const cache = await db.ai_resolved_cache.toArray();

      const exportData = {
        version: 1,
        exported_at: Date.now(),
        data: {
          timeline,
          profiles,
          cache
        }
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `biovault_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export database: " + (err instanceof Error ? err.message : err));
    }
  };

  // Import local DB from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.version || !json.data) {
          throw new Error("Invalid backup file format.");
        }

        const { timeline, profiles, cache } = json.data;

        // Clear existing tables
        await Promise.all([
          db.user_timeline.clear(),
          db.user_profiles.clear(),
          db.ai_resolved_cache.clear()
        ]);

        // Bulk insert imported data
        if (profiles && profiles.length > 0) {
          await db.user_profiles.bulkAdd(profiles);
        }
        if (timeline && timeline.length > 0) {
          await db.user_timeline.bulkAdd(timeline);
        }
        if (cache && cache.length > 0) {
          await db.ai_resolved_cache.bulkAdd(cache);
        }

        alert("Database successfully imported! Reloading the page...");
        window.location.reload();
      } catch (err) {
        alert("Import failed: " + (err instanceof Error ? err.message : err));
      }
    };
    reader.readAsText(file);
  };

  // Clear/Reset App data (Local Sign Out)
  const handleReset = async () => {
    if (!confirm("WARNING: This will permanently delete all your profiles, scheduled timeline entries, and cache from this browser. This action cannot be undone.\n\nAre you sure you want to proceed?")) {
      return;
    }

    setIsWiping(true);
    try {
      // Clear all IndexedDB tables
      await Promise.all([
        db.user_timeline.clear(),
        db.user_profiles.clear(),
        db.ai_resolved_cache.clear()
      ]);
      // Clear localStorage
      localStorage.clear();
      setWiped(true);
      alert("All local data has been securely deleted. Redirecting to onboarding...");
      window.location.href = '/onboarding';
    } catch (err) {
      alert("Wipe failed: " + (err instanceof Error ? err.message : err));
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <AppShell>
      <div style={{ padding: 'var(--spacing-panel)', maxWidth: 700, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--color-primary)' }}>
            settings
          </span>
          <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 600 }}>System Settings</h2>
        </div>
        <p style={{ fontSize: 'var(--font-body)', color: 'var(--color-on-surface-variant)', marginBottom: 24 }}>
          Manage your local client database, export backup profiles, import data vectors, or securely wipe all private records.
        </p>

        <div style={{ display: 'grid', gap: 24 }}>
          
          {/* Privacy Note */}
          <GlassCard style={{ padding: 20, borderLeft: '4px solid var(--color-success)' }}>
            <h4 style={{ fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-success)', fontSize: 20 }}>security</span>
              Zero-Cloud Privacy Guarantee
            </h4>
            <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>
              BioVault does not host your profiles, schedules, or health history on a cloud server. All records reside inside your browser's sandboxed IndexedDB storage. Outbound network requests occur strictly as anonymous, state-free fallbacks for AI clinical synthesis and entity resolver queries.
            </p>
          </GlassCard>

          {/* Database stats */}
          <GlassCard style={{ padding: 24 }}>
            <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 600, marginBottom: 16 }}>Local Database Status</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              <div style={{ padding: 12, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>{profileCount}</p>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginTop: 4 }}>Active Profiles</p>
              </div>
              <div style={{ padding: 12, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-secondary)' }}>{timelineCount}</p>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginTop: 4 }}>Scheduled Intakes</p>
              </div>
              <div style={{ padding: 12, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-warning)' }}>{cacheCount}</p>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginTop: 4 }}>Resolved Entities</p>
              </div>
            </div>
          </GlassCard>

          {/* AI API Credentials */}
          <GlassCard style={{ padding: 24 }}>
            <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 600, marginBottom: 10 }}>AI API Credentials (Optional)</h3>
            <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginBottom: 20, lineHeight: 1.5 }}>
              If the default server-side API keys are exhausted, rate-limited, or unconfigured, you can configure your own personal keys. These are saved purely inside your browser's local storage and passed securely via transit headers for stateless AI clinical calculations.
            </p>
            
            <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
              {/* Gemini API Key */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-caption)', fontWeight: 600, marginBottom: 6 }}>Gemini API Key</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type={showGemini ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Enter your Gemini API key (starts with AIzaSy...)"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--color-outline-variant)',
                      color: 'var(--color-on-surface)',
                      fontSize: 'var(--font-caption)',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGemini(!showGemini)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--color-outline-variant)',
                      color: 'var(--color-on-surface-variant)',
                      borderRadius: 'var(--radius-sm)',
                      width: 42,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      {showGemini ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Grok API Key */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-caption)', fontWeight: 600, marginBottom: 6 }}>Grok API Key</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type={showGrok ? 'text' : 'password'}
                    value={grokKey}
                    onChange={(e) => setGrokKey(e.target.value)}
                    placeholder="Enter your Grok API key (starts with xai-...)"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--color-outline-variant)',
                      color: 'var(--color-on-surface)',
                      fontSize: 'var(--font-caption)',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGrok(!showGrok)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--color-outline-variant)',
                      color: 'var(--color-on-surface-variant)',
                      borderRadius: 'var(--radius-sm)',
                      width: 42,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      {showGrok ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button variant="primary" icon="key" onClick={handleSaveKeys}>
                Save API Credentials
              </Button>
              {(geminiKey || grokKey) && (
                <Button variant="ghost" icon="key_off" onClick={handleClearKeys}>
                  Clear Saved Keys
                </Button>
              )}
              {savedSuccess && (
                <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-caption)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                  Saved successfully!
                </span>
              )}
            </div>
          </GlassCard>

          {/* Export / Import */}
          <GlassCard style={{ padding: 24 }}>
            <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 600, marginBottom: 10 }}>Backup & Migration</h3>
            <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginBottom: 20 }}>
              Transfer your timeline database to a new device or keep offline backups by downloading your profile files.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="primary" icon="download" onClick={handleExport}>
                Export Local Backup
              </Button>
              
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                />
                <Button variant="ghost" icon="upload">
                  Import Backup File
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Wipe Local Data */}
          <GlassCard style={{ padding: 24, borderLeft: '4px solid var(--color-critical)' }}>
            <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 600, color: 'var(--color-critical)', marginBottom: 10 }}>
              Secure Local Reset
            </h3>
            <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', marginBottom: 20 }}>
              Wipe all private data. This deletes your profiles, schedules, and clinical resolved caches immediately. This is equivalent to signing out completely and resetting onboarding.
            </p>
            <Button variant="danger" icon="delete_forever" onClick={handleReset} loading={isWiping}>
              Wipe All Local Data
            </Button>
          </GlassCard>
          
        </div>
      </div>
    </AppShell>
  );
}
