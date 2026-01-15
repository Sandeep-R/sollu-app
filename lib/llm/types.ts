import { z } from 'zod'

// Evaluation rating enum
export const EvaluationRating = z.enum(['correct', 'partially_correct', 'incorrect'])
export type EvaluationRating = z.infer<typeof EvaluationRating>

// Error detail schema
export const EvaluationError = z.object({
  type: z.string(),
  location: z.string(),
  description: z.string(),
})
export type EvaluationError = z.infer<typeof EvaluationError>

// Main evaluation result schema
export const EvaluationResult = z.object({
  rating: EvaluationRating,
  feedback: z.string(),
  suggestions: z.array(z.string()),
  confidence: z.number().min(0).max(1).optional(),
  errors: z.array(EvaluationError).optional(),
})
export type EvaluationResult = z.infer<typeof EvaluationResult>

// Stored evaluation with metadata
export const StoredEvaluation = EvaluationResult.extend({
  evaluated_at: z.string(),
  llm_provider: z.string(),
  model: z.string(),
})
export type StoredEvaluation = z.infer<typeof StoredEvaluation>

// Word type for context
export interface Word {
  id: number
  tamil: string
  english: string
  pronunciation?: string
  type?: string
}

// LLM Provider interface
export interface LLMProvider {
  name: string
  model: string

  evaluateTamilSentence(
    tamil: string,
    words: Word[]
  ): Promise<EvaluationResult>

  evaluateAdminReplyTranslation(
    englishTranslation: string,
    tamilReply: string
  ): Promise<EvaluationResult>
}

// Evaluation types for history tracking
export type EvaluationType = 'tamil_sentence' | 'english_translation' | 'admin_reply_translation'

// Configuration
export interface LLMConfig {
  provider: 'openai' | 'anthropic'
  model: string
  enabled: boolean
}
