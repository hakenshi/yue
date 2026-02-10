# AGENTS.md (Repository Guide for Coding Agents)

This repository is an AI coding agent (Yue).

IMPORTANT reference rule
- When we say "OpenCode", we mean anomaly's OpenCode: `https://github.com/anomalyco/opencode`.
- Ignore similarly named Go projects; they are unrelated.

Product spec
- Source of truth: `SPECIFICATION.md` (v2 draft; SWE-first, local-first, no telemetry)

Repository quick facts (current)
- Runtime: Bun
- Language: TypeScript (ESM)
- UI (TUI): `@opentui/core` + `@opentui/solid`
- LLM SDK: Vercel AI SDK (`ai`, `@ai-sdk/*`)
- Config format: YAML

Planned architecture (from `SPECIFICATION.md`)
- Monorepo: TurboRepo + Bun workspaces
- Cloud API: Elysia (TypeBox-first) + Postgres
- Monetization:
  - PAYG provider: Yue Nightly
  - Tiers (blocked + waitlist): Yue Lunar (Shingetsu/Mikazuki/Hangetsu/Mangetsu)
- Desktop UI (Tauri) + local `yue serve` runtime+UI: deferred

---

## Commands (current repo)

Install
- `bun install`

Run
- `bun start` (runs `src/index.tsx`)
- `bun run dev` (watch mode)

Tests
- `bun test`
- Single test file: `bun test path/to/file.test.ts`
- Single test by name/pattern: `bun test -t "pattern"`
- Watch tests: `bun test --watch`

Typecheck
- `bunx tsc -p tsconfig.json --noEmit`
- If `tsc` is missing: `bun add -d typescript`

Lint/format
- No linter/formatter configured currently.

---

## Project layout (current)

- Entry: `src/index.tsx`
- App shell: `src/app.tsx`
- TUI: `src/tui/**`
- Agent core: `src/core/**`
- Types: `src/types/**`

Config
- Global: `~/.config/yue/config.yml`
- Local (project): `./.yue/config.yml`
- Merge order (highest wins): defaults < global < local
- Schema: `src/core/config/schema.ts`
- Loader: `src/core/config/loader.ts`

Secrets
- Do not commit `.env` or API keys. A `.env` may exist for local dev.

---

## SWE-first rules (from `SPECIFICATION.md`)

Privacy / data handling
- MUST NOT add telemetry/analytics/phone-home.
- Sync is OFF by default; any cloud sync must be explicit opt-in.
- Do not store or transmit prompt/code content by default.

Providers and billing
- Providers are core (not extensions).
- Never trust client-provided sensitive values (balance/entitlements/limits).
- Stripe webhooks must be verified (when implemented).

Token tracking (priority)
- Implement/account for tokens per project folder, per day, per provider/model, plus totals.
- Projects are defined by manual mapping (`./.yue/projects.yml`) when available.

Session storage / context rot
- Prefer append-only event logs for sessions (planned): `events.jsonl` per session.
- Prefer compact compiled LLM state (planned): `state.toon`.
- Large tool outputs should become artifacts (references + summaries).

---

## Code style (match existing files)

Formatting
- No semicolons.
- 2-space indentation.
- Prefer trailing commas where it improves diffs.

Imports
- Use `import type { ... }` for type-only imports.
- Group imports: external -> node built-ins -> internal.
- Follow surrounding file convention for extensions (`./x.ts`, `./y.tsx`).

Types
- Avoid `any`; prefer `unknown` + validation.
- Respect strict flags in `tsconfig.json` (notably `noUncheckedIndexedAccess`).

Validation
- Use Zod for config and other untrusted inputs (current codebase).
- Planned cloud API should prefer TypeBox with Elysia.

Error handling
- Do not throw across UI boundaries unless fatal.
- Commands should return `CommandResult` (`src/types/commands.d.ts`).
- Tools should return `ToolExecutionResult` (`src/types/tools.d.ts`).
- Normalize unknown errors with:
  - `error instanceof Error ? error.message : String(error)`

Comments
- Avoid inline comments unless behavior is non-obvious.

---

## Workflow expectations for agents

- Read before writing; match local conventions.
- Minimal, focused changes; no broad refactors unless explicitly requested.
- Do not edit CI/CD/workflows unless explicitly asked.
- Never create git commits unless explicitly asked.

---

## Cursor/Copilot rules

- No `.cursor/rules`, `.cursorrules`, or `.github/copilot-instructions.md` were found in this repository.
