import { useTerminalDimensions } from "@opentui/solid"

export type Breakpoint = "compact" | "medium" | "wide"

export interface Viewport {
  width: number
  height: number
  safeHeight: number
  isTmux: boolean
  isScreen: boolean
  breakpoint: Breakpoint
}

export function useViewport(): () => Viewport {
  const dims = useTerminalDimensions()

  const isTmux = () => process.env.TMUX !== undefined
  const isScreen = () => process.env.TERM?.startsWith("screen") ?? false

  const safeHeight = () => {
    const h = dims().height
    // Subtract 1 row for tmux/screen status bar if detected
    if (isTmux() || isScreen()) {
      return Math.max(h - 1, 10) // Minimum 10 rows
    }
    return h
  }

  const breakpoint = (): Breakpoint => {
    const w = dims().width
    if (w < 80) return "compact"
    if (w < 160) return "medium"
    return "wide"
  }

  return () => ({
    width: dims().width,
    height: dims().height,
    safeHeight: safeHeight(),
    isTmux: isTmux(),
    isScreen: isScreen(),
    breakpoint: breakpoint(),
  })
}

// Helper functions for common responsive patterns
export function useResponsive() {
  const viewport = useViewport()

  return {
    viewport,
    isCompact: () => viewport().breakpoint === "compact",
    isMedium: () => viewport().breakpoint === "medium",
    isWide: () => viewport().breakpoint === "wide",
  }
}
