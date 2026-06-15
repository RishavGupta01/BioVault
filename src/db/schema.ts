import Dexie, { type Table } from 'dexie';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface EvidenceSource {
  title: string;
  url?: string;
  summary: string;
}

export interface AIResolvedCacheEntry {
  user_input_string: string;    // Primary Key
  generic_name: string;
  category: 'medicine' | 'supplement' | 'food';
  optimal_slot: 'FASTING' | 'WITH_MEAL' | 'AFTER_MEAL' | 'BEFORE_BED';
  requires_food: boolean;
  confidence_level: 'HIGH' | 'MEDIUM' | 'THEORETICAL';
  evidence_sources: EvidenceSource[];
  last_updated: number;
}

export interface UserTimelineEntry {
  id?: number;
  profile_id: string;
  scheduled_time: string;  // HH:MM
  item_name: string;
  generic_resolved: string;
  vehicle: 'water' | 'milk' | 'coffee' | 'juice' | 'alcohol';
}

export interface UserProfile {
  id: string;
  name: string;
  avatar_color: string;
  created_at: number;
}

// ─── Database ────────────────────────────────────────────────────────────────

export class BioVaultDB extends Dexie {
  ai_resolved_cache!: Table<AIResolvedCacheEntry, string>;
  user_timeline!: Table<UserTimelineEntry, number>;
  user_profiles!: Table<UserProfile, string>;

  constructor() {
    super('BioVaultDB');

    this.version(2).stores({
      ai_resolved_cache: 'user_input_string, generic_name, category, optimal_slot, last_updated',
      user_timeline: '++id, profile_id, scheduled_time, generic_resolved, vehicle',
      user_profiles: 'id, name, created_at',
    });
  }
}

export const db = new BioVaultDB();
