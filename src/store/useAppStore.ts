'use client';

import { create } from 'zustand';
import { db } from '@/db/schema';
import type { UserProfile } from '@/db/schema';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AppState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Onboarding
  isOnboarded: boolean;
  setOnboarded: (value: boolean) => void;

  // Command Palette
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;

  // Navigation
  activePage: string;
  setActivePage: (page: string) => void;

  // Profiles
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  loadProfiles: () => Promise<void>;
  addProfile: (profile: UserProfile) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
  setActiveProfile: (id: string) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('biovault-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getOnboardedStatus(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('biovault-onboarded') === 'true';
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  // Theme
  theme: 'light',
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('biovault-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  },

  // Onboarding
  isOnboarded: false,
  setOnboarded: (value: boolean) => {
    set({ isOnboarded: value });
    if (typeof window !== 'undefined') {
      localStorage.setItem('biovault-onboarded', String(value));
    }
  },

  // Command Palette
  commandPaletteOpen: false,
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),

  // Navigation
  activePage: '/',
  setActivePage: (page: string) => set({ activePage: page }),

  // Profiles
  profiles: [],
  activeProfile: null,

  loadProfiles: async () => {
    try {
      const profiles = await db.user_profiles.toArray();
      const activeId = typeof window !== 'undefined'
        ? localStorage.getItem('biovault-active-profile')
        : null;

      if (profiles.length === 0) {
        // Create default profile
        const defaultProfile: UserProfile = {
          id: 'default',
          name: 'My Profile',
          avatar_color: '#4f46e5',
          created_at: Date.now(),
        };
        await db.user_profiles.add(defaultProfile);
        set({ profiles: [defaultProfile], activeProfile: defaultProfile });
      } else {
        const active = profiles.find((p) => p.id === activeId) || profiles[0];
        set({ profiles, activeProfile: active });
      }
    } catch {
      // DB not available yet
    }
  },

  addProfile: async (profile: UserProfile) => {
    await db.transaction('rw', db.user_profiles, async () => {
      await db.user_profiles.add(profile);
    });
    await get().loadProfiles();
  },

  removeProfile: async (id: string) => {
    if (id === 'default') return; // Never delete default profile
    await db.transaction('rw', [db.user_profiles, db.user_timeline], async () => {
      await db.user_profiles.delete(id);
      // Also delete all timeline entries for this profile
      await db.user_timeline.where('profile_id').equals(id).delete();
    });
    await get().loadProfiles();
  },

  setActiveProfile: (id: string) => {
    const profile = get().profiles.find((p) => p.id === id);
    if (profile) {
      set({ activeProfile: profile });
      if (typeof window !== 'undefined') {
        localStorage.setItem('biovault-active-profile', id);
      }
    }
  },
}));

// ─── Initialize on client ───────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  // Hydrate theme on load
  const theme = getStoredTheme();
  useAppStore.setState({ theme, isOnboarded: getOnboardedStatus() });
  document.documentElement.setAttribute('data-theme', theme);
}
