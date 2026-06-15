import { db } from '@/db/schema';
import type { UserTimelineEntry } from '@/db/schema';
import { timeToMinutes } from '@/engine/scanEngine';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GastricWarning {
  item_name: string;
  generic_name: string;
  mechanism: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  scheduled_time: string;
}

export interface InteractionWarning {
  item_a: string;
  item_b: string;
  mechanism: string;
  interaction_type: string;
}

export interface DiagnosticResult {
  warnings: GastricWarning[];
  interactions: InteractionWarning[];
  recent_items: UserTimelineEntry[];
  needs_ai_analysis: boolean;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
}

// ─── Known Gastric Irritants ─────────────────────────────────────────────────

const GASTRIC_IRRITANTS: Record<string, { mechanism: string; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }> = {
  'ibuprofen': { mechanism: 'NSAIDs inhibit COX-1, reducing protective prostaglandins in the gastric mucosa.', confidence: 'HIGH' },
  'aspirin': { mechanism: 'Aspirin directly irritates gastric lining and inhibits COX-1 protective pathways.', confidence: 'HIGH' },
  'naproxen': { mechanism: 'NSAIDs reduce gastric mucosal protection via COX inhibition.', confidence: 'HIGH' },
  'diclofenac': { mechanism: 'Potent NSAID causing direct gastric mucosal irritation.', confidence: 'HIGH' },
  'indomethacin': { mechanism: 'Strong COX inhibition leading to significant GI mucosal damage.', confidence: 'HIGH' },
  'piroxicam': { mechanism: 'Long-acting NSAID with high GI toxicity profile.', confidence: 'HIGH' },
  'meloxicam': { mechanism: 'Preferential COX-2 inhibitor but still causes GI irritation.', confidence: 'MEDIUM' },
  'iron_sulfate': { mechanism: 'Iron salts are directly irritating to the GI mucosa, causing nausea and epigastric pain.', confidence: 'HIGH' },
  'ferrous_sulfate': { mechanism: 'Iron salts cause oxidative damage to GI epithelium.', confidence: 'HIGH' },
  'zinc_sulfate': { mechanism: 'Zinc on empty stomach causes nausea and gastric distress in most patients.', confidence: 'HIGH' },
  'zinc': { mechanism: 'Zinc supplements are known gastric irritants when taken without food.', confidence: 'HIGH' },
  'potassium_chloride': { mechanism: 'Potassium supplements can cause localized GI erosion.', confidence: 'HIGH' },
  'metformin': { mechanism: 'Metformin causes GI side effects including nausea, diarrhea, and abdominal pain.', confidence: 'HIGH' },
  'doxycycline': { mechanism: 'Tetracyclines cause esophageal and gastric irritation if not taken with adequate water.', confidence: 'HIGH' },
  'erythromycin': { mechanism: 'Macrolides stimulate motilin receptors causing GI cramping and nausea.', confidence: 'HIGH' },
  'azithromycin': { mechanism: 'Macrolide antibiotic that can cause nausea and abdominal pain.', confidence: 'MEDIUM' },
  'prednisone': { mechanism: 'Corticosteroids reduce mucosal defense mechanisms and increase acid secretion.', confidence: 'HIGH' },
  'prednisolone': { mechanism: 'Corticosteroids impair gastric mucosal protection.', confidence: 'HIGH' },
  'bisphosphonates': { mechanism: 'Direct chemical irritation of esophageal and gastric mucosa.', confidence: 'HIGH' },
  'alendronate': { mechanism: 'Bisphosphonate causing severe esophageal/gastric irritation if not taken properly.', confidence: 'HIGH' },
  'vitamin_c': { mechanism: 'High-dose ascorbic acid increases gastric acidity.', confidence: 'MEDIUM' },
  'ascorbic_acid': { mechanism: 'Acidic vitamin that can irritate stomach lining at high doses.', confidence: 'MEDIUM' },
  'caffeine': { mechanism: 'Caffeine stimulates gastric acid secretion and relaxes lower esophageal sphincter.', confidence: 'MEDIUM' },
  'coffee': { mechanism: 'Coffee increases gastric acid production and can exacerbate GERD.', confidence: 'MEDIUM' },
};

// ─── Dangerous Combinations ─────────────────────────────────────────────────

const DANGEROUS_COMBOS: Array<{ items: string[]; mechanism: string; type: string }> = [
  { items: ['ibuprofen', 'alcohol'], mechanism: 'NSAIDs + alcohol synergistically damage gastric mucosa and increase GI bleeding risk.', type: 'CRITICAL' },
  { items: ['aspirin', 'alcohol'], mechanism: 'Aspirin + alcohol greatly increases risk of GI hemorrhage.', type: 'CRITICAL' },
  { items: ['naproxen', 'alcohol'], mechanism: 'NSAIDs + alcohol cause additive gastric mucosal injury.', type: 'CRITICAL' },
  { items: ['metformin', 'alcohol'], mechanism: 'Alcohol impairs hepatic gluconeogenesis; combined with metformin increases lactic acidosis risk.', type: 'CRITICAL' },
  { items: ['ibuprofen', 'aspirin'], mechanism: 'Combined NSAID use dramatically increases GI ulcer and bleeding risk.', type: 'WARNING' },
  { items: ['iron_sulfate', 'calcium_carbonate'], mechanism: 'Calcium inhibits iron absorption; combined intake causes GI distress.', type: 'WARNING' },
  { items: ['prednisone', 'ibuprofen'], mechanism: 'Corticosteroid + NSAID combination greatly increases GI ulcer risk.', type: 'CRITICAL' },
  { items: ['doxycycline', 'calcium_carbonate'], mechanism: 'Calcium chelates tetracyclines, reducing absorption and causing GI symptoms.', type: 'WARNING' },
];

// ─── Core Detective Logic ───────────────────────────────────────────────────

/**
 * Investigate potential causes of stomach discomfort by analyzing
 * the timeline entries from the last 180 minutes.
 * 
 * Step 1: Query local IndexedDB for recent entries
 * Step 2: Boolean intersect against known gastric irritants
 * Step 3: Check for dangerous combinations
 * Step 4: Return flag for edge API if no local matches
 */
export async function investigateStomachAche(
  profileId: string
): Promise<DiagnosticResult> {
  // Step 1: Calculate time window (last 180 minutes)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const windowStart = currentMinutes - 180;

  // Query all entries for this profile
  const allEntries = await db.user_timeline
    .where('profile_id')
    .equals(profileId)
    .toArray();

  // Filter to entries within the last 180 minutes
  const recentItems = allEntries.filter((entry) => {
    const entryMinutes = timeToMinutes(entry.scheduled_time);
    return entryMinutes >= windowStart && entryMinutes <= currentMinutes;
  });

  const warnings: GastricWarning[] = [];
  const interactions: InteractionWarning[] = [];

  // Step 2: Boolean intersect against gastric irritant list
  for (const entry of recentItems) {
    const genericLower = entry.generic_resolved.toLowerCase();
    const irritant = GASTRIC_IRRITANTS[genericLower];

    if (irritant) {
      warnings.push({
        item_name: entry.item_name,
        generic_name: entry.generic_resolved,
        mechanism: irritant.mechanism,
        confidence: irritant.confidence,
        scheduled_time: entry.scheduled_time,
      });
    }

    // Check if taken with alcohol (vehicle)
    if (entry.vehicle === 'alcohol' && GASTRIC_IRRITANTS[genericLower]) {
      warnings.push({
        item_name: entry.item_name,
        generic_name: entry.generic_resolved,
        mechanism: `${entry.generic_resolved} taken with alcohol significantly increases gastric irritation risk.`,
        confidence: 'HIGH',
        scheduled_time: entry.scheduled_time,
      });
    }
  }

  // Step 3: Check for dangerous combinations among recent items
  const recentGenerics = recentItems.map((e) => e.generic_resolved.toLowerCase());
  // Also include vehicles as pseudo-items for combo checking
  const recentVehicles = recentItems
    .filter((e) => e.vehicle === 'alcohol' || e.vehicle === 'coffee')
    .map((e) => e.vehicle);
  const allRecentItems = [...recentGenerics, ...recentVehicles];

  for (const combo of DANGEROUS_COMBOS) {
    const allPresent = combo.items.every((item) =>
      allRecentItems.some((recent) => recent.includes(item))
    );
    if (allPresent) {
      interactions.push({
        item_a: combo.items[0],
        item_b: combo.items[1],
        mechanism: combo.mechanism,
        interaction_type: combo.type,
      });
    }
  }

  // Step 4: Determine severity and whether AI analysis is needed
  const hasHighConfidence = warnings.some((w) => w.confidence === 'HIGH');
  const hasCriticalInteraction = interactions.some((i) => i.interaction_type === 'CRITICAL');
  const needsAI = warnings.length === 0 && interactions.length === 0;

  let severity: 'MILD' | 'MODERATE' | 'SEVERE';
  if (hasCriticalInteraction) severity = 'SEVERE';
  else if (hasHighConfidence || interactions.length > 0) severity = 'MODERATE';
  else severity = 'MILD';

  return {
    warnings,
    interactions,
    recent_items: recentItems,
    needs_ai_analysis: needsAI,
    severity,
  };
}
