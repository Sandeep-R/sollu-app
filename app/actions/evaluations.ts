'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import {
  evaluateTamilSentence as evaluateTamil,
  evaluateAdminReplyTranslation as evaluateAdminReply,
} from '@/lib/llm/evaluator'
import { StoredEvaluation, Word, EvaluationType } from '@/lib/llm/types'

export type { StoredEvaluation, EvaluationType }

interface EvaluationResponse {
  success?: boolean
  error?: string
  evaluation?: StoredEvaluation
}

// Evaluate a Tamil sentence before submission (no English translation required initially)
export async function evaluateTamilSentence(
  tamilSentence: string,
  wordIds: number[]
): Promise<EvaluationResponse> {
  const user = await getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  if (!tamilSentence.trim()) {
    return { error: 'Tamil sentence is required' }
  }

  if (wordIds.length === 0) {
    return { error: 'At least one word must be selected' }
  }

  try {
    const supabase = await createClient()

    // Get the words for context
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, tamil, meaning, transliteration, word_type')
      .in('id', wordIds)

    if (wordsError) {
      return { error: 'Failed to fetch words' }
    }

    const wordList: Word[] = (words || []).map((w) => ({
      id: w.id,
      tamil: w.tamil,
      english: w.meaning,
      pronunciation: w.transliteration,
      type: w.word_type,
    }))

    // Call the LLM evaluator (only evaluating Tamil sentence, no translation)
    const evaluation = await evaluateTamil(
      tamilSentence.trim(),
      wordList
    )

    return { success: true, evaluation }
  } catch (error) {
    console.error('Evaluation error:', error)
    return {
      error: error instanceof Error ? error.message : 'Evaluation failed',
    }
  }
}

// Evaluate the learner's translation of admin's Tamil reply
export async function evaluateAdminReplyTranslation(
  conversationId: string,
  englishTranslation: string
): Promise<EvaluationResponse> {
  const user = await getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  if (!englishTranslation.trim()) {
    return { error: 'English translation is required' }
  }

  try {
    const supabase = await createClient()

    // Get the conversation to find the admin's Tamil reply
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('admin_reply_tamil, user_id, status')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return { error: 'Conversation not found' }
    }

    if (conversation.user_id !== user.id) {
      return { error: 'Unauthorized' }
    }

    if (conversation.status !== 'replied') {
      return { error: 'Conversation is not ready for translation' }
    }

    if (!conversation.admin_reply_tamil) {
      return { error: 'No admin reply to translate' }
    }

    // Call the LLM evaluator
    const evaluation = await evaluateAdminReply(
      englishTranslation.trim(),
      conversation.admin_reply_tamil
    )

    // Update the conversation with evaluation result and increment attempts
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        admin_reply_translation_evaluation: evaluation,
        evaluation_attempts: supabase.rpc('increment_counter', {
          row_id: conversationId,
          field: 'evaluation_attempts',
        }),
      })
      .eq('id', conversationId)

    if (updateError) {
      console.error('Failed to save evaluation:', updateError)
      // Don't fail the request, evaluation was still successful
    }

    return { success: true, evaluation }
  } catch (error) {
    console.error('Evaluation error:', error)
    return {
      error: error instanceof Error ? error.message : 'Evaluation failed',
    }
  }
}

// Save evaluation to history (for analytics)
export async function saveEvaluationToHistory(
  conversationId: string,
  evaluationType: EvaluationType,
  evaluation: StoredEvaluation,
  learnerInput: string
): Promise<{ success?: boolean; error?: string }> {
  const user = await getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const supabase = await createClient()

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation || conversation.user_id !== user.id) {
      return { error: 'Unauthorized' }
    }

    // Insert evaluation history (using service role would be needed for insert)
    // For now, we'll skip this as RLS doesn't allow direct inserts
    // This would typically be done with a service role client

    return { success: true }
  } catch (error) {
    console.error('Failed to save evaluation history:', error)
    return { error: 'Failed to save evaluation history' }
  }
}
