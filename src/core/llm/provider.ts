import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type { YueConfig } from "../config/schema.ts"
import { getApiKey } from "../config/loader.ts"

export function createProvider(config: YueConfig) {
  const apiKey = getApiKey(config)

  switch (config.provider) {
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey })
      return google(config.model)
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey })
      return anthropic(config.model)
    }
    case "openai": {
      const openai = createOpenAI({ apiKey })
      return openai(config.model)
    }
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
