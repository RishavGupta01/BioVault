import { db } from '@/db/schema';
import type { AIResolvedCacheEntry } from '@/db/schema';
import { fuzzySearch } from '@/engine/fuzzyMatcher';
import { EdgeResponseSchema } from '@/engine/validation';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ResolutionResult {
  entry: AIResolvedCacheEntry;
  source: 'fuzzy_match' | 'cache_hit' | 'edge_api';
  latencyMs: number;
}

export interface ResolutionError {
  error: string;
  source: 'validation_failed' | 'edge_error' | 'all_failed';
}

// ─── 5-Step Entity Resolution Pipeline ──────────────────────────────────────

/**
 * Write-Through Entity Resolution Pipeline
 * 
 * 1. Fuzzy In-Memory Check (< 2ms)
 * 2. Persistent Index Lookup via IndexedDB (< 5ms)
 * 3. Edge Network Fallback (Gemini → Grok)
 * 4. Zod Validation Gate
 * 5. Transactional Client Indexing
 */
export async function resolveEntity(
  userInput: string
): Promise<ResolutionResult | ResolutionError> {
  const start = performance.now();
  const normalizedInput = userInput.toLowerCase().trim();

  if (!normalizedInput || normalizedInput.length < 2) {
    return { error: 'Input too short', source: 'all_failed' };
  }

  // ─── Step 1: Fuzzy Lexical Triage ─────────────────────────────────────
  const fuzzyResults = fuzzySearch(normalizedInput, 1);

  if (fuzzyResults.length > 0 && fuzzyResults[0].confidence === 'HIGH') {
    const match = fuzzyResults[0].item;
    const entry: AIResolvedCacheEntry = {
      user_input_string: normalizedInput,
      generic_name: match.generic_name,
      category: match.category,
      optimal_slot: 'optimal_slot' in match ? match.optimal_slot : 'WITH_MEAL',
      requires_food: 'requires_food' in match ? match.requires_food : false,
      confidence_level: 'HIGH',
      evidence_sources: [{
        title: 'Local Static Database Match',
        summary: `Matched from local ${match.category} database with high confidence.`,
      }],
      last_updated: Date.now(),
    };

    return {
      entry,
      source: 'fuzzy_match',
      latencyMs: Math.round(performance.now() - start),
    };
  }

  // ─── Step 2: Persistent Index Lookup (IndexedDB Cache) ────────────────
  try {
    const cached = await db.ai_resolved_cache.get(normalizedInput);
    if (cached) {
      return {
        entry: cached,
        source: 'cache_hit',
        latencyMs: Math.round(performance.now() - start),
      };
    }
  } catch {
    // IndexedDB query failed, continue to edge
  }

  // ─── Step 3: Edge Network Fallback ────────────────────────────────────
  try {
    const response = await fetch('/api/resolve-entity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: normalizedInput }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error 
        ? `${errData.error}${errData.details ? `: ${errData.details}` : ''}` 
        : `Edge API returned ${response.status}`;
      throw new Error(errMsg);
    }

    const rawData: unknown = await response.json();

    // ─── Step 4: Zod Validation Gate ──────────────────────────────────
    const parseResult = EdgeResponseSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {
        error: `Validation failed: ${parseResult.error.message}`,
        source: 'validation_failed',
      };
    }

    const validated = parseResult.data;

    // ─── Step 5: Transactional Client Indexing ────────────────────────
    const entry: AIResolvedCacheEntry = {
      user_input_string: normalizedInput,
      generic_name: validated.generic_name,
      category: validated.category,
      optimal_slot: validated.optimal_slot,
      requires_food: validated.requires_food,
      confidence_level: validated.confidence_level,
      evidence_sources: validated.evidence_sources,
      last_updated: Date.now(),
    };

    // Transactional write to IndexedDB
    await db.transaction('rw', db.ai_resolved_cache, async () => {
      await db.ai_resolved_cache.put(entry);
    });

    return {
      entry,
      source: 'edge_api',
      latencyMs: Math.round(performance.now() - start),
    };
  } catch (networkError) {
    // If fuzzy had a medium match, use that as fallback
    if (fuzzyResults.length > 0) {
      const match = fuzzyResults[0].item;
      const entry: AIResolvedCacheEntry = {
        user_input_string: normalizedInput,
        generic_name: match.generic_name,
        category: match.category,
        optimal_slot: 'optimal_slot' in match ? match.optimal_slot : 'WITH_MEAL',
        requires_food: 'requires_food' in match ? match.requires_food : false,
        confidence_level: 'MEDIUM',
        evidence_sources: [{
          title: 'Local Fuzzy Match (Offline Fallback)',
          summary: `Best match from local database. Network unavailable.`,
        }],
        last_updated: Date.now(),
      };

      return {
        entry,
        source: 'fuzzy_match',
        latencyMs: Math.round(performance.now() - start),
      };
    }

    return {
      error: networkError instanceof Error ? networkError.message : 'Unknown network/server error',
      source: 'all_failed',
    };
  }
}

/**
 * Check if a resolution result is successful (type guard).
 */
export function isResolutionSuccess(
  result: ResolutionResult | ResolutionError
): result is ResolutionResult {
  return 'entry' in result;
}
