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

  if (!transliteration || !meaning) {
    return { error: 'Transliteration and meaning are required' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('words')
    .insert({ transliteration, meaning, tamil: tamil || null })

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
