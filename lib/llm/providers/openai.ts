import OpenAI from 'openai'
import { LLMProvider, EvaluationResult, Word, EvaluationResult as EvaluationResultSchema } from '../types'
import { buildTamilSentenceEvaluationPrompt } from '../prompts/tamil-sentence'
import { buildAdminReplyTranslationPrompt } from '../prompts/translation'

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI
  readonly name = 'openai'
  readonly model: string

  constructor(apiKey: string, model: string = 'gpt-4-turbo') {
    if (!apiKey) {
      throw new Error('OpenAI API key is required')
    }
    this.client = new OpenAI({ apiKey })
    this.model = model
  }

  private async callLLM(prompt: string): Promise<EvaluationResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert Tamil language evaluator. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    try {
      const parsed = JSON.parse(content)
      const validated = EvaluationResultSchema.parse(parsed)
      return validated
    } catch (error) {
      console.error('Failed to parse LLM response:', content)
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
