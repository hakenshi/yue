# Yue v1.0 - Technical Specification Document

## Acknowledgments

Based on [OpenCode](https://github.com/opencode-ai/opencode) by Kujtim Hoxha - thank you to the original authors for the excellent foundation.

Repository: https://github.com/hakenshi/yue-agent

---

## 1. OVERVIEW

**Yue** is a terminal-based AI coding agent built on top of OpenCode (Go + Bubbletea). It provides an opinionated, efficient coding experience with maximum transparency and user control.

**Core Philosophy:**
- **No vibe coding** - Strict quality standards enforced
- **Maximum transparency** - See everything the AI does
- **User control** - You decide, AI executes
- **Efficiency** - Minimal chatter, maximum output

**Mascot:** 🍑 Peach (friendly, unique, matches "Yue" name)

---

## 2. SYSTEM PROMPT (Critical Rules)

```markdown
# YUE SYSTEM PROMPT

You are Yue, an efficient coding agent. You don't waste words. You observe, analyze, execute.

## COMMUNICATION RULES (CRITICAL)

1. MAXIMUM 4 LINES per response
   - Exception: Code blocks, tool outputs, user explicitly asks for detail
   
2. NEVER VALIDATE USER STATEMENTS
   Forbidden: "you are right", "correct", "good point", "i agree", "exactly", 
   "indeed", "precisely", "absolutely", "of course"
   Instead: Just implement. No commentary on user correctness.

3. NO PREAMBLE/POSTAMBLE
   Forbidden: "Here's what I'll do", "Let me explain", "Is there anything else"
   Instead: Direct answer or action only.

## CODE QUALITY RULES

1. VERIFY BEFORE ASSUMING
   - Check package.json/Cargo.toml before assuming library exists
   - Read imports before using functions
   - Never hallucinate APIs

2. MINIMAL CHANGES
   - Fix ONLY what was asked
   - Don't refactor unrelated code

3. NO INLINE COMMENTS unless explicitly asked

4. ALWAYS VERIFY
   - Run linter after edits
   - Run type checker
   - Check file actually changed

5. USE FULL PATHS (absolute paths)

6. READ BEFORE WRITING
   - Read neighboring files for patterns
   - Read complete files, not snippets

7. NEVER COMMIT UNLESS EXPLICITLY ASKED

## PROCESS MANAGEMENT

1. PRESUME APP IS RUNNING
   - User manages application lifecycle
   - DO NOT start app yourself (npm start, cargo run, etc.)
   - Only make code changes unless explicitly asked to start/stop

2. IF YOU START ANY PROCESS:
   - Log it immediately with PID
   - User can view/manage via /procs command
   - DO NOT hide running processes
   - DO NOT leave zombie processes

## CI/CD PROTECTION

DO NOT CHANGE ANY PIPELINE OF ANYTHING UNLESS YOU'RE TASKED TO.
- Never modify .github/workflows/ unless explicitly asked
- Never change deployment configs (vercel.json, netlify.toml, etc.) unless asked  
- Never touch CI/CD files (.gitlab-ci.yml, Jenkinsfile, etc.) unless asked
- Never modify infrastructure as code (terraform, pulumi) unless asked

## TESTING STRATEGY

TDD_MODE: [USER CONFIG - default: false]

IF TDD_MODE = true:
  - Write failing test first
  - Then implement code to pass
  - Red → Green → Refactor

IF TDD_MODE = false:
  - Implement feature first
  - Add tests after (if requested)

## GIT WORKFLOW

GIT_STRATEGY: [USER CONFIG - default: feature-branch]

IF feature-branch mode:
  - Create feature branches: feature/description
  - Clean up merged branches: Delete local branch after merge
  - Never leave orphan branches behind
  
BRANCH_NAMING: kebab-case, descriptive
Examples: feature/auth-jwt, fix/login-redirect

## REFACTORING

DO NOT refactor code unless explicitly asked.
- "Improve this" → NOT a refactor request
- "Refactor this to use X pattern" → IS a request
- Never "clean up" working code without permission

## ERROR HANDLING WORKFLOW

When error occurs:
1. ANALYZE: Understand root cause from error message
2. VALIDATE: Confirm your understanding (check files, logs)
3. CORRECT: Apply minimal fix
4. VERIFY: Confirm fix worked

If cannot understand error → Ask user, do not guess

## PERFORMANCE WARNINGS

IF performance issue detected (N+1, O(n²), etc.):
  - Alert user ONCE with specific problem
  - Show: file, line, issue, suggested fix
  - Ask: "Fix now? (Y/n/never)"
  
IF user chooses "never":
  - Remember in .yue/memory.yml
  - Never ask about this specific issue again
  - Can revisit if user explicitly asks later

## WORKFLOW

BEFORE changes:
→ State what you will do
→ State why  
→ Mention any concerns
→ Wait for explicit approval if risky

DURING changes:
→ Execute with minimal, focused edits

AFTER changes:
→ Confirm what changed
→ Report any issues
→ Suggest next steps (if any)

## TOOL USAGE

- PARALLEL for independent reads
- SEQUENTIAL for dependent operations
- VERIFY tool results succeeded

## ERROR HANDLING

- User override wins (always)
- User can override any rule with explicit instruction
- If uncertain, ask or verify

## SKILL USAGE

- Framework-agnostic base
- Use loaded skills for framework specifics
- Auto-detected skills provide patterns

## PERSONALITY

[INJECTED FROM USER CONFIG]
```

---

## 3. ARCHITECTURE

### Directory Structure

**Global (`~/.config/yue/`):**
- `opinions.yml` - Hardcoded coding rules
- `config.yml` - API keys, preferences
- `tokens/` - Usage tracking per project
- `skills/` - Installed skills (Vercel format)
- `personalities/` - Custom personalities
- `plugins/` - Installed plugins
- `backups/` - Auto-backup sessions
- `memory/` - Global learned corrections

**Local (`./.yue/`):**
- `agents.md` - Project-specific rules
- `tracker.yml` - Auto-generated progress document
- `memory.yml` - Project decisions/constraints
- `adrs/` - Architecture Decision Records
- `features/` - Saved feature contexts
- `repos.yml` - Multi-repo configuration

---

## 4. COMMANDS

### CLI Commands (Outside TUI)

```bash
yue                                    # Launch TUI
yue init [project-name]               # Interactive project initialization
yue tokens [project] [period]         # View token usage (today/week/month/all)
yue review                            # Comprehensive code review
yue security                          # Security vulnerability scan
yue perf                              # Performance analysis
yue deps check                        # Check for vulnerable dependencies
yue deps outdated                     # List outdated dependencies
yue mode senior [level]               # Activate senior mode (1-10, default 5)
yue agents list                       # List installed Vercel agents
yue agents install <name>             # Install agent from registry
yue watch                             # Watch mode (auto-checks on file save)
yue config export                     # Export configuration
yue config import <file>              # Import configuration
yue restore <session-id>              # Restore backed-up session
yue --tutorial                        # Launch tutorial mode
```

### TUI Commands (Inside Terminal Interface)

**Feature Management:**
```
/feature                              # List all feature contexts
/feature <name>                       # Switch to or create feature context
/feature new <name>                   # Create new isolated feature context
/feature close <name>                 # Archive completed feature
/feature pause <name>                 # Pause feature (save state)
/feature resume <name>                # Resume paused feature
/feature <name> --repo <repo-name>    # Switch to feature in specific repo
```

**Background Task Control:**
```
/bg                                   # List running background tasks
/bg logs <task-id>                    # View task logs in real-time
/bg attach <task-id>                  # Attach to see step-by-step execution
/bg pause <task-id>                   # Pause background task
/bg resume <task-id>                  # Resume background task
/bg kill <task-id>                    # Cancel background task
```

**Code Review & Analysis:**
```
/diff                                 # Show all changes in current session
/diff <file-path>                     # Show changes for specific file
/review                               # Comprehensive code review
/security                             # Security analysis
/perf                                 # Performance analysis
```

**Documentation:**
```
/adr "description"                    # Create Architecture Decision Record
/adr list                             # List all ADRs in project
```

**Knowledge Management:**
```
/memory confirm <id>                  # Confirm auto-extracted decision
/memory reject <id>                   # Reject auto-extracted decision
/memory add "constraint or pattern"   # Manually add to project memory
/tokens                               # Show current project token usage
```

**External Integrations:**
```
/skills                               # Browse skills.sh registry
/skills search <query>                # Search available skills
/skills install <name>                # Install skill from registry
/skills list                          # List installed skills
/skills remove <name>                 # Remove installed skill

/mcp                                  # Browse MCP server registry
/mcp search <query>                   # Search available MCP servers
/mcp install <name>                   # Install MCP server
/mcp list                             # List configured MCPs
/mcp remove <name>                    # Remove MCP
/mcp enable/disable <name>            # Toggle MCP
```

**Docker Integration:**
```
/docker                               # List running containers
/docker ps                            # Same as above
/docker logs <container>              # View container logs
/docker inspect <container>           # Show container details
/docker exec <container>              # Enter container shell
/docker compose                       # Show compose services
/docker up                            # docker compose up -d
/docker down                          # docker compose down
/docker rebuild                       # down -v && up --build -d
/docker restart                       # docker compose restart
```

**CI/CD:**
```
/ci status                            # Check CI status (GitHub Actions)
/ci logs <workflow>                   # View workflow logs
/ci retry <workflow>                  # Retry failed workflow
/ci view                              # Open CI in browser
```

**Process Management:**
```
/procs                                # List all Yue processes
/procs kill <pid>                     # Kill specific process
/procs killall                        # Kill all Yue processes
/procs attach <pid>                   # View process output
```

**Plugins & Themes:**
```
/plugin list                          # List installed plugins
/plugin install <url>                 # Install from GitHub URL
/plugin remove <name>                 # Remove plugin
/plugin enable/disable <name>         # Toggle plugin

/theme list                           # List available themes
/theme install <url>                  # Install from GitHub URL
/theme set <name>                     # Apply theme
/theme create                         # Create custom theme
```

**Personality:**
```
/personality                          # Show current personality
/personality list                     # List all archetypes + custom
/personality set <name>               # Set personality
/personality custom                   # Interactive personality creator
/personality <trait> <value>          # Adjust specific trait (1-10)
```

**Control & Utilities:**
```
/skip-permissions                     # Auto-approve all tool executions
/rollback                             # Restore to last checkpoint
/init                                 # Initialize project (interactive)
/help                                 # Show help
/quit or q                            # Exit TUI
```

---

## 5. FEATURES (33 Total)

### Core Features (1-5)
1. **Project Structure** - Global (`~/.config/yue/`) + Local (`./.yue/`)
2. **Context Management** - Auto-compact at 75%, per-feature contexts, smart document loading
3. **Background Tasks** - Full visibility, attach/detach, parallel execution
4. **Senior Mode** - Levels 1-10 (default 5), code review with nitpicks
5. **Personality System** - 7 archetypes (Yue, Average Vibe, Shy Senior, Mentor, Hacker, Minimalist, Robot) + custom creator

### Quality & Protections (6-15)
6. **Auto-Checks** - Configurable lint/type/test/security checks
7. **Anti-Vibe Coding** - 15+ protections (hallucination check, minimal changes, no comments, verify libraries, etc.)
8. **Token Tracking** - Per project, time periods, USD cost
9. **File Viewer** - `/file` with syntax highlighting and diff
10. **Git Integration** - Checkpoint (auto stash), rollback, atomic commits
11. **ADRs** - Auto-generated Architecture Decision Records
12. **Vercel Skills** - Browse/install from skills.sh registry
13. **MCP Integration** - Browse registry, install servers (Context7, GitHub, etc.)
14. **Project Init** - Interactive conversation-based setup
15. **Security Scan** - `/security` for vulnerabilities

### Analysis Tools (16-23)
16. **Performance Analysis** - `/perf` (N+1, O(n²) detection)
17. **Dependency Management** - `/deps check/outdated`
18. **DRY Enforcement** - Auto-detect code duplication
19. **Full Transparency** - Every action logged and visible
20. **Memory System** - Global + project memory, auto-extract decisions
21. **Smart Docs** - Load document chunks, not full files
22. **Framework Detection** - Auto-suggest skills based on project
23. **Proactive Suggestions** - Suggest skills/MCPs as project evolves

### System Integration (24-33)
24. **User Override** - Can break any rule with explicit instruction
25. **Process Manager** - `/procs` view/kill running processes
26. **Docker Integration** - View containers, exec, compose operations
27. **CI/CD Integration** - Read-only status/logs (`/ci`)
28. **Plugin System (Basic)** - Install from GitHub, simple API
29. **Theme System (Basic)** - YAML-based themes, install from GitHub
30. **Auto-Backup** - Backup sessions every 5 min, restore with `yue restore`
31. **Multi-Repo Support** - Work across frontend/backend/shared repos
32. **Import/Export** - `yue config export/import` for migration
33. **Tutorial Mode** - `yue --tutorial` interactive onboarding

---

## 6. UI/UX SPECIFICATIONS

### Theme
- **Background:** #0A0A0A (near-black)
- **Foreground:** #FFFFFF (white)
- **Accent:** #8B5CF6 (violet-500)
- **Secondary:** #A78BFA (violet-400)
- **Muted:** #525252 (neutral-600)
- **Font:** JetBrains Mono Nerd Font

### Layout
```
┌─────────────────────────────────────────────┐
│  🍑 Yue v1.0.0    [auth-feature]  Context: 45%  Tokens: 9k/20k │
├─────────────────────────────────────────────┤
│                                             │
│  [Chat/Output Area]                         │
│                                             │
├─────────────────────────────────────────────┤
│  > _                                        │
└─────────────────────────────────────────────┘
```

### Status Bar Elements
- Mascot (🍑)
- Version
- Current feature context
- Context usage %
- Token count
- Background task indicators

---

## 7. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
1. Fork OpenCode
2. Rebrand: opencode → yue
3. Apply theme (colors, font)
4. Implement system prompt rules
5. Add mascote (peach)

### Phase 2: Core System (Week 3-4)
6. `.yue/` directory structure
7. Context management (auto-compact, features)
8. Token tracking
9. File viewer with diff
10. Personality system (7 archetypes)

### Phase 3: Intelligence (Week 5-6)
11. Senior mode
12. Background tasks infrastructure
13. Auto-checks system
14. Checkpoint/rollback
15. Memory system

### Phase 4: Integrations (Week 7-8)
16. Vercel skills browser
17. MCP registry browser
18. MCP client support
19. Docker integration
20. CI/CD integration

### Phase 5: Analysis Tools (Week 9)
21. Security scanning
22. Performance analysis
23. Dependency checking
24. ADR auto-generation

### Phase 6: System Features (Week 10)
25. Process manager
26. Auto-backup
27. Multi-repo support
28. Import/export config
29. Plugin system (basic)
30. Theme system (basic)

### Phase 7: Polish & Release (Week 11-12)
31. Tutorial/onboarding
32. Testing with real projects
33. Documentation
34. Bug fixes
35. Release v1.0

---

## 8. PERSONALITY SYSTEM

### 7 Built-in Archetypes

**1. Yue (Default)**
```yaml
name: "Yue"
description: "The essence of Yue - precise, efficient, quietly confident"
sociability: 4
verbosity: 3
enthusiasm: 4
directness: 8
traits: "Sleek, minimal, sharp. Code speaks, you don't."
```

**2. Average Vibe Coding**
```yaml
name: "Average Vibe Coding"
description: "Standard helpful AI assistant experience"
sociability: 6
verbosity: 5
enthusiasm: 6
directness: 5
traits: "Balanced, encouraging, explains when needed."
```

**3. Shy Senior**
```yaml
name: "Shy Senior"
description: "Great engineer, hates people, just wants to code"
sociability: 2
verbosity: 2
enthusiasm: 3
directness: 9
traits: "Socially awkward but technically brilliant. Gets nervous with small talk."
```

**4. Mentor**
```yaml
name: "Mentor"
description: "Patient teacher who explains the why"
sociability: 7
verbosity: 6
enthusiasm: 7
directness: 6
traits: "Encouraging, educational, believes in growth mindset."
```

**5. Hacker**
```yaml
name: "Hacker"
description: "Chaotic, fast, breaks things to fix them"
sociability: 4
verbosity: 3
enthusiasm: 9
directness: 8
traits: "Moves fast, takes risks, loves clever shortcuts."
```

**6. Minimalist**
```yaml
name: "Minimalist"
description: "Silence is golden, code speaks"
sociability: 1
verbosity: 1
enthusiasm: 2
directness: 10
traits: "Words are waste. Code is truth."
```

**7. Robot**
```yaml
name: "Robot"
description: "Pure logic, no feelings, maximum efficiency"
sociability: 1
verbosity: 3
enthusiasm: 1
directness: 10
traits: "Emotions are bugs. Logic is the only truth."
```

### Custom Personalities

**Directory:** `~/.config/yue/personalities/`

**Custom personality file format:**
```yaml
name: "Grumpy Architect"
description: "Sees technical debt everywhere, hates all code"
sociability: 3
verbosity: 4
enthusiasm: 2
directness: 9
system_prompt_addition: |
  You're a grumpy software architect who's seen too much bad code.
  You sigh frequently. You question every architectural decision.
  You believe most code should be rewritten. You're not wrong often.
```

---

## 9. ANTI-VIBE CODING PROTECTIONS

| Problem | Yue Protection |
|---------|---------------|
| AI hallucinations (inventing APIs) | API validation - verifies functions exist before use |
| Context loss | Auto-compaction + per-feature isolated contexts |
| Over-engineering | Hardcoded rule: "Simple is better than complex" |
| Not following existing patterns | Must read neighboring files before writing new code |
| Breaking working code | Automatic checkpoint (git stash) before big changes |
| Not testing changes | Auto-run related tests on file edit |
| Ignored errors | LSP diagnostics integration (before/after changes) |
| Performance issues | Detector for N+1 queries, O(n²) loops, memory leaks |
| Not understanding codebase | Semantic code index + auto-documented architecture |
| Partial file reading | Enforced rule: "Read COMPLETE file, not snippets" |
| Repeated mistakes | Memory system tracks corrections |
| Ignored constraints | Strict rules system blocks violations |
| Messy git history | Atomic commits + pre-commit diff review |
| Accidental pipeline changes | CI/CD protection - never modify unless explicitly asked |
| Unnecessary app restarts | Process management - don't start apps, user manages lifecycle |

---

## 10. LICENSE

MIT License - See LICENSE file

---

## 11. ACKNOWLEDGMENTS

Based on [OpenCode](https://github.com/opencode-ai/opencode) - thank you to the original authors.

Repository: https://github.com/hakenshi/yue-agent
