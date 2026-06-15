import Fuse, { type IFuseOptions, type FuseResult } from 'fuse.js';
import coreMeds from '@/context/core_meds.json';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MedEntry {
  generic_name: string;
  brand_names: string[];
  category: 'medicine';
  drug_class: string;
  optimal_slot: 'FASTING' | 'WITH_MEAL' | 'AFTER_MEAL' | 'BEFORE_BED';
  requires_food: boolean;
  common_doses: string[];
  half_life_hours: number;
  absorption_notes: string;
  gastric_irritant: boolean;
  aliases: string[];
}

export interface SupplementEntry {
  generic_name: string;
  brand_names: string[];
  category: 'supplement';
  type: string;
  optimal_slot: 'FASTING' | 'WITH_MEAL' | 'AFTER_MEAL' | 'BEFORE_BED';
  requires_food: boolean;
  common_doses: string[];
  absorption_notes: string;
  gastric_irritant: boolean;
  aliases: string[];
}

export interface FoodEntry {
  generic_name: string;
  category: 'food';
  food_group: string;
  common_aliases: string[];
  interaction_profile: string;
  gastric_impact: string;
  absorption_effect: string;
  notes: string;
}

export type DataEntry = MedEntry | SupplementEntry | FoodEntry;

export interface FuzzyMatchResult {
  item: DataEntry;
  score: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ─── Unified Search Index ────────────────────────────────────────────────────

function buildSearchIndex(): DataEntry[] {
  const items: DataEntry[] = [];

  // Load core medications
  const meds = coreMeds as MedEntry[];
  items.push(...meds);

  // Dynamically load supplements & foods if available
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const supplements = require('@/context/supplements.json') as SupplementEntry[];
    items.push(...supplements);
  } catch {
    // supplements.json not yet created
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const foods = require('@/context/foods.json') as FoodEntry[];
    items.push(...foods);
  } catch {
    // foods.json not yet created
  }

  return items;
}

// ─── Fuse.js Configuration ──────────────────────────────────────────────────

const fuseOptions: IFuseOptions<DataEntry> = {
  keys: [
    { name: 'generic_name', weight: 0.4 },
    { name: 'brand_names', weight: 0.3 },
    { name: 'aliases', weight: 0.2 },
    { name: 'common_aliases', weight: 0.2 },
    { name: 'drug_class', weight: 0.05 },
    { name: 'type', weight: 0.05 },
  ],
  threshold: 0.3,
  distance: 100,
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
};

let fuseInstance: Fuse<DataEntry> | null = null;
let searchIndex: DataEntry[] = [];

function getFuse(): Fuse<DataEntry> {
  if (!fuseInstance) {
    searchIndex = buildSearchIndex();
    fuseInstance = new Fuse(searchIndex, fuseOptions);
  }
  return fuseInstance;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fuzzy search across all local data sources.
 * Returns results sorted by confidence (< 2ms for in-memory lookups).
 */
export function fuzzySearch(query: string, limit: number = 10): FuzzyMatchResult[] {
  if (!query || query.trim().length < 2) return [];

  const fuse = getFuse();
  const results: FuseResult<DataEntry>[] = fuse.search(query.toLowerCase().trim(), { limit });

  return results.map((result) => {
    const score = result.score ?? 1;
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW';

    if (score <= 0.1) confidence = 'HIGH';
    else if (score <= 0.25) confidence = 'MEDIUM';
    else confidence = 'LOW';

    return {
      item: result.item,
      score,
      confidence,
    };
  });
}

/**
 * Exact match lookup by generic_name across all sources.
 * Used for clash/boost rule cross-referencing.
 */
export function exactLookup(genericName: string): DataEntry | undefined {
  if (!searchIndex.length) {
    searchIndex = buildSearchIndex();
  }
  return searchIndex.find(
    (item) => item.generic_name.toLowerCase() === genericName.toLowerCase()
  );
}

/**
 * Force rebuild the search index (call after new data is loaded).
 */
export function rebuildIndex(): void {
  fuseInstance = null;
  searchIndex = [];
  getFuse();
}

/**
 * Get total count of indexed items.
 */
export function getIndexSize(): number {
  if (!searchIndex.length) {
    searchIndex = buildSearchIndex();
  }
  return searchIndex.length;
}
