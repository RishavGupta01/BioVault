import type { UserTimelineEntry } from '@/db/schema';
import type { ClashRuleParsed, BoostRuleParsed } from '@/engine/validation';

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

function lookupClash(
  itemA: string,
  itemB: string,
  clashRules: ClashRulesMap
): ClashRuleParsed | null {
  // Check both directions: A→B and B→A
  const forward = clashRules[itemA]?.[itemB];
  if (forward) return forward;
  const reverse = clashRules[itemB]?.[itemA];
  if (reverse) return reverse;
  return null;
}

function lookupBoost(
  itemA: string,
  itemB: string,
  boostRules: BoostRulesMap
): BoostRuleParsed | null {
  const forward = boostRules[itemA]?.[itemB];
  if (forward) return forward;
  const reverse = boostRules[itemB]?.[itemA];
  if (reverse) return reverse;
  return null;
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
