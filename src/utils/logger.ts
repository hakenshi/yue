type LogLevel = "debug" | "info" | "warn" | "error"

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

let currentLevel: LogLevel = "info"

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel]
}

function formatMessage(level: LogLevel, module: string, msg: string): string {
  const timestamp = new Date().toISOString()
  return `[${timestamp}] [${level.toUpperCase()}] [${module}] ${msg}`
}

export function setLogLevel(level: LogLevel) {
  currentLevel = level
}

export function createLogger(module: string) {
  return {
    debug(msg: string, ...args: unknown[]) {
      if (shouldLog("debug")) console.debug(formatMessage("debug", module, msg), ...args)
    },
    info(msg: string, ...args: unknown[]) {
      if (shouldLog("info")) console.info(formatMessage("info", module, msg), ...args)
    },
    warn(msg: string, ...args: unknown[]) {
      if (shouldLog("warn")) console.warn(formatMessage("warn", module, msg), ...args)
    },
    error(msg: string, ...args: unknown[]) {
      if (shouldLog("error")) console.error(formatMessage("error", module, msg), ...args)
    },
  }
}
