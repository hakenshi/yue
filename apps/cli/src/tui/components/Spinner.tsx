import { createSignal, onCleanup, onMount } from "solid-js"
import { useApp } from "../hooks/useApp.ts"

// Nerd Fonts weather moon_alt icons — full lunar cycle
const MOON_FRAMES = [
  "\uE3E3", // new moon
  "\uE3C8", // waxing_crescent_1
  "\uE3C9", // waxing_crescent_2
  "\uE3CA", // waxing_crescent_3
  "\uE3CB", // waxing_crescent_4
  "\uE3CC", // waxing_crescent_5
  "\uE3CD", // waxing_crescent_6
  "\uE3CE", // first_quarter
  "\uE3CF", // waxing_gibbous_1
  "\uE3D0", // waxing_gibbous_2
  "\uE3D1", // waxing_gibbous_3
  "\uE3D2", // waxing_gibbous_4
  "\uE3D3", // waxing_gibbous_5
  "\uE3D4", // waxing_gibbous_6
  "\uE3D5", // full moon
  "\uE3D6", // waning_gibbous_1
  "\uE3D7", // waning_gibbous_2
  "\uE3D8", // waning_gibbous_3
  "\uE3D9", // waning_gibbous_4
  "\uE3DA", // waning_gibbous_5
  "\uE3DB", // waning_gibbous_6
  "\uE3DC", // third_quarter
  "\uE3DD", // waning_crescent_1
  "\uE3DE", // waning_crescent_2
  "\uE3DF", // waning_crescent_3
  "\uE3E0", // waning_crescent_4
  "\uE3E1", // waning_crescent_5
  "\uE3E2", // waning_crescent_6
]

const THINKING_PHRASES = [
  "Contemplating the code...",
  "Reading between the lines...",
  "Following the thread...",
  "Connecting the dots...",
  "Tracing the logic...",
  "Mapping the patterns...",
  "Weighing the options...",
  "Sifting through context...",
  "Piecing it together...",
  "Exploring possibilities...",
  "Considering the approach...",
  "Analyzing the structure...",
  "Parsing the problem...",
  "Diving deeper...",
  "Thinking it through...",
  "Reviewing the details...",
  "Processing...",
  "Searching for a path...",
  "Untangling the logic...",
  "Looking at this carefully...",
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

export function Spinner(props: { label?: string }) {
  const { theme } = useApp()
  const [frame, setFrame] = createSignal(0)
  const [phrase, setPhrase] = createSignal(pickRandom(THINKING_PHRASES))

  onMount(() => {
    const frameInterval = setInterval(() => {
      setFrame((f) => (f + 1) % MOON_FRAMES.length)
    }, 120)

    const phraseInterval = setInterval(() => {
      setPhrase(pickRandom(THINKING_PHRASES))
    }, 3000)

    onCleanup(() => {
      clearInterval(frameInterval)
      clearInterval(phraseInterval)
    })
  })

  return (
    <box paddingLeft={3} marginLeft={1} marginBottom={1} flexDirection="row">
      <text fg={theme.accent}>{MOON_FRAMES[frame()]} </text>
      <text fg={theme.muted}>{props.label ?? phrase()}</text>
    </box>
  )
}
