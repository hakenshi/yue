import { statSync } from "fs"
import { join, relative, resolve } from "path"

export interface SearchHit {
  file: string
  line: number
  column: number
  text: string
}

function isProbablyBinary(buf: Uint8Array): boolean {
  // Heuristic: NUL byte usually indicates binary.
  const len = Math.min(buf.length, 4096)
  for (let i = 0; i < len; i++) {
    if (buf[i] === 0) return true
  }
  return false
}

function safeRegex(pattern: string): RegExp {
  try {
    return new RegExp(pattern, "i")
  } catch {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return new RegExp(escaped, "i")
  }
}

function defaultInclude(path: string): boolean {
  // Skip common large/noisy directories.
  if (path.includes(`${join("", "node_modules")}${join("", "")}`) || path.includes("/node_modules/")) return false
  if (path.includes("/.git/")) return false
  if (path.includes("/dist/")) return false
  if (path.includes("/build/")) return false
  if (path.includes("/.next/")) return false
  if (path.includes("/.yue/")) return true

  return true
}

function defaultExtAllow(path: string): boolean {
  const idx = path.lastIndexOf(".")
  if (idx === -1) return false
  const ext = path.slice(idx + 1).toLowerCase()
  return [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "md",
    "yml",
    "yaml",
    "toml",
    "go",
    "rs",
    "py",
    "java",
    "kt",
    "c",
    "cc",
    "cpp",
    "h",
    "hpp",
    "cs",
    "rb",
    "php",
    "sh",
    "env",
  ].includes(ext)
}

export async function searchProject(opts: {
  cwd?: string
  pattern: string
  glob?: string
  maxFiles?: number
  maxHits?: number
  maxMillis?: number
}): Promise<{ hits: SearchHit[]; scannedFiles: number; truncated: boolean }> {
  const cwd = opts.cwd ?? process.cwd()
  const pattern = opts.pattern
  const glob = opts.glob ?? "**/*"
  const maxFiles = opts.maxFiles ?? 2000
  const maxHits = opts.maxHits ?? 200
  const maxMillis = opts.maxMillis ?? 2500

  const rx = safeRegex(pattern)
  const hits: SearchHit[] = []
  let scannedFiles = 0
  const start = Date.now()
  let truncated = false

  const g = new Bun.Glob(glob)
  for await (const rel of g.scan({ cwd, onlyFiles: true })) {
    if (Date.now() - start > maxMillis) {
      truncated = true
      break
    }
    if (scannedFiles >= maxFiles) {
      truncated = true
      break
    }

    const relPath = String(rel)
    const absPath = resolve(cwd, relPath)

    if (!defaultInclude(absPath)) continue
    if (!defaultExtAllow(absPath)) continue

    let st
    try {
      st = statSync(absPath)
      if (!st.isFile()) continue
      // Skip huge files.
      if (st.size > 1024 * 1024) continue
    } catch {
      continue
    }

    scannedFiles++

    let file
    try {
      file = Bun.file(absPath)
      const buf = new Uint8Array(await file.arrayBuffer())
      if (isProbablyBinary(buf)) continue
      const text = new TextDecoder().decode(buf)
      const lines = text.split("\n")

      for (let i = 0; i < lines.length; i++) {
        if (Date.now() - start > maxMillis) {
          truncated = true
          break
        }
        const lineText = lines[i] ?? ""
        const m = rx.exec(lineText)
        if (!m || m.index === undefined) continue
        hits.push({
          file: relative(cwd, absPath),
          line: i + 1,
          column: m.index + 1,
          text: lineText.trimEnd(),
        })
        if (hits.length >= maxHits) {
          truncated = true
          break
        }
      }
    } catch {
      continue
    }

    if (truncated) break
  }

  return { hits, scannedFiles, truncated }
}
