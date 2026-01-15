'use server'

import { createClient } from '@/lib/supabase/server'
import { isAdmin, getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { StoredEvaluation } from '@/lib/llm/types'

export type ConversationStatus = 'pending' | 'replied' | 'completed'

export interface Conversation {
  id: string
  user_id: string
  session_id: string
  learner_sentence_tamil: string
  learner_sentence_english: string | null
  admin_reply_tamil: string | null
  learner_translation_english: string | null
  status: ConversationStatus
  word_ids_used: number[]
  created_at: string
  admin_replied_at: string | null
  completed_at: string | null
  // Evaluation fields
  tamil_sentence_evaluation: StoredEvaluation | null
  english_translation_evaluation: StoredEvaluation | null
  admin_reply_translation_evaluation: StoredEvaluation | null
  evaluation_attempts: number
  final_tamil_sentence: string | null
  final_english_translation: string | null
}

export interface ConversationWithUser extends Conversation {
  user_email?: string
}

// Submit a new Tamil sentence from learner (evaluation is optional)
export async function submitLearnerSentence(
  userId: string,
  sessionId: string,
  sentenceTamil: string,
  wordIds: number[],
  evaluation?: StoredEvaluation
) {
  if (!sentenceTamil.trim()) {
    return { error: 'Tamil sentence is required' }
  }

  if (wordIds.length === 0) {
    return { error: 'At least one word must be selected' }
  }

  // Evaluation is now optional - learners can submit regardless of score
  // This allows them to get help from instructors on difficult sentences

  const supabase = await createClient()

  // Get the current user's email
  const { data: { user } } = await supabase.auth.getUser()
  const userEmail = user?.email || 'Unknown'

  // Check if user already has an active conversation (any session)
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['pending', 'replied'])
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: 'You already have an active conversation. Please complete it first.' }
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      session_id: sessionId,
      learner_sentence_tamil: sentenceTamil.trim(),
      word_ids_used: wordIds,
      status: 'pending',
      user_email: userEmail,
      tamil_sentence_evaluation: evaluation || null,
      final_tamil_sentence: sentenceTamil.trim()
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/conversations')
  return { success: true, conversation: data as Conversation }
}

// Get active conversation for user (across all sessions)
export async function getActiveConversation(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'replied'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows returned" which is fine
    return { error: error.message }
  }

  return { conversation: data as Conversation | null }
}

// Get all conversations (admin only)
export async function getAllConversations(statusFilter?: ConversationStatus) {
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Unauthorized', conversations: [] }
  }

  const supabase = await createClient()

  let query = supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, conversations: [] }
  }

  // user_email is now stored directly in the conversations table
  const conversationsWithUsers: ConversationWithUser[] = data.map((c: Conversation & { user_email?: string }) => ({
    ...c,
    user_email: c.user_email || 'Unknown'
  }))

  return { conversations: conversationsWithUsers }
}

// Admin reply to conversation
export async function replyToConversation(conversationId: string, replyTamil: string) {
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Unauthorized' }
  }

  if (!replyTamil.trim()) {
    return { error: 'Reply is required' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversations')
    .update({
      admin_reply_tamil: replyTamil.trim(),
      status: 'replied',
      admin_replied_at: new Date().toISOString()
    })
    .eq('id', conversationId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/conversations')
  return { success: true, conversation: data as Conversation }
}

// Learner submits English translation of admin reply (requires passing evaluation)
export async function submitTranslation(
  conversationId: string,
  translationEnglish: string,
  evaluation?: StoredEvaluation
) {
  const user = await getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  if (!translationEnglish.trim()) {
    return { error: 'Translation is required' }
  }

  // Evaluation is now optional - learners can submit regardless of score
  // This allows them to complete the conversation even if they're unsure of the translation

  const supabase = await createClient()

  // First verify this conversation belongs to the user and is in 'replied' status
  const { data: conversation, error: fetchError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .eq('status', 'replied')
    .single()

  if (fetchError || !conversation) {
    return { error: 'Conversation not found or not ready for translation' }
  }

  const { data, error } = await supabase
    .from('conversations')
    .update({
      learner_translation_english: translationEnglish.trim(),
      status: 'completed',
      completed_at: new Date().toISOString(),
      admin_reply_translation_evaluation: evaluation || null
    })
    .eq('id', conversationId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/conversations')
  return { success: true, conversation: data as Conversation }
}

// Check if user has active conversation (across all sessions)
export async function checkHasActiveConversation(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select('id, status')
    .eq('user_id', userId)
    .in('status', ['pending', 'replied'])
    .limit(1)

  if (error) {
    return { error: error.message, hasActive: false }
  }

  return { hasActive: data && data.length > 0 }
}
