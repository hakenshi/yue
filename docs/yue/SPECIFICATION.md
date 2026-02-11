# Yue v2.0 - Technical Specification (SWE-First, Local-First, No Telemetry)

Status: DRAFT (alignment)
Audience: agentic coding agents and contributors (not end-users)

IMPORTANT reference rule

- When we say "OpenCode", we mean: https://github.com/anomalyco/opencode
- Ignore similarly named Go projects; they are unrelated.

---

## 0. Non-Negotiables (MUST)

- MUST be SWE-first: requirements, architecture, boundaries, verification, documentation.
- MUST NOT be vibe coding. Optimize for correctness and maintainability.
- MUST minimize babysitting:
  - trivial framework/style mistakes must be prevented by deterministic governance, not user repetition.
- MUST have maximum transparency:
  - user can inspect what Yue read/ran/changed/validated and why.
- MUST be local-first and privacy-first:
  - no telemetry/analytics/phone-home.
  - no cloud sync by default (sync is OFF by default, explicit opt-in only).
- MUST treat clients as untrusted for sensitive state:
  - balances/entitlements/limits are server-side only (Nightly/Lunar).

---

## 1. Product Goals

### 1.1 Primary goals

- Deliver a terminal-first agent that produces clean code aligned with project conventions.
- Provide accounting visibility (priority feature):
  - token usage per project folder, per day, per provider, and totals.
- Provide a cloud API for monetization:
  - PAYG provider "Yue Nightly"
  - subscription tiers "Yue Lunar" behind waitlist/flags

### 1.2 Explicit anti-goals

- No silent bulk refactors.
- No dependency invention.
- No "load the entire repo into context" behavior.

---

## 2. Stack & Monorepo Architecture (TurboRepo + Bun)

### 2.1 Stack (fixed for this project)

- Orchestration: Turborepo
- Runtime: Bun
- Language: TypeScript (strict)
- Cloud API: Elysia (TypeBox-first)
- TUI: OpenTUI + Solid
- Landing/docs/marketplace page: Astro
- Desktop UI: Tauri (later)
- Local `yue serve` runtime+UI: later (not priority)

### 2.2 Target monorepo layout (planned)

- apps/
  - tui/ # priority
  - api/ # priority (cloud: billing, Nightly, Lunar waitlist)
  - landing/ # priority (docs + marketplace page)
  - server/ # later (local runtime + serve UI)
  - desktop/ # later
  - web/ # later (Solid SPA UI, served by apps/server)
- packages/
  - core/ # agent runtime + commands + tool contracts + shared logic
  - types/ # shared types (commands/tools/session/usage)
  - policy/ # policy engine + validators runtime (planned)
  - context/ # context engine (planned)
  - obs/ # flight recorder + trace model (planned)

### 2.3 Dev commands (conceptual)

- Root `bun run dev` SHOULD start prioritized apps (tui + api + landing).
- Desktop dev MUST be a separate command.
- apps/server MUST be a separate command and not prioritized.

---

## 3. Providers (Core, NOT Extensions) (MUST)

### 3.1 Provider system

- Providers are first-class core capabilities (like OpenCode).
- BYOK providers:
  - user supplies keys locally (env/config/local credential store).
- Cloud provider:
  - Yue Nightly (PAYG), opt-in, requires account (billing).

### 3.2 Provider invariants

- MUST never trust client-sent balances/entitlements/limits.
- MUST separate:
  - local token accounting ledger (display/convenience)
  - server-side billing ledger (authoritative for charging).

---

## 4. Accounts & Privacy

### 4.1 Account requirements

- TUI BYOK usage MUST NOT require an account.
- Account MAY be required for cloud features:
  - Yue Nightly (billing)
  - Yue Lunar waitlist
  - future sync (opt-in)

### 4.2 Telemetry policy

- MUST NOT implement any telemetry/analytics.
- MUST NOT collect BYOK usage in the cloud.
- Cloud MUST store only what is necessary for billing/security when user opts into Nightly/Lunar.

---

## 5. Token Tracking (PRIORITY FEATURE)

### 5.1 Requirements (MUST)

- MUST track token usage:
  - per project (folder)
  - per day
  - per provider and model (where available)
  - totals (all projects)
- MUST be local-first and store no prompt/code payload.
- MUST be inspectable from TUI.
- MUST have stable project identification via user-defined folder mapping.

### 5.2 Project definition: manual mapping (MUST)

- Project mapping file MUST exist (project-local): `./.yue/projects.yml`.
- Autodetection MAY exist as suggestions, but source of truth is `projects.yml`.

Example `./.yue/projects.yml`:

```yml
version: 1
projects:
  - id: apps_api
    name: api
    root: apps/api
  - id: apps_tui
    name: tui
    root: apps/tui
  - id: packages_core
    name: core
    root: packages/core
exclude:
  - "**/node_modules/**"
  - "third_party/**"
```

### 5.3 Usage ledger data model (MUST)

- MUST record events (append-only), without storing content:
  - timestamp
  - projectId
  - providerId
  - modelId
  - inputTokens/outputTokens (optional reasoning/cache)
  - sessionId (drilldown)
- MUST support daily rollups.

Recommended local paths (XDG-friendly):

- `~/.local/share/yue/usage/ledger.jsonl` (events)
- `~/.local/share/yue/usage/daily/<projectId>/<YYYY-MM-DD>.toon` (rollups)
- `~/.local/share/yue/usage/index.toon` (projects + metadata snapshot)

### 5.4 Queries / commands (MUST)

- TUI commands:
  - `/tokens` (current project, today + total today)
  - `/tokens day|week|month|all`
  - `/tokens --by project|provider|day`
  - `/tokens --project <id|name>`

---

## 6. Session Storage & Context Compilation (Anti Context-Rot)

### 6.1 Goals

- Avoid re-sending huge histories every turn.
- Keep full local auditability while feeding the LLM only compact, relevant state.

### 6.2 Source of truth: event log (MUST)

- Each session MUST be stored as append-only events:
  - `sessions/<sessionId>/events.jsonl`

Event types (examples):

- `message.user`
- `message.assistant`
- `tool.call`
- `tool.result`
- `decision.proposed`
- `decision.confirmed`
- `compaction.completed`
- `artifact.created`

### 6.3 Artifacts (MUST)

- Large tool outputs MUST be stored as artifacts and referenced from events:
  - `sessions/<sessionId>/artifacts/<artifactId>.<ext>`

### 6.4 Compiled prompt state (TOON) (MUST)

- Yue MUST generate compact compiled state for LLM consumption:
  - `sessions/<sessionId>/state.toon`

state.toon MUST include:

- current goal/task (if any)
- canonical summary
- confirmed decisions/constraints
- open threads
- recent window (bounded)
- context registry snapshot (docs/chunks + budget)
- touched files summary (bounded)

### 6.5 TOON usage policy

- TOON MUST be used for LLM-only compiled state (machine input).
- YAML/MD remain for human-edited config/docs.
- state.toon MUST be derived and not manually edited.

---

## 7. Governance (Policy Engine) (Planned Core)

### 7.1 Purpose

- Prevent common LLM mistakes deterministically.
- Replace repeated user correction with enforcement.

### 7.2 Policy layers (MUST)

- defaults < global < project < session

### 7.3 Actions (MUST)

- deny: hard block
- ask: block and ask user a decision
- warn: allow but record
- allow: proceed

### 7.4 Gates (MUST in build mode)

- Preflight (read-only): verify before assuming.
- Validate (diff validators): enforce project/stack rules.
- Verify: typecheck/tests when applicable.
- Polish pass: bounded cleanup.

---

## 8. Documentation System (ADR, Tracker, Docs)

### 8.1 Requirements

- Yue MUST support recording decisions and progress.
- `/adr` MUST exist for architecture decisions.
- Everything the user wants to keep MAY become a document.

### 8.2 Storage

- ADRs: `./.yue/adrs/*.md`
- Other docs: `./.yue/docs/*.md`
- Tracker: `./.yue/tracker.yml`

### 8.3 Skill + MCP boundaries (MUST)

- Skill files are documentation/procedure for agent behavior.
- Skills MUST NOT be treated as persistence, source of truth, or domain runtime.
- Backlog source of truth is the running local backlog application/API.
- MCP is the required communication channel for agent backlog operations.
- If MCP is unavailable, backlog operations are unavailable by design (no internal fallback backlog engine).

---

## 9. Landing + Docs + Marketplace Page (Astro)

### 9.1 Landing

- MUST host documentation.
- MUST include marketplace page (catalog + downloads), like OpenCode.
- MUST NOT include telemetry/analytics.

### 9.2 Marketplace (v1)

- First-party only.
- Distribution preference: GitHub Releases.
- Extension packaging/signing details are deferred.

---

## 10. Cloud API (Railway) (Priority)

### 10.1 Deployment

- Platform: Railway
- Database: Postgres (Railway managed)

### 10.2 Auth

- Better Auth is preferred.

### 10.3 Payments

- Stripe required.
- Webhooks MUST be verified.
- Server MUST maintain billing ledger; client is untrusted.

---

## 11. Monetization

### 11.1 Yue Nightly (PAYG)

- Product: PAYG credits/top-up
- Provider: nightly
- Usage metering MUST store only billing metadata by default (tokens/model/timestamps/request ids).

### 11.2 Yue Lunar (tiers, blocked access)

- Name: Yue Lunar
- Tiers (display):
  - Shingetsu (新月) - Free
  - Mikazuki (三日月) - $20
  - Hangetsu (半月) - $100
  - Mangetsu (満月) - $200
- Backend MUST implement tiers but MUST block access:
  - feature flags (e.g. `LUNAR_PUBLIC_ENABLED=false`)
  - waitlist gating (invited users only)

Waitlist:

- Email collection is allowed as necessary, but MUST be minimal.
- MUST NOT add tracking pixels or analytics.

---

## 12. Sync (Optional, OFF by default)

- Sync is not required for v1.
- If implemented later:
  - default OFF
  - manual and/or interval only when user enables
  - event-log replication only

---

## 13. Local `yue serve` + Desktop (Deferred)

- `yue serve` and Desktop (Tauri) are explicitly deferred.

---

## 14. Roadmap (Priority Order)

1. API-first baseline: modular architecture + stable `/v1/*` contracts + tests-first foundations
2. Token tracking per folder/day/provider + totals (TUI)
3. Cloud API (Railway): Better Auth + Stripe top-up + Nightly metering
4. Mandatory MCP backlog integration (backlog app source of truth, skill as documentation)
5. Landing/docs + marketplace page (Astro, static, no telemetry)
6. Governance engine + validators (incremental)
7. `yue serve` local UI + desktop (Tauri) (last)
