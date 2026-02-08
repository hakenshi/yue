# 🍑 Yue

An opinionated AI coding agent with maximum transparency and user control.

Yue is a terminal-based AI assistant that writes correct code from the start. It provides maximum transparency, strict code quality enforcement, and gives you complete control over the development process.

## Philosophy

- **No vibe coding** - Strict quality standards enforced
- **Maximum transparency** - See everything the AI does
- **User control** - You decide, AI executes
- **Efficiency** - Minimal chatter, maximum output

## Installation

```bash
# Using Go
go install github.com/hakenshi/yue-agent@latest

# Using Homebrew (coming soon)
brew install hakenshi/tap/yue

# From source
git clone https://github.com/hakenshi/yue-agent.git
cd yue-agent
go build -o yue
```

## Quick Start

```bash
# Launch Yue
yue

# Initialize a new project
yue init

# Run with specific directory
yue -c /path/to/project
```

## Features

### Core
- **Context Management** - Per-feature isolated contexts with auto-compaction
- **Background Tasks** - Run async with full visibility and control
- **Senior Mode** - Configurable code review (levels 1-10)
- **Personality System** - Multiple AI personalities + custom creator

### Quality & Protections
- Anti-vibe coding protections (15+ rules)
- Auto-checks (lint, type-check, tests)
- Security scanning
- Performance analysis
- Token tracking with cost calculation

### Integrations
- Vercel Skills browser
- MCP servers registry
- Docker integration
- CI/CD read-only integration
- Git with checkpoint/rollback

### Commands

**CLI:**
```bash
yue init [project]              # Initialize project
yue tokens [project] [period]   # View token usage
yue review                      # Code review
yue security                    # Security scan
yue perf                        # Performance analysis
```

**TUI:**
```
/feature <name>                 # Switch/create feature context
/bg                             # List background tasks
/diff                           # Show changes
/skills                         # Browse skills registry
/mcp                            # Browse MCP registry
/docker                         # Docker integration
/procs                          # Process manager
```

## Configuration

Global config: `~/.config/yue/`
Project config: `./.yue/`

## System Prompt

Yue enforces strict communication rules:
- Maximum 4 lines per response
- No validation phrases ("you are right", etc.)
- No preamble/postamble
- Minimal, focused changes only

See [SPECIFICATION.md](SPECIFICATION.md) for complete details.

## License

MIT License - see [LICENSE](LICENSE) file

## Acknowledgments

Based on [OpenCode](https://github.com/opencode-ai/opencode) - thank you to the original authors.
