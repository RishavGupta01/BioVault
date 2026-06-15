'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/db/schema';
import GlassCard from '@/components/ui/GlassCard';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    async function performLocalSignOut() {
      try {
        console.log("Initiating local data wipe for secure sign out...");
        
        // Wait 1.5 seconds to show visual feedback
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Clear all local IndexedDB tables
        await Promise.all([
          db.user_timeline.clear(),
          db.user_profiles.clear(),
          db.ai_resolved_cache.clear()
        ]);

        // Clear all localStorage configurations
        localStorage.clear();

        // Redirect to onboarding welcome page
        window.location.href = '/onboarding';
      } catch (err) {
        console.error("Local sign out failed:", err);
        alert("Wipe failed: " + (err instanceof Error ? err.message : err));
        router.replace('/');
      }
    }

    performLocalSignOut();
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0c0a09', // Deep base color matching theme
      color: '#fff',
      padding: '24px'
    }}>
      <GlassCard style={{ 
        padding: '40px', 
        textAlign: 'center', 
        maxWidth: '450px',
        display: 'grid',
        justifyItems: 'center',
        gap: '16px'
      }}>
        <div className="loading-spinner" style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid rgba(255,255,255,0.1)', 
          borderTopColor: 'var(--color-primary)', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <h3 style={{ fontWeight: 600, fontSize: 'var(--font-h3)' }}>Secure Sign Out</h3>
        <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>
          BioVault is deleting your profiles, schedules, and clinical resolved caches from this browser's memory. Your health data remains 100% private.
        </p>

        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </GlassCard>
    </div>
  );
}
