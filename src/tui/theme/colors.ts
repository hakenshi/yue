import { RGBA } from "@opentui/core"
import { getPreset, type ThemeColors } from "./presets.ts"
import type { YueConfig } from "../../types/config"

export type ResolvedTheme = Record<keyof ThemeColors, string | RGBA>

const BG_KEYS: (keyof ThemeColors)[] = ["bg", "surface", "inputBg", "selectedBg"]

function applyAlpha(hex: string, opacity: number): RGBA {
  const rgba = RGBA.fromHex(hex)
  rgba.a = opacity
  return rgba
}

export function resolveTheme(config: YueConfig): ResolvedTheme {
  const base = getPreset(config.theme.preset)
  const merged: Record<string, string> = { ...base }

  for (const [key, value] of Object.entries(config.theme.overrides)) {
    if (key in base) {
      merged[key] = value
    }
  }

  const result: Record<string, string | RGBA> = { ...merged }

  if (config.theme.opacity < 1) {
    for (const key of BG_KEYS) {
      result[key] = applyAlpha(merged[key]!, config.theme.opacity)
    }
  }

  return result as ResolvedTheme
}
