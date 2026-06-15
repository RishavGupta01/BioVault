# BioVault: Production-Grade Clinical Interaction Engine
## Professional Engineering & Project Report

---

### Executive Summary

BioVault is a local-first, edge-assisted Progressive Web Application (PWA) designed to analyze, score, and monitor interactions between medications, supplements, and dietary items. In modern clinical management, adverse drug events (ADEs) and drug-nutrient-food interactions account for significant therapeutic failure rates and hospitalizations. BioVault addresses this problem by serving as a zero-infrastructure-cost, zero-tracking, clinical safety compiler running completely on the client’s browser.

Through chronological timeline sorting, temporal sliding window matrices, and fallback multi-LLM Edge endpoints, BioVault evaluates scheduled intakes under a 16ms rendering budget. The underlying database features a highly scaled clinical matrix containing **470 medications**, **405 supplements**, and **433 food items**, evaluating against **160 clash rules** and **71 synergy rules**.

---

### 1. Problem Definition & Clinical Context

In therapeutic regimens, clinical outcomes are highly sensitive to scheduling and vehicle co-ingestion:
1. **Absorption Blockages ($I_{\text{abs}}$)**: Divalent cations (e.g., calcium in dairy/supplements) chelate fluoroquinolone antibiotics (e.g., Ciprofloxacin) or bisphosphonates (e.g., Alendronate) in the gastrointestinal tract, dropping bioavailability by up to 70%.
2. **Critical Contraindications ($I_{\text{crit}}$)**: Concomitant use of nitrovasodilators (e.g., Nitroglycerin) with PDE5 inhibitors (e.g., Sildenafil) causes catastrophic nitric-oxide-mediated vasodilation leading to severe hypotension. Similarly, linezolid co-administration with SSRIs risks fatal Serotonin Syndrome.
3. **Local Gastric Irritation ($I_{\text{gastric}}$)**: Taking non-steroidal anti-inflammatory drugs (NSAIDs) with ethanol or on fasting slots increases local mucosal erosion and bleeding risks.
4. **Metabolic Interference ($I_{\text{cum}}$)**: Grapefruit juice inhibits intestinal CYP3A4, causing dangerous accumulation of statins (e.g., Atorvastatin, Simvastatin).

BioVault computes these risks in real-time, providing proactive warnings and actionable resolutions.

---

### 2. Software Architecture Specification

To maintain a strict **$0/month infrastructure cost** while preserving maximum privacy, BioVault employs a **Local-First, Edge-Assisted Architecture**:

```
                 +---------------------------------------------+
                 |             User UI Page Views              |
                 +----------------------+----------------------+
                                        |
                                        v
                 +----------------------+----------------------+
                 |          Zustand Global Store               |
                 +----------+-----------------------+----------+
                            |                       |
                  (Reads / Simulation)          (Commits)
                            |                       |
                            v                       v
                 +----------+-----------+  +--------+----------+
                 |    Shadow State      |  | Dexie.js Local DB |
                 |  Simulation Vector   |  |   (IndexedDB)     |
                 +----------+-----------+  +-------------------+
                            |
                            v
                 +----------+-----------+
                 | Temporal Scan Engine |
                 +----------------------+
```

#### 2.1 Storage & Cache Engine (Dexie.js)
All user data remains entirely client-side inside IndexedDB, compartmentalized via Dexie.js. 
* **User Timeline Table (`user_timeline`)**: Tracks intakes chronologically by profile. Key indexes: `++id`, `profile_id`, `scheduled_time`, `generic_resolved`.
* **AI Resolved Cache (`ai_resolved_cache`)**: Minimizes external edge functions and API costs. Once an unrecognized entity (e.g., a branded medicine) is resolved by the Edge AI router, it is cached permanently. Subsequent identical queries resolve locally in `<5ms` with zero network overhead.

#### 2.2 Edge-Assisted AI Triage with Multi-LLM Failover
When a search query misses the static files and local cache:
1. **Write-Through Resolution Request**: Trigger a POST to `/api/resolve-entity`.
2. **Primary Edge Execution**: Connect to Gemini API (Free Tier).
3. **Failover Loop**: If Gemini responds with a `429` (rate limit) or fails, the router intercepts and redirects to Groq Llama-3.1 (Free Tier).
4. **Zod Validation Shield**: Outputs are validated against the `AIResolvedCacheEntry` Zod schema. If the JSON structure is invalid, it is discarded, securing database integrity.

---

### 3. Core Algorithms & Mathematical Model

#### 3.1 Wellness Safety Score ($S$)
Every timeline mutation triggers an evaluation of the overall wellness safety score:

$$S = 100 - (0.40 \cdot I_{\text{abs}} + 0.25 \cdot I_{\text{crit}} + 0.20 \cdot I_{\text{gastric}} + 0.15 \cdot I_{\text{cum}})$$

* **$I_{\text{abs}}$** (Absorption Penalty): Accumulated weight of chelation, binding, and vehicle conflicts.
* **$I_{\text{crit}}$** (Critical Penalty): High-risk drug-drug/supplement contraindications.
* **$I_{\text{gastric}}$** (Gastric Penalty): Mucosal risks (fasting vs food-requirement conflicts).
* **$I_{\text{cum}}$** (Cumulative Penalty): Metabloic inhibitor risks.

#### 3.2 Temporal sliding Window Matrix Scan
To evaluate conflicts within a strict **sub-16ms budget**, the system avoids naive $O(N^2)$ cross-referencing:
1. **Sort Phase**: Chronological sort of the user’s scheduled timeline using integer minutes past midnight: $O(N \log N)$.
2. **Scan Phase**: Linear sliding-frame pass checking forward items within a maximum 6-hour delta ($O(N)$ scanning bounds).
3. **Lookup Phase**: Checks matching conflict records in `clash_rules[itemA][itemB]`.
4. **Gastric & Boost Audits**: Identifies food requirements and synergistic combinations.

---

### 4. Data Topology & Clinical Registers

The application uses five unified, static clinical database registers:

| File Name | Record Count | Focus |
| :--- | :--- | :--- |
| `core_meds.json` | **470** | Generic medicines, brand names, drug classes, common dosages, absorption notes. |
| `supplements.json` | **405** | Vitamins, minerals, amino acids, botanicals, enzymes, sports nutrition. |
| `foods.json` | **433** | Fruits, vegetables, dairy, proteins, caffeinated drinks, fermented items. |
| `clash_rules.json` | **160** | Interaction severity, mechanism details, clinical resolutions, timing windows. |
| `boost_rules.json` | **71** | Absorption enhancements, synergy bonuses, optimal administration timings. |

---

### 5. Security & Privacy Audit

To guarantee complete privacy, the architecture enforces a **Zero-Tracking Compliance**:
* **Outbound Isolation**: Edge functions receive only the raw query string (e.g. `"Motrin 400mg"`) or symptom description. No authorization tokens, IP logs, cookies, or unique device identifiers (UUIDs) are passed to AI endpoints.
* **IndexedDB Isolation**: The client database schema does not synchronize with any cloud backup unless manually export, keeping user health profiles entirely in-browser.

---

### 6. Verification & Build Audits

* **TypeScript Type Coverage**: Verified via `npx tsc --noEmit` with **0 errors**.
* **Production Compilation**: Verified via `npm run build` showing successful static/edge code bundling.
* **PWA Capability**: Offline caching confirmed through native service worker registrations intercepting fetch queries.
