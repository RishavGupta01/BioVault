'use client';

import { create } from 'zustand';
import { db } from '@/db/schema';
import type { UserTimelineEntry } from '@/db/schema';
import { computeWellnessScore, type WellnessScoreResult, type ConflictResult, type BoostResult, type ScoreBreakdown } from '@/engine/scanEngine';
import type { ClashRuleParsed, BoostRuleParsed } from '@/engine/validation';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TimelineState {
  // Primary State
  timelineEntries: UserTimelineEntry[];
  activeProfileId: string;

  // Computed Score
  wellnessScore: number;
  conflicts: ConflictResult[];
  boosts: BoostResult[];
  scoreBreakdown: ScoreBreakdown;

  // Shadow State (What-If Simulator)
  shadowTimeline: UserTimelineEntry[] | null;
  shadowScore: WellnessScoreResult | null;
  isDragging: boolean;

  // Loading
  isLoading: boolean;

  // Actions
  loadEntries: (profileId: string) => Promise<void>;
  addEntry: (entry: Omit<UserTimelineEntry, 'id'>) => Promise<void>;
  removeEntry: (id: number) => Promise<void>;
  updateEntry: (id: number, updates: Partial<UserTimelineEntry>) => Promise<void>;

  // Shadow State Actions
  startDrag: () => void;
  updateShadow: (shadowEntries: UserTimelineEntry[]) => void;
  commitDrag: () => Promise<void>;
  abortDrag: () => void;

  // Recalculation
  recalculate: () => void;
  setActiveProfile: (profileId: string) => void;
}

// ─── Rule Loading ───────────────────────────────────────────────────────────

let clashRulesCache: Record<string, Record<string, ClashRuleParsed>> = {};
let boostRulesCache: Record<string, Record<string, BoostRuleParsed>> = {};
let itemInfoMapCache: Map<string, { generic_name: string; requires_food: boolean; gastric_irritant: boolean; optimal_slot: string }> = new Map();
let rulesLoaded = false;

async function loadRules() {
  if (rulesLoaded) return;
  try {
    const [clashMod, boostMod, medsMod, supplementsMod] = await Promise.all([
      import('@/context/clash_rules.json').catch(() => ({ default: {} })),
      import('@/context/boost_rules.json').catch(() => ({ default: {} })),
      import('@/context/core_meds.json').catch(() => ({ default: [] })),
      import('@/context/supplements.json').catch(() => ({ default: [] })),
    ]);
    clashRulesCache = clashMod.default as Record<string, Record<string, ClashRuleParsed>>;
    boostRulesCache = boostMod.default as Record<string, Record<string, BoostRuleParsed>>;

    // Build item info map from core meds
    const meds = medsMod.default as Array<{
      generic_name: string;
      requires_food: boolean;
      gastric_irritant: boolean;
      optimal_slot: string;
    }>;
    for (const med of meds) {
      itemInfoMapCache.set(med.generic_name, {
        generic_name: med.generic_name,
        requires_food: med.requires_food,
        gastric_irritant: med.gastric_irritant,
        optimal_slot: med.optimal_slot,
      });
    }

    // Build item info map from supplements
    const supplements = supplementsMod.default as Array<{
      generic_name: string;
      requires_food: boolean;
      gastric_irritant: boolean;
      optimal_slot: string;
    }>;
    for (const supp of supplements) {
      itemInfoMapCache.set(supp.generic_name, {
        generic_name: supp.generic_name,
        requires_food: supp.requires_food,
        gastric_irritant: supp.gastric_irritant,
        optimal_slot: supp.optimal_slot,
      });
    }

    rulesLoaded = true;
  } catch {
    // Rules not yet available
  }
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useTimelineStore = create<TimelineState>((set, get) => ({
  // Initial State
  timelineEntries: [],
  activeProfileId: 'default',
  wellnessScore: 100,
  conflicts: [],
  boosts: [],
  scoreBreakdown: { absorption: 0, critical: 0, gastric: 0, cumulative: 0 },
  shadowTimeline: null,
  shadowScore: null,
  isDragging: false,
  isLoading: false,

  // ─── Load Entries ─────────────────────────────────────────────────────
  loadEntries: async (profileId: string) => {
    set({ isLoading: true });
    await loadRules();

    try {
      const entries = await db.user_timeline
        .where('profile_id')
        .equals(profileId)
        .toArray();

      set({ timelineEntries: entries, activeProfileId: profileId });
      get().recalculate();
    } catch {
      set({ timelineEntries: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // ─── Add Entry ────────────────────────────────────────────────────────
  addEntry: async (entry) => {
    await db.transaction('rw', db.user_timeline, async () => {
      await db.user_timeline.add(entry);
    });
    await get().loadEntries(get().activeProfileId);
  },

  // ─── Remove Entry ─────────────────────────────────────────────────────
  removeEntry: async (id: number) => {
    await db.transaction('rw', db.user_timeline, async () => {
      await db.user_timeline.delete(id);
    });
    await get().loadEntries(get().activeProfileId);
  },

  // ─── Update Entry ─────────────────────────────────────────────────────
  updateEntry: async (id: number, updates: Partial<UserTimelineEntry>) => {
    await db.transaction('rw', db.user_timeline, async () => {
      await db.user_timeline.update(id, updates);
    });
    await get().loadEntries(get().activeProfileId);
  },

  // ─── Shadow State: Start Drag ─────────────────────────────────────────
  startDrag: () => {
    const { timelineEntries } = get();
    // Clone the timeline into shadow array — NEVER modify primary directly
    const shadow = timelineEntries.map((e) => ({ ...e }));
    set({ isDragging: true, shadowTimeline: shadow });
  },

  // ─── Shadow State: Update Shadow ──────────────────────────────────────
  updateShadow: (shadowEntries: UserTimelineEntry[]) => {
    const result = computeWellnessScore(
      shadowEntries,
      clashRulesCache,
      boostRulesCache,
      itemInfoMapCache
    );
    set({ shadowTimeline: shadowEntries, shadowScore: result });
  },

  // ─── Shadow State: Commit Drag ────────────────────────────────────────
  commitDrag: async () => {
    const { shadowTimeline, activeProfileId } = get();
    if (!shadowTimeline) return;

    // Commit shadow array to IndexedDB within a transaction
    await db.transaction('rw', db.user_timeline, async () => {
      for (const entry of shadowTimeline) {
        if (entry.id) {
          await db.user_timeline.update(entry.id, {
            scheduled_time: entry.scheduled_time,
          });
        }
      }
    });

    set({ isDragging: false, shadowTimeline: null, shadowScore: null });
    await get().loadEntries(activeProfileId);
  },

  // ─── Shadow State: Abort Drag ─────────────────────────────────────────
  abortDrag: () => {
    // Erase shadow array, no DOM lag, no DB mutation
    set({ isDragging: false, shadowTimeline: null, shadowScore: null });
  },

  // ─── Recalculate Score ────────────────────────────────────────────────
  recalculate: () => {
    const { timelineEntries } = get();
    const result = computeWellnessScore(
      timelineEntries,
      clashRulesCache,
      boostRulesCache,
      itemInfoMapCache
    );

    set({
      wellnessScore: result.score,
      conflicts: result.conflicts,
      boosts: result.boosts,
      scoreBreakdown: result.breakdown,
    });
  },

  // ─── Set Active Profile ───────────────────────────────────────────────
  setActiveProfile: (profileId: string) => {
    set({ activeProfileId: profileId });
    get().loadEntries(profileId);
  },
}));
