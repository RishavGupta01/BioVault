# you asked

message time: 2026-06-14 11:25:45

now give a prompt for my developer agent, explain each and everything to that in details, all the architecture, flow and everything, miss no details and procedures

---

# gemini response

Here is a comprehensive, production-grade master prompt designed to be fed into your developer agent (e.g., Cursor, Claude Engineer, Auto-GPT, or a specialized software development agent). It translates the entire system architecture, operations, and constraints into deterministic engineering directives.

---

# Developer Agent Master Prompt

```markdown
You are acting as a Lead Software Architect and Principal Software Engineer. Your task is to implement from scratch a production-ready, enterprise-grade application named **Clinical Interaction Engine**.

### ─── SYSTEM CORE VISION & CONSTRAINT ───
This application must scale to thousands of users with a strict $0/month infrastructure cost. To achieve this, you must reject traditional client-server-database paradigms. This is a Local-First, Edge-Assisted Architecture. The user's browser acts as the primary compute cluster and database engine, while stateless cloud edge functions function strictly as anonymous, free-tier fallbacks.

### ─── TECH STACK MANDATE ───
- Frontend Framework: React (Next.js App Router or Vite) deployed on Vercel/Netlify Free Tier.
- Local Database Engine: IndexedDB wrapped with Dexie.js for transactional ACID compliance.
- UI State Management: Zustand + React Signals for sub-16ms layout re-renders.
- Fuzzy Search Engine: Fuse.js (lightweight in-memory lexical matching).
- Validation Layer: Zod (runtime schema enforcement on the edge and client).
- Cloud Fallback: Vercel Serverless/Edge Functions consuming Gemini API (Free Tier) and Groq (Llama-3.1 Free Tier) as a failover.
- Layout Strategy: Progressive Web App (PWA) with a Cache-First Service Worker for complete offline function.

---

## I. FILE STATED TARGET DIRECTORY STRUCTURE
Ensure your workspace strictly mirrors this modular layout:
├── src/
│   ├── context/
│   │   ├── core_meds.json
│   │   ├── supplements.json
│   │   ├── foods.json
│   │   ├── clash_rules.json
│   │   └── boost_rules.json
│   ├── db/
│   │   └── schema.ts           # Dexie.js database initialization
│   ├── store/
│   │   └── useTimelineStore.ts # Zustand timeline and shadow-simulation state
│   ├── engine/
│   │   ├── fuzzyMatcher.ts     # Fuse.js configuration
│   │   ├── scanEngine.ts       # Temporal Window Matrix Scan & Scoring
│   │   └── symptomDetective.ts # Reverse stomach-ache logic
│   └── api/
│       ├── resolve-entity/
│       │   └── route.ts        # Vercel Edge function with Multi-LLM failover
│       └── analyze-symptoms/
│           └── route.ts        # Edge function for clinical synthesis
```

---

## II. DATABASE SCHEMA & DATA LAYOUT SPECIFICATIONS

### 1. Versioned Modular Static Matrix Slices
The local knowledge base must be split into static JSON chunks to preserve a tiny bundle footprint. Treat these arrays as an immutable graph loaded into memory on startup.

Structure layout template for rules matching (`clash_rules.json`):
```json
{
  "clash_rules": {
    "levothyroxine": {
      "calcium_carbonate": {
        "type": "CRITICAL_BLOCK",
        "mechanism": "Calcium binds to levothyroxine in the GI tract, reducing absorption by up to 30%.",
        "resolution": "Shift Calcium at least 4 hours away from your Thyroid medication.",
        "window_minutes": 240
      }
    }
  }
}
```

### 2. Client-Side Persistent Database Schema (`src/db/schema.ts`)
Implement the exact database initialization utilizing `Dexie.js`:

```typescript
import Dexie, { type Table } from 'dexie';

export interface AIResolvedCacheEntry {
  user_input_string: string;    // Primary Key (e.g., "synthroid 50mcg")
  generic_name: string;         // Indexed reference
  category: 'medicine' | 'supplement' | 'food';
  optimal_slot: 'FASTING' | 'WITH_MEAL' | 'AFTER_MEAL' | 'BEFORE_BED';
  requires_food: boolean;
  confidence_level: 'HIGH' | 'MEDIUM' | 'THEORETICAL';
  evidence_sources: Array<{ title: string; url?: string; summary: string }>;
  last_updated: number;         // Unix timestamp for tracking cache eviction
}

export interface UserTimelineEntry {
  id?: number;                  // Auto-increment primary key
  profile_id: string;           // Isolation partition key for Family Mode
  scheduled_time: string;       // Absolute chronological time string (HH:MM)
  item_name: string;            // Original user input raw text
  generic_resolved: string;     // Foreign key resolution to static matrix/cache
  vehicle: 'water' | 'milk' | 'coffee' | 'juice' | 'alcohol';
}

class ClinicalInteractionEngineDB extends Dexie {
  ai_resolved_cache!: Table<AIResolvedCacheEntry>;
  user_timeline!: Table<UserTimelineEntry>;

  constructor() {
    super('ClinicalInteractionEngineDB');
    // Prefix with ++ for auto-increment keys
    this.version(2).stores({
      ai_resolved_cache: 'user_input_string, generic_name, category, confidence_level',
      user_timeline: '++id, profile_id, scheduled_time, generic_resolved'
    });
  }
}

export const db = new ClinicalInteractionEngineDB();
```

---

## III. CORE ALGORITHMIC OPERATIONS & PIPELINES

You must implement the following 4 core operations exactly as engineered:

### Operation 1: Write-Through Entity Resolution Pipeline
When a user types an item string (e.g., *"Thyronorm 25mcg"*) into the search field and submits:
1. **Fuzzy Lexical Triage:** Run the lowercase input through `fuse.js` against the keys of the localized memory-mapped JSON files (`core_meds.json`, etc.). If a high-confidence match is discovered, return metadata instantly (<2ms) and halt network requests.
2. **Persistent Index Lookup:** If a static miss occurs, query the IndexedDB `ai_resolved_cache` table. If found, return the cached payload instantly (<5ms) and halt network requests.
3. **Edge Network Fallback:** If a local miss occurs, trigger an asynchronous POST to `/api/resolve-entity`. The Edge function must first hit the Gemini API (Free Tier). If an HTTP 429 rate limit or timeout is encountered, transparently intercept the failure and router-switch the request to Groq (Llama-3.1).
4. **Edge Schema Validation Gate:** Pass the incoming text generation from the LLM provider through a strict **Zod** layout parser. The schema must enforce: `generic_name`, `optimal_slot`, `confidence_level`, and `evidence_sources` (with medical citation descriptions from FDA/PubMed). If invalid, throw a structured format exception to block local table pollution.
5. **Transactional Client Indexing:** Upon receiving a valid payload from the edge, save it within a localized transaction to IndexedDB: `db.ai_resolved_cache.put(payload)`. Update layout states via Zustand. Any identical subsequent query must hit the step 2 persistent index instantly, guaranteeing permanent $0 API compute overhead.

### Operation 2: Temporal Window Matrix Scan & Scoring Engine
Every timeline mutation or drag-and-drop state readjustment must fire an automated clinical re-evaluation pass executing inside an allocation buffer of **under 16ms** to prevent viewport latency.

Implement the dynamic bio-availability mathematical formula to compute an absolute wellness score ($S$) scaling from 0 to 100:

$$S = 100 - (0.40 \cdot I_{\text{abs}} + 0.25 \cdot I_{\text{crit}} + 0.20 \cdot I_{\text{gastric}} + 0.15 \cdot I_{\text{cum}})$$

Where:
- $I_{\text{abs}}$ = Accumulated coefficient of drug/nutrient absorption blockages.
- $I_{\text{crit}}$ = Fatal/High-risk clinical contraindications.
- $I_{\text{gastric}}$ = Localized stomach lining irritation alerts.
- $I_{\text{cum}}$ = Long-term chemical compound cumulative load index.

#### Procedural Scanning Logic Requirements:
1. **Chronological Sorting Pass:** Sort the active client timeline vector by converting the `scheduled_time` (HH:MM string) into absolute integer minutes from midnight ($O(N \log N)$ compute cycle).
2. **Sliding Evaluation Window Pass:** Use a single linear pass ($O(N)$ scanning bounds) looping across sorted items. For any active item, look forward to subsequent items. If the absolute time delta $\Delta t = |t_A - t_B| < \text{window\_minutes}$ derived from `clash_rules`, compute a rule cross-reference check.
3. **Conflict Mapping Execution:** Look up cross-matches within `clash_rules[itemA][itemB]`. If matched, construct an object tracking the conflict vector, calculate the numerical score reduction based on type severity, and pass the conflict alert object to the Zustand state repository for instant reactive UI updates.
4. **Mechanical Stomach Audit:** For every sequence element, evaluate if `requires_food === true` matches against designated fasting slots. If matching, append an acute gastric risk factor vector and deduct points.

### Operation 3: Reverse "Stomach-Ache Detective" Flow
When the user triggers the acute diagnostic tool:
1. Query the local IndexedDB `user_timeline` for entries where `scheduled_time` falls within the previous 180 absolute minutes.
2. Execute a local Boolean Intersect Pass across the isolated elements against immediate gastric irritant lists (e.g., *Zinc on an empty stomach* or *NSAIDs mixed with alcohol*). If matches are identified, skip cloud requests and instantly fire the diagnostics visual layout.
3. If local pattern arrays display zero warnings, drop user telemetry indexes, isolate only raw compound text strings, and invoke the stateless endpoint `/api/analyze-symptoms`.
4. Parse the LLM's analytical mechanical explanations and pipe the clean semantic data arrays to the viewport, bypassing backend databases or analytics trackers.

### Operation 4: In-Browser "What-If" Workspace Simulator Loop
To handle immediate layout drag actions smoothly on consumer devices:
1. **State Duplication:** When an element drag action begins, intercept the event and clone the operational Zustand timeline slice into an uncommitted "Shadow" memory array.
2. **Shadow Pass Tracking:** As the user hovers the element across a layout window or changes an intake vehicle, feed the shadow array to the Operation 2 Matrix Scan Module. 
3. **Micro-Delta Notifications:** Extrapolate score differentials and push transient layout variables (e.g., "+12 Optimal Absorption Boost" or "-20 Conflict Warning") to hover labels adjacent to the cursor tracker without changing the actual data layer.
4. **Commit vs. Eviction Lifecycle:** If dropped successfully, commit the shadow array to the actual IndexedDB table and call a full system refresh. If aborted, erase the shadow array memory vector, resetting the layout matrix without structural DOM lag.

---

## IV. HARDENING & EDGE GATEWAY GUARDRAILS
1. **Zero-Tracking Compliance:** Do not log authorization markers, unique device identifiers, cookie tokens, or tracking parameters within network streams passing to Edge Functions or AI endpoints.
2. **Zod Parsing Sanity Guardrail:** Write strict validation objects matching the `AIResolvedCacheEntry` type signature for incoming edge function outputs. Fall back gracefully to local default entities if the structure fails validation.
3. **PWA Offline Architecture:** Set up a clean Service Worker strategy using Workbox or native Web APIs caching the core matrix slices on initial application deployment, enabling completely offline clinical scoring.

---

### NEXT STEP INSTRUCTION
Build out the application core logic sequentially. Begin by generating the **Dexie.js database schema layer (`src/db/schema.ts`)** along with the **Zustand store layout (`src/store/useTimelineStore.ts`)** to set up our application's state management. 

Confirm your tracking system capabilities, request clarification where needed, and begin writing clean, fully typed TypeScript code block components immediately.
```
---

### Why this prompt works for Developer Agents:
* **Context Preservation:** Explicitly maps out every architectural layer established in the primary project configurations.
* **Exact Schemas:** Provides standard TypeScript interfaces and fields matching your data requirements.
* **Deterministic Math & Engine Logic:** Translates the abstract requirements into precise programmatic specifications ($O(N \log N)$ sorting followed by a rolling linear evaluation scan).
* **Step-by-Step Directives:** Eliminates ambiguity, detailing precisely what to look up first (Fuzzy -> Cache -> Multi-LLM Edge).