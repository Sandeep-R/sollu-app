'use server'

import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function addWord(formData: FormData) {
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Unauthorized' }
  }

  const transliteration = formData.get('transliteration') as string
  const meaning = formData.get('meaning') as string
  const tamil = formData.get('tamil') as string
  const word_type = formData.get('word_type') as string

  if (!transliteration || !meaning) {
    return { error: 'Transliteration and meaning are required' }
  }

  if (!word_type || !['noun', 'verb', 'adjective'].includes(word_type)) {
    return { error: 'Valid word type is required' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('words')
    .insert({ transliteration, meaning, tamil: tamil || null, word_type })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function deleteWord(id: number) {
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('words')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function getWords() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return { error: error.message, words: [] }
  }

  return { words: data }
}

export type WordType = 'noun' | 'verb' | 'adjective'

export interface Word {
  id: number
  transliteration: string
  meaning: string
  tamil?: string
  word_type: WordType
}

export interface RandomWordsResult {
  noun: Word | null
  verb: Word | null
  adjective: Word | null
  error?: string
}

// Get one random word of each type, excluding words marked as done in current session
export async function getRandomWords(userId: string, sessionId: string): Promise<RandomWordsResult> {
  const supabase = await createClient()

  // Get IDs of words already marked as done in this session
  const { data: doneWords, error: doneError } = await supabase
    .from('user_word_progress')
    .select('word_id')
    .eq('user_id', userId)
    .eq('session_id', sessionId)

  if (doneError) {
    return { noun: null, verb: null, adjective: null, error: doneError.message }
  }

  const doneWordIds = doneWords?.map(d => d.word_id) || []

  // Helper to get random word of a specific type
  const getRandomWordOfType = async (wordType: WordType): Promise<Word | null> => {
    let query = supabase
      .from('words')
      .select('*')
      .eq('word_type', wordType)

    if (doneWordIds.length > 0) {
      query = query.not('id', 'in', `(${doneWordIds.join(',')})`)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      return null
    }

    // Pick a random word from the results
    const randomIndex = Math.floor(Math.random() * data.length)
    return data[randomIndex] as Word
  }

  const [noun, verb, adjective] = await Promise.all([
    getRandomWordOfType('noun'),
    getRandomWordOfType('verb'),
    getRandomWordOfType('adjective')
  ])

  return { noun, verb, adjective }
}

// Mark a word as done for the current session
export async function markWordDone(userId: string, wordId: number, sessionId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_word_progress')
    .insert({
      user_id: userId,
      word_id: wordId,
      session_id: sessionId
    })

  if (error) {
    // Ignore duplicate key errors (word already marked as done)
    if (error.code === '23505') {
      return { success: true }
    }
    return { error: error.message }
  }

  return { success: true }
}

// Clear all progress for a session (allows refresh with new words)
export async function clearSessionProgress(userId: string, sessionId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_word_progress')
    .delete()
    .eq('user_id', userId)
    .eq('session_id', sessionId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
