import { z } from 'zod';

// ─── Evidence Source ─────────────────────────────────────────────────────────

export const EvidenceSourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  summary: z.string().min(1),
});

export type EvidenceSourceParsed = z.infer<typeof EvidenceSourceSchema>;

// ─── AI Resolved Cache Entry ─────────────────────────────────────────────────

export const AIResolvedCacheEntrySchema = z.object({
  user_input_string: z.string().min(1),
  generic_name: z.string().min(1),
  category: z.enum(['medicine', 'supplement', 'food']),
  optimal_slot: z.enum(['FASTING', 'WITH_MEAL', 'AFTER_MEAL', 'BEFORE_BED']),
  requires_food: z.boolean(),
  confidence_level: z.enum(['HIGH', 'MEDIUM', 'THEORETICAL']),
  evidence_sources: z.array(EvidenceSourceSchema).min(1),
  last_updated: z.number().int().positive(),
});

export type AIResolvedCacheEntryParsed = z.infer<typeof AIResolvedCacheEntrySchema>;

// ─── User Timeline Entry ────────────────────────────────────────────────────

export const UserTimelineEntrySchema = z.object({
  id: z.number().int().positive().optional(),
  profile_id: z.string().min(1),
  scheduled_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:MM format'),
  item_name: z.string().min(1),
  generic_resolved: z.string().min(1),
  vehicle: z.enum(['water', 'milk', 'coffee', 'juice', 'alcohol']),
});

export type UserTimelineEntryParsed = z.infer<typeof UserTimelineEntrySchema>;

// ─── User Profile ────────────────────────────────────────────────────────────

export const UserProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatar_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be hex color #RRGGBB'),
  created_at: z.number().int().positive(),
});

export type UserProfileParsed = z.infer<typeof UserProfileSchema>;

// ─── Edge API Request Schema ─────────────────────────────────────────────────

export const EdgeResolveRequestSchema = z.object({
  query: z.string().min(1).max(200),
});

export type EdgeResolveRequest = z.infer<typeof EdgeResolveRequestSchema>;

// ─── Edge Response Schema (LLM Output Parsing) ──────────────────────────────

export const EdgeResponseSchema = z.object({
  generic_name: z.string().min(1),
  category: z.enum(['medicine', 'supplement', 'food']),
  optimal_slot: z.enum(['FASTING', 'WITH_MEAL', 'AFTER_MEAL', 'BEFORE_BED']),
  requires_food: z.boolean(),
  confidence_level: z.enum(['HIGH', 'MEDIUM', 'THEORETICAL']),
  evidence_sources: z.array(EvidenceSourceSchema).min(1),
});

export type EdgeResponseParsed = z.infer<typeof EdgeResponseSchema>;

// ─── Symptom Analysis Request Schema ─────────────────────────────────────────

export const SymptomAnalysisRequestSchema = z.object({
  profile_id: z.string().min(1),
  symptom: z.string().min(1).max(500),
  recent_items: z.array(z.object({
    item_name: z.string(),
    generic_resolved: z.string(),
    scheduled_time: z.string(),
    vehicle: z.enum(['water', 'milk', 'coffee', 'juice', 'alcohol']),
  })),
});

export type SymptomAnalysisRequest = z.infer<typeof SymptomAnalysisRequestSchema>;

// ─── Symptom Analysis Response Schema ────────────────────────────────────────

export const SymptomAnalysisResponseSchema = z.object({
  likely_causes: z.array(z.object({
    item: z.string(),
    mechanism: z.string(),
    confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  })),
  interactions_detected: z.array(z.object({
    item_a: z.string(),
    item_b: z.string(),
    interaction_type: z.string(),
    mechanism: z.string(),
  })),
  recommendations: z.array(z.string()),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
});

export type SymptomAnalysisResponseParsed = z.infer<typeof SymptomAnalysisResponseSchema>;

// ─── Clash Rule Schema ──────────────────────────────────────────────────────

export const ClashRuleSchema = z.object({
  type: z.enum(['CRITICAL_BLOCK', 'WARNING', 'MILD']),
  severity: z.number().min(0).max(100),
  mechanism: z.string().min(1),
  resolution: z.string().min(1),
  window_minutes: z.number().int().positive(),
  penalty_abs: z.number().min(0),
  penalty_crit: z.number().min(0),
  penalty_gastric: z.number().min(0),
  penalty_cum: z.number().min(0),
});

export type ClashRuleParsed = z.infer<typeof ClashRuleSchema>;

// ─── Boost Rule Schema ──────────────────────────────────────────────────────

export const BoostRuleSchema = z.object({
  type: z.enum(['SYNERGY', 'ENHANCEMENT', 'PROTECTIVE']),
  mechanism: z.string().min(1),
  benefit: z.string().min(1),
  optimal_timing: z.string().min(1),
  score_bonus: z.number().min(0),
});

export type BoostRuleParsed = z.infer<typeof BoostRuleSchema>;
