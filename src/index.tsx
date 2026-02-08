import { render } from "@opentui/solid"
import { App } from "./app.tsx"

render(() => <App />, {
  exitOnCtrlC: true,
})
