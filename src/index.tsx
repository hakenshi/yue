import { render } from "@opentui/solid"
import { App } from "./app.tsx"

// Detect tmux and screen environments
const isTmux = process.env.TMUX !== undefined
const isScreen = process.env.TERM?.startsWith("screen")
const isTmuxTerm = process.env.TERM?.startsWith("tmux")

// Set terminal compatibility flags for tmux/screen
if (isTmux || isScreen || isTmuxTerm) {
  // Force wcwidth for proper character width in tmux
  if (process.env.OPENTUI_FORCE_WCWIDTH === undefined) {
    process.env.OPENTUI_FORCE_WCWIDTH = "true"
  }
  // Disable graphics protocol which often breaks in tmux
  if (process.env.OPENTUI_NO_GRAPHICS === undefined) {
    process.env.OPENTUI_NO_GRAPHICS = "true"
  }
}

render(() => <App />, {
  exitOnCtrlC: true,
})
