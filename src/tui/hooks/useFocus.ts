import { createSignal } from "solid-js"

export type FocusTarget = "input" | "chat" | "permission"

export function useFocus(initial: FocusTarget = "input") {
  const [focus, setFocus] = createSignal<FocusTarget>(initial)
  return { focus, setFocus }
}
