# AGENTS.md (Repository Guide for Coding Agents)

This repository is Yue, a local-first coding agent in a Bun + Turborepo monorepo.

IMPORTANT reference rule

- When we say "OpenCode", we mean anomaly's OpenCode: https://github.com/anomalyco/opencode
- Ignore similarly named Go projects; they are unrelated.

Source of truth

- Product/architecture spec: `docs/yue/SPECIFICATION.md`
- Project backlog (source of truth): MCP agentic-backlog API (local-first, no file fallback)

Quick facts

- Runtime: Bun (workspaces)
- Language: TypeScript (ESM, strict)
- Orchestration: Turborepo (`turbo.json`)
- TUI agent app: `apps/cli` (OpenTUI + Solid)
- Cloud API: `apps/api` (Elysia)
- Web app: `apps/web` (Astro)
- Typed API client: `packages/treaty` (Eden Treaty)

---

## Commands (run from repo root)

Install

- `bun install`

Dev (all packages/apps that define `dev`)

- `bun run dev`

Dev a single app/package (Turbo filters)

- `turbo run dev --filter=cli`
- `turbo run dev --filter=api`
- `turbo run dev --filter=@yue/web`

Build

- `bun run build`
- `turbo run build --filter=cli`

Typecheck / lint

- `bun run check-types`
- `bun run lint` (generally aliases typecheck)
- `turbo run check-types --filter=cli`

Format

- `bun run format`

Tests

- `bun run test` (intentionally scoped in root script)
- `turbo run test --filter=<package>`

Run a single test file (Bun)

- From repo root (path-based):
  - `bun test tests/apps/api/app.test.ts`
- Via Turbo (args after `--` are forwarded; paths are relative to the package cwd):
  - `turbo run test --filter=api -- ../../tests/apps/api/app.test.ts`

Run a single test by name / pattern

- `bun test -t "pattern"`
- Watch: `bun test --watch`

Testing layout

- Keep tests centralized under root `tests/`.
- Do not place `*.test.ts` files inside `apps/*/src` or package source directories.
- Use structure:
  - `tests/apps/<app-name>/*.test.ts`
  - `tests/packages/<package-name>/*.test.ts`

---

## Repo Layout

Apps

- `apps/cli`: main TUI/agent implementation (composition root)
- `apps/api`: HTTP server and business/domain API surface
- `apps/web`: Astro web app; scripts set `ASTRO_TELEMETRY_DISABLED=1`

Packages

- `packages/treaty`: typed Eden Treaty client helper

Config and local files (do not commit secrets)

- Global config: `~/.config/yue/config.yml` (XDG respected)
- Project config: `./.yue/config.yml`
- Prompt-injected project rules: `./.yue/agents.md` (lowercase)
- Global opinions: `~/.config/yue/opinions.yml`

---

## Code Style Guidelines

Formatting

- Prefer no semicolons in TS/TSX.
- 2-space indentation.
- Prefer trailing commas when it improves diffs.

Imports

- Use ESM `import`/`export`.
- Use `import type { ... }` for type-only imports.
- Group imports: external -> node built-ins -> internal.
- Follow local conventions for relative import extensions (commonly `./x.ts` / `./y.tsx`).
- Do not use barrel imports (`index.ts` re-export aggregators); import directly from source files.

Types and validation

- Avoid `any`; prefer `unknown` + parsing.
- Keep IO boundaries typed: tools, commands, file reads/writes, env/config.
- Use Zod for config and other untrusted inputs in the TUI/agent.
- For the API, prefer TypeBox-first patterns aligned with Elysia.

Naming conventions

- `PascalCase`: classes, UI components.
- `camelCase`: functions, variables.
- `UPPER_SNAKE_CASE`: constants.
- Filenames: command definitions often use kebab-case (e.g. `skip-permissions.ts`).

Error handling

- Do not throw across UI boundaries unless fatal; return user-visible errors.
- Normalize unknown errors:
  - `error instanceof Error ? error.message : String(error)`

Boundaries (apps/cli)

- Commands return `CommandResult` (`apps/cli/src/types/commands.d.ts`).
- Tools return `ToolExecutionResult` (`apps/cli/src/types/tools.d.ts`).
- When adding a new command/tool, register it in the appropriate registry.

Bun-first implementation

- Prefer Bun APIs (`Bun.spawn`, `Bun.file`, etc.) over Node-specific patterns.
- Keep shell execution behind the bash tool abstraction when possible.

Agent workflow expectations

- Read before writing; match surrounding conventions.
- Prefer small diffs; avoid broad refactors.
- Do not add telemetry/analytics.
- Avoid inventing new dependencies.
- Use MCP agentic-backlog for all task tracking. Update task status and add notes frequently.

## MCP Backlog Workflow (Mandatory)

This project uses the agentic-backlog MCP server as the **only** source of truth for task tracking. There is no local file fallback.

### Setup

Ensure the agentic-backlog API is running:

```bash
docker start agentic-backlog-api
```

### Available Commands

- `\agentic-backlog:add <title>` - Create a new task
- `\agentic-backlog:update <task> <field> <value>` - Update task fields
- `\agentic-backlog:read` - Show board overview
- `\agentic-backlog:board` - Display task board
- `\agentic-backlog:in-progress` - List active work
- `\agentic-backlog:show-task <keywords>` - Find and display specific task
- `\agentic-backlog:update-task <keywords> set status <status>` - Update task status

### Workflow

1. **Before starting work**: Check board with `\agentic-backlog:board`
2. **Pick a task**: Move it to `in_progress` using `\agentic-backlog:update-task`
3. **During work**: Add progress notes frequently
4. **On completion**: Move to `review` or `done`
5. **On blockers**: Move to `blocked` with reason

### Status Model

- `backlog` - Not started
- `todo` - Ready to start
- `in_progress` - Actively working
- `blocked` - Blocked (include reason)
- `review` - Ready for review
- `done` - Completed
- `cancelled` - Won't do

---

## Cursor / Copilot Rules

- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` were found in this repository.
