import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type { LanguageModel } from "ai"
import type { YueConfig } from "../../types/config"
import { getApiKey } from "../config/loader.ts"

// @ai-sdk/anthropic and @ai-sdk/openai still export LanguageModelV1,
// while ai@6 expects LanguageModelV2|V3. streamText handles the
// conversion internally, so we accept any model shape here.
export type AnyModel = LanguageModel | { specificationVersion: string }

export interface LLMProvider {
  createModel(model: string): AnyModel
}

class AnthropicProvider implements LLMProvider {
  constructor(private apiKey?: string) {}

  createModel(model: string) {
    const anthropic = createAnthropic({ apiKey: this.apiKey })
    return anthropic(model)
  }
}

class OpenAIProvider implements LLMProvider {
  constructor(private apiKey?: string) {}

  createModel(model: string) {
    const openai = createOpenAI({ apiKey: this.apiKey })
    return openai(model)
  }
}

class GoogleProvider implements LLMProvider {
  constructor(private apiKey?: string) {}

  createModel(model: string) {
    const google = createGoogleGenerativeAI({ apiKey: this.apiKey })
    return google(model)
  }
}

export function createProvider(config: YueConfig): LLMProvider {
  const apiKey = getApiKey(config)

  switch (config.provider) {
    case "google":
      return new GoogleProvider(apiKey)
    case "anthropic":
      return new AnthropicProvider(apiKey)
    case "openai":
      return new OpenAIProvider(apiKey)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
