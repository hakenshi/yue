export type ThemeColors = {
  bg: string
  fg: string
  accent: string
  accentDim: string
  secondary: string
  muted: string
  error: string
  success: string
  warning: string
  border: string
  surface: string
  inputBg: string
  selectedBg: string
}

const yue: ThemeColors = {
  bg: "#0A0A0A",
  fg: "#E4E4E7",
  accent: "#8B5CF6",
  accentDim: "#6D28D9",
  secondary: "#A78BFA",
  muted: "#52525B",
  error: "#EF4444",
  success: "#22C55E",
  warning: "#F59E0B",
  border: "#27272A",
  surface: "#141416",
  inputBg: "#18181B",
  selectedBg: "#1E1B4B",
}

const dracula: ThemeColors = {
  bg: "#282A36",
  fg: "#F8F8F2",
  accent: "#BD93F9",
  accentDim: "#9B71DB",
  secondary: "#FF79C6",
  muted: "#6272A4",
  error: "#FF5555",
  success: "#50FA7B",
  warning: "#F1FA8C",
  border: "#44475A",
  surface: "#2D2F3D",
  inputBg: "#21222C",
  selectedBg: "#44475A",
}

const nord: ThemeColors = {
  bg: "#2E3440",
  fg: "#ECEFF4",
  accent: "#88C0D0",
  accentDim: "#5E81AC",
  secondary: "#81A1C1",
  muted: "#4C566A",
  error: "#BF616A",
  success: "#A3BE8C",
  warning: "#EBCB8B",
  border: "#3B4252",
  surface: "#353B49",
  inputBg: "#3B4252",
  selectedBg: "#434C5E",
}

const gruvbox: ThemeColors = {
  bg: "#282828",
  fg: "#EBDBB2",
  accent: "#FE8019",
  accentDim: "#D65D0E",
  secondary: "#FABD2F",
  muted: "#928374",
  error: "#FB4934",
  success: "#B8BB26",
  warning: "#FABD2F",
  border: "#3C3836",
  surface: "#32302F",
  inputBg: "#3C3836",
  selectedBg: "#504945",
}

const tokyonight: ThemeColors = {
  bg: "#1A1B26",
  fg: "#C0CAF5",
  accent: "#7AA2F7",
  accentDim: "#3D59A1",
  secondary: "#BB9AF7",
  muted: "#565F89",
  error: "#F7768E",
  success: "#9ECE6A",
  warning: "#E0AF68",
  border: "#292E42",
  surface: "#1F2335",
  inputBg: "#24283B",
  selectedBg: "#292E42",
}

const catppuccin: ThemeColors = {
  bg: "#1E1E2E",
  fg: "#CDD6F4",
  accent: "#CBA6F7",
  accentDim: "#9B7ECF",
  secondary: "#F5C2E7",
  muted: "#585B70",
  error: "#F38BA8",
  success: "#A6E3A1",
  warning: "#F9E2AF",
  border: "#313244",
  surface: "#232336",
  inputBg: "#181825",
  selectedBg: "#313244",
}

export const themePresets: Record<string, ThemeColors> = {
  yue,
  dracula,
  nord,
  gruvbox,
  tokyonight,
  catppuccin,
}

export function getPreset(name: string): ThemeColors {
  return themePresets[name] ?? yue
}
