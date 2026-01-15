import { LLMProvider, EvaluationResult, StoredEvaluation, Word } from './types'
import { getLLMConfig, getOpenAIApiKey, getAnthropicApiKey } from './config'
import { OpenAIProvider } from './providers/openai'
import { AnthropicProvider } from './providers/anthropic'

let providerInstance: LLMProvider | null = null

function getProvider(): LLMProvider {
  if (providerInstance) {
    return providerInstance
  }

  const config = getLLMConfig()

  if (config.provider === 'openai') {
    const apiKey = getOpenAIApiKey()
    providerInstance = new OpenAIProvider(apiKey, config.model)
  } else if (config.provider === 'anthropic') {
    const apiKey = getAnthropicApiKey()
    providerInstance = new AnthropicProvider(apiKey, config.model)
  } else {
    throw new Error(`Unknown LLM provider: ${config.provider}`)
  }

  return providerInstance
}

function addMetadata(result: EvaluationResult): StoredEvaluation {
  const config = getLLMConfig()
  return {
    ...result,
    evaluated_at: new Date().toISOString(),
    llm_provider: config.provider,
    model: config.model,
  }
}

export async function evaluateTamilSentence(
  tamilSentence: string,
  words: Word[]
): Promise<StoredEvaluation> {
  const config = getLLMConfig()

  if (!config.enabled) {
    return {
      rating: 'correct',
      feedback: 'Evaluation is disabled. Sentence accepted.',
      suggestions: [],
      evaluated_at: new Date().toISOString(),
      llm_provider: 'disabled',
      model: 'none',
    }
  }

  const provider = getProvider()
  const result = await provider.evaluateTamilSentence(
    tamilSentence,
    words
  )

  return addMetadata(result)
}

export async function evaluateAdminReplyTranslation(
  englishTranslation: string,
  tamilReply: string
): Promise<StoredEvaluation> {
  const config = getLLMConfig()

  if (!config.enabled) {
    return {
      rating: 'correct',
      feedback: 'Evaluation is disabled. Translation accepted.',
      suggestions: [],
      evaluated_at: new Date().toISOString(),
      llm_provider: 'disabled',
      model: 'none',
    }
  }

  const provider = getProvider()
  const result = await provider.evaluateAdminReplyTranslation(
    englishTranslation,
    tamilReply
  )

  return addMetadata(result)
}
