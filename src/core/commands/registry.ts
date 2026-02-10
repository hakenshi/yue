import type { Command } from "../../types/commands"

export class CommandRegistry {
  private commands = new Map<string, Command>()
  private aliases = new Map<string, string>()

  register(cmd: Command) {
    this.commands.set(cmd.name, cmd)
    if (cmd.aliases) {
      for (const alias of cmd.aliases) {
        this.aliases.set(alias, cmd.name)
      }
    }
  }

  get(nameOrAlias: string): Command | undefined {
    const canonical = this.aliases.get(nameOrAlias) ?? nameOrAlias
    return this.commands.get(canonical)
  }

  getAll(): Command[] {
    return Array.from(this.commands.values())
  }
}
