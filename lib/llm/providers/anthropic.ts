import Anthropic from '@anthropic-ai/sdk'
import { LLMProvider, EvaluationResult, Word, EvaluationResult as EvaluationResultSchema } from '../types'
import { buildTamilSentenceEvaluationPrompt } from '../prompts/tamil-sentence'
import { buildAdminReplyTranslationPrompt } from '../prompts/translation'

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic
  readonly name = 'anthropic'
  readonly model: string

  constructor(apiKey: string, model: string = 'claude-sonnet-4-5-20250929') {
    if (!apiKey) {
      throw new Error('Anthropic API key is required')
    }
    this.client = new Anthropic({ apiKey })
    this.model = model
  }

  private async callLLM(prompt: string): Promise<EvaluationResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic')
    }

    const text = content.text

    try {
      // Extract JSON from the response (Claude sometimes adds explanatory text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      const validated = EvaluationResultSchema.parse(parsed)
      return validated
    } catch (error) {
      console.error('Failed to parse LLM response:', text)
      throw new Error('Failed to parse evaluation response')
    }
  }

  async evaluateTamilSentence(
    tamil: string,
    words: Word[]
  ): Promise<EvaluationResult> {
    const prompt = buildTamilSentenceEvaluationPrompt(tamil, words)
    return this.callLLM(prompt)
  }

  async evaluateAdminReplyTranslation(
    englishTranslation: string,
    tamilReply: string
  ): Promise<EvaluationResult> {
    const prompt = buildAdminReplyTranslationPrompt(englishTranslation, tamilReply)
    return this.callLLM(prompt)
  }
}
