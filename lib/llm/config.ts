import { LLMConfig } from './types'

export function getLLMConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER || 'openai') as 'openai' | 'anthropic'
  const model = process.env.LLM_MODEL || 'gpt-4-turbo'
  const enabled = process.env.LLM_EVALUATION_ENABLED !== 'false'

  return {
    provider,
    model,
    enabled,
  }
}

export function getOpenAIApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not set. ' +
      'Please add it to your .env.local file.'
    )
  }
  return apiKey
}

export function getAnthropicApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not set. ' +
      'Please add it to your .env.local file.'
    )
  }
  return apiKey
}
