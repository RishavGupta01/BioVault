# Engineering Rules & Behavioral Invariants

## 1. Operational Invariants (Non-Negotiable)
* **Infrastructure Budget:** Every line of code written must support a strict $0/month budget constraint. Centralized, stateful servers or persistent cloud databases (SQL/NoSQL) are completely banned.
* **Data Integrity Over Everything:** Cloud-sourced AI payloads must never touch the local IndexedDB schemas without passing through a verified Zod schema parse step.
* **Network Isolation:** Application analytics trackers, telemetry scripts, unique device ID logging, or authorization headers are strictly prohibited in outbound network streams. Edge operations must remain completely anonymous.

## 2. TypeScript & Code Quality Standards
* **Type Coverage:** 100% strict TypeScript mode. The use of `any` or `ts-ignore` is banned. Use generic parameters, rigorous union definitions, and explicit interface signatures.
* **Functional Primitives:** Prioritize pure, deterministic functions for the core calculation systems. Isolate mutations cleanly inside database transactions or explicit state mutations.
* **Asynchronous Processing:** Long-running calculations or data slicing operations exceeding 10 items must be safely managed or isolated to prevent main-thread UI blockage.

## 3. Storage & State Isolation Rules
* **The Shadow State Invariant:** Workspace simulation drag operations must always run against an isolated, cloned in-memory shadow array. Never commit dirty or unverified timeline changes directly to the primary user database table.
* **Transactional Rigor:** Every write sequence to IndexedDB via Dexie.js must explicitly declare its transactional boundaries to prevent partial data execution states.