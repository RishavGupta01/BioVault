# Architectural Blueprint: Clinical Interaction Engine

## 1. File & Directory Layout
src/
├── context/
│   ├── core_meds.json        # Static Medicine Dictionary
│   ├── supplements.json      # Static Supplement Dictionary
│   ├── foods.json            # Static Dietary Items
│   ├── clash_rules.json      # Static Interaction Matrices
│   └── boost_rules.json      # Static Synergistic Data
├── db/
│   └── schema.ts             # Dexie.js DB Configurations
├── store/
│   └── useTimelineStore.ts   # Zustand Primary & Shadow States
├── engine/
│   ├── fuzzyMatcher.ts       # Fuse.js Instantiation
│   ├── scanEngine.ts         # Window Scanning Module
│   └── symptomDetective.ts   # Reverse Diagnostic Systems
└── api/
├── resolve-entity/
│   └── route.ts          # Vercel Edge Multi-LLM Router
└── analyze-symptoms/
└── route.ts          # Clinical Synthesis Endpoint

## 2. Mathematical Scoring Model
The system computes an overall dynamic safety score ($S$) scaling from 0 to 100 on every layout mutation pass:

$$S = 100 - (0.40 \cdot I_{\text{abs}} + 0.25 \cdot I_{\text{crit}} + 0.20 \cdot I_{\text{gastric}} + 0.15 \cdot I_{\text{cum}})$$

* $I_{\text{abs}}$: Absorption blockages and physical binding parameters.
* $I_{\text{crit}}$: Critical clinical contraindications and drug locks.
* $I_{\text{gastric}}$: Localized gastric irritation and lining parameters.
* $I_{\text{cum}}$: Long-term compound toxicity metrics.

## 3. End-to-End Core Pipelines

### Operation 1: Write-Through Entity Resolution
1. **Fuzzy In-Memory Check:** Search text input via Fuse.js against `core_meds`, `supplements`, and `foods`. Match = Return instantly.
2. **Dynamic Table Cache Check:** Query `db.ai_resolved_cache` matching `user_input_string`. Match = Return instantly.
3. **Edge Invocation Loop:** Send raw input to `/api/resolve-entity`. Try Gemini API. Catch 429/Error -> Failover to Groq (Llama-3.1).
4. **Zod Validation Shield:** Parse response string against the `AIResolvedCacheEntry` schema definition.
5. **Local Persistent Commit:** Store verified structures inside IndexedDB: `db.ai_resolved_cache.put()`. Future lookups hit Step 2.

### Operation 2: Temporal Window Matrix Scan
1. Unpack timeline array elements and map `scheduled_time` formats into integer minutes past midnight.
2. Sort array elements chronologically ($O(N \log N)$ complexity index).
3. Execute a sliding frame scan pass ($O(N)$ scanning bounds). Track current indices and verify adjacent entries within boundary time windows (`window_minutes` property).
4. If a match occurs, evaluate the context against `clash_rules` and `boost_rules`, compute delta penalties via the scoring model, and update Zustand states.