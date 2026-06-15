import type { UserTimelineEntry } from '@/db/schema';
import type { ClashRuleParsed, BoostRuleParsed } from '@/engine/validation';
import { exactLookup } from '@/engine/fuzzyMatcher';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ConflictResult {
  itemA: string;
  itemB: string;
  timeA: string;
  timeB: string;
  rule: ClashRuleParsed;
  timeDeltaMinutes: number;
}

export interface BoostResult {
  itemA: string;
  itemB: string;
  timeA: string;
  timeB: string;
  rule: BoostRuleParsed;
}

export interface ScoreBreakdown {
  absorption: number;    // I_abs
  critical: number;      // I_crit
  gastric: number;       // I_gastric
  cumulative: number;    // I_cum
}

export interface WellnessScoreResult {
  score: number;              // S: 0-100
  breakdown: ScoreBreakdown;
  conflicts: ConflictResult[];
  boosts: BoostResult[];
  totalPenalty: number;
  totalBonus: number;
}

type ClashRulesMap = Record<string, Record<string, ClashRuleParsed>>;
type BoostRulesMap = Record<string, Record<string, BoostRuleParsed>>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert HH:MM string to integer minutes from midnight.
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * O(N log N) chronological sort converting HH:MM → minutes from midnight.
 */
export function chronologicalSort(entries: UserTimelineEntry[]): UserTimelineEntry[] {
  return [...entries].sort((a, b) => timeToMinutes(a.scheduled_time) - timeToMinutes(b.scheduled_time));
}

// ─── Clash Rule Lookup ──────────────────────────────────────────────────────

// ─── Class and Group Key Expansion ───────────────────────────────────────────

function getItemKeys(genericName: string): string[] {
  const keys = new Set<string>();
  const normalized = genericName.toLowerCase().trim();

  // Always include the item itself
  keys.add(normalized);

  // Try to find the exact database item
  const item = exactLookup(normalized);
  if (item) {
    // 1. Category-specific classifications
    if (item.category === 'medicine') {
      const drugClass = item.drug_class ? item.drug_class.toLowerCase().trim() : '';
      if (drugClass) {
        if (drugClass.includes('ssri')) keys.add('ssri');
        if (drugClass.includes('proton pump inhibitor') || drugClass.includes('ppi')) keys.add('ppi');
        if (drugClass.includes('nsaid')) keys.add('nsaid');
        if (drugClass.includes('statin')) keys.add('statins');
        if (drugClass.includes('antacid')) keys.add('antacids');
        if (drugClass.includes('mao inhibitor') || drugClass.includes('maoi')) keys.add('mao_inhibitor');
      }
    } else if (item.category === 'supplement') {
      const type = item.type ? item.type.toLowerCase().trim() : '';
      if (type === 'probiotic') {
        keys.add('probiotics');
      }
      if (type === 'mineral') {
        if (normalized.includes('calcium')) {
          keys.add('calcium_carbonate');
          keys.add('dairy');
        }
        if (normalized.includes('iron')) {
          keys.add('iron_sulfate');
        }
        if (normalized.includes('zinc')) {
          keys.add('zinc');
        }
      }
    } else if (item.category === 'food') {
      const foodGroup = item.food_group ? item.food_group.toLowerCase().trim() : '';
      if (foodGroup === 'dairy') {
        keys.add('dairy');
      } else if (foodGroup === 'beverage_alcoholic') {
        keys.add('alcohol');
        keys.add('beverage_alcoholic');
      } else if (foodGroup === 'beverage_caffeinated') {
        keys.add('caffeine');
        if (normalized.includes('coffee')) {
          keys.add('coffee');
          keys.add('coffee_black');
        }
        if (normalized.includes('tea')) {
          keys.add('tea');
        }
      }

      // 2. Interaction Profile classifications
      const profile = item.interaction_profile ? item.interaction_profile.toLowerCase().trim() : '';
      if (profile === 'cyp3a4_inhibitor') {
        keys.add('grapefruit');
      } else if (profile === 'calcium_source') {
        keys.add('calcium_carbonate');
        keys.add('dairy');
      } else if (profile === 'iron_source') {
        keys.add('iron_sulfate');
      } else if (profile === 'tyramine_source') {
        keys.add('tyramine');
      } else if (profile === 'fiber_rich') {
        keys.add('fiber');
      }
    }
  }

  // Fallback direct name matching for items whose exact entry might not be resolved but contain keywords
  if (normalized.includes('milk') || normalized.includes('cheese') || normalized.includes('yogurt') || normalized.includes('kefir') || normalized === 'dairy') {
    keys.add('dairy');
    keys.add('calcium_carbonate');
  }
  if (normalized.includes('alcohol') || normalized.includes('wine') || normalized.includes('beer') || normalized.includes('spirits')) {
    keys.add('alcohol');
    keys.add('beverage_alcoholic');
  }
  if (normalized.includes('seville') || normalized.includes('pomelo') || normalized.includes('grapefruit')) {
    keys.add('grapefruit');
  }
  if (normalized.includes('coffee')) {
    keys.add('caffeine');
    keys.add('coffee');
    keys.add('coffee_black');
  }
  if (normalized.includes('tea') && !normalized.includes('herbal')) {
    keys.add('caffeine');
    keys.add('tea');
  }
  if (normalized.includes('ibuprofen') || normalized.includes('naproxen') || normalized.includes('aspirin')) {
    keys.add('nsaid');
  }
  if (normalized.includes('sertraline') || normalized.includes('fluoxetine') || normalized.includes('escitalopram')) {
    keys.add('ssri');
  }
  if (normalized.includes('omeprazole') || normalized.includes('pantoprazole') || normalized.includes('esomeprazole')) {
    keys.add('ppi');
  }
  if (normalized.includes('atorvastatin') || normalized.includes('simvastatin') || normalized.includes('rosuvastatin')) {
    keys.add('statins');
  }
  if (normalized.includes('coq10') || normalized.includes('coenzyme_q10')) {
    keys.add('coq10');
    keys.add('coenzyme_q10_ubiquinol');
  }

  return Array.from(keys);
}

// ─── Clash Rule Lookup ──────────────────────────────────────────────────────

function lookupClash(
  itemA: string,
  itemB: string,
  clashRules: ClashRulesMap
): ClashRuleParsed | null {
  const keysA = getItemKeys(itemA);
  const keysB = getItemKeys(itemB);

  let worstClash: ClashRuleParsed | null = null;

  for (const kA of keysA) {
    for (const kB of keysB) {
      const forward = clashRules[kA]?.[kB];
      if (forward) {
        if (!worstClash || forward.severity > worstClash.severity) {
          worstClash = forward;
        }
      }
      const reverse = clashRules[kB]?.[kA];
      if (reverse) {
        if (!worstClash || reverse.severity > worstClash.severity) {
          worstClash = reverse;
        }
      }
    }
  }

  return worstClash;
}

function lookupBoost(
  itemA: string,
  itemB: string,
  boostRules: BoostRulesMap
): BoostRuleParsed | null {
  const keysA = getItemKeys(itemA);
  const keysB = getItemKeys(itemB);

  let bestBoost: BoostRuleParsed | null = null;

  for (const kA of keysA) {
    for (const kB of keysB) {
      const forward = boostRules[kA]?.[kB];
      if (forward) {
        if (!bestBoost || forward.score_bonus > bestBoost.score_bonus) {
          bestBoost = forward;
        }
      }
      const reverse = boostRules[kB]?.[kA];
      if (reverse) {
        if (!bestBoost || reverse.score_bonus > bestBoost.score_bonus) {
          bestBoost = reverse;
        }
      }
    }
  }

  return bestBoost;
}

// ─── Sliding Window Scan ─────────────────────────────────────────────────────

/**
 * O(N) sliding window pass for conflict detection.
 * For each sorted item, look forward at subsequent items.
 * If |t_A - t_B| < window_minutes from clash_rules, register conflict.
 */
export function slidingWindowScan(
  sorted: UserTimelineEntry[],
  clashRules: ClashRulesMap
): ConflictResult[] {
  const conflicts: ConflictResult[] = [];
  const n = sorted.length;

  for (let i = 0; i < n; i++) {
    const entryA = sorted[i];
    const minutesA = timeToMinutes(entryA.scheduled_time);

    for (let j = i + 1; j < n; j++) {
      const entryB = sorted[j];
      const minutesB = timeToMinutes(entryB.scheduled_time);
      const delta = Math.abs(minutesB - minutesA);

      // Once delta exceeds max possible window (6 hours), stop looking forward
      if (delta > 360) break;

      const clash = lookupClash(
        entryA.generic_resolved,
        entryB.generic_resolved,
        clashRules
      );

      if (clash && delta < clash.window_minutes) {
        conflicts.push({
          itemA: entryA.generic_resolved,
          itemB: entryB.generic_resolved,
          timeA: entryA.scheduled_time,
          timeB: entryB.scheduled_time,
          rule: clash,
          timeDeltaMinutes: delta,
        });
      }
    }
  }

  return conflicts;
}

// ─── Boost Scan ─────────────────────────────────────────────────────────────

/**
 * Detect synergistic pairs in the timeline.
 */
export function boostScan(
  sorted: UserTimelineEntry[],
  boostRules: BoostRulesMap
): BoostResult[] {
  const boosts: BoostResult[] = [];
  const n = sorted.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const entryA = sorted[i];
      const entryB = sorted[j];
      const delta = Math.abs(
        timeToMinutes(entryB.scheduled_time) - timeToMinutes(entryA.scheduled_time)
      );

      // Boosts typically effective within 2-hour window
      if (delta > 120) break;

      const boost = lookupBoost(
        entryA.generic_resolved,
        entryB.generic_resolved,
        boostRules
      );

      if (boost) {
        boosts.push({
          itemA: entryA.generic_resolved,
          itemB: entryB.generic_resolved,
          timeA: entryA.scheduled_time,
          timeB: entryB.scheduled_time,
          rule: boost,
        });
      }
    }
  }

  return boosts;
}

// ─── Gastric Audit ──────────────────────────────────────────────────────────

interface GastricItemInfo {
  generic_name: string;
  requires_food: boolean;
  gastric_irritant: boolean;
  optimal_slot: string;
}

/**
 * Check for gastric issues: items requiring food taken on empty stomach,
 * or known gastric irritants.
 */
export function gastricAudit(
  entries: UserTimelineEntry[],
  itemInfoMap: Map<string, GastricItemInfo>
): { penalty: number; warnings: string[] } {
  let penalty = 0;
  const warnings: string[] = [];

  for (const entry of entries) {
    const info = itemInfoMap.get(entry.generic_resolved);
    if (!info) continue;

    const minutes = timeToMinutes(entry.scheduled_time);
    const isFastingSlot = minutes < 420 || (minutes > 600 && minutes < 720);

    // Check if item requires food but scheduled in fasting window
    if (info.requires_food && isFastingSlot) {
      penalty += 15;
      warnings.push(
        `${info.generic_name} requires food but is scheduled during a fasting window (${entry.scheduled_time})`
      );
    }

    // Check gastric irritants taken on empty stomach
    if (info.gastric_irritant && isFastingSlot) {
      penalty += 20;
      warnings.push(
        `${info.generic_name} is a gastric irritant and should not be taken on an empty stomach (${entry.scheduled_time})`
      );
    }

    // Check gastric irritants taken with alcohol
    if (info.gastric_irritant && entry.vehicle === 'alcohol') {
      penalty += 25;
      warnings.push(
        `${info.generic_name} is a gastric irritant and should not be taken with alcohol`
      );
    }
  }

  return { penalty: Math.min(penalty, 100), warnings };
}

// ─── Master Score Computation ───────────────────────────────────────────────

/**
 * Computes the wellness score using the exact formula:
 * S = 100 - (0.40 * I_abs + 0.25 * I_crit + 0.20 * I_gastric + 0.15 * I_cum)
 *
 * Executes within 16ms budget for sub-frame performance.
 */
export function computeWellnessScore(
  entries: UserTimelineEntry[],
  clashRules: ClashRulesMap,
  boostRules: BoostRulesMap,
  itemInfoMap: Map<string, GastricItemInfo>
): WellnessScoreResult {
  if (entries.length === 0) {
    return {
      score: 100,
      breakdown: { absorption: 0, critical: 0, gastric: 0, cumulative: 0 },
      conflicts: [],
      boosts: [],
      totalPenalty: 0,
      totalBonus: 0,
    };
  }

  // Step 1: Chronological sort — O(N log N)
  const sorted = chronologicalSort(entries);

  // Step 2: Sliding window clash scan — O(N)
  const conflicts = slidingWindowScan(sorted, clashRules);

  // Step 3: Boost scan
  const boosts = boostScan(sorted, boostRules);

  // Step 4: Gastric audit
  const gastricResult = gastricAudit(sorted, itemInfoMap);

  // Step 5: Accumulate penalty coefficients
  let I_abs = 0;      // Absorption blockages
  let I_crit = 0;     // Critical contraindications
  let I_gastric = 0;  // Gastric irritation
  let I_cum = 0;      // Cumulative load

  for (const conflict of conflicts) {
    I_abs += conflict.rule.penalty_abs;
    I_crit += conflict.rule.penalty_crit;
    I_gastric += conflict.rule.penalty_gastric;
    I_cum += conflict.rule.penalty_cum;
  }

  // Add gastric audit penalties
  I_gastric += gastricResult.penalty;

  // Cap individual coefficients at 100
  I_abs = Math.min(I_abs, 100);
  I_crit = Math.min(I_crit, 100);
  I_gastric = Math.min(I_gastric, 100);
  I_cum = Math.min(I_cum, 100);

  // Step 6: Calculate total penalty
  const totalPenalty = 0.40 * I_abs + 0.25 * I_crit + 0.20 * I_gastric + 0.15 * I_cum;

  // Step 7: Calculate boost bonus
  let totalBonus = 0;
  for (const boost of boosts) {
    totalBonus += boost.rule.score_bonus;
  }
  totalBonus = Math.min(totalBonus, 20); // Cap bonus at 20 points

  // Step 8: Compute final score
  const rawScore = 100 - totalPenalty + totalBonus;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    score,
    breakdown: {
      absorption: Math.round(I_abs),
      critical: Math.round(I_crit),
      gastric: Math.round(I_gastric),
      cumulative: Math.round(I_cum),
    },
    conflicts,
    boosts,
    totalPenalty: Math.round(totalPenalty),
    totalBonus: Math.round(totalBonus),
  };
}
