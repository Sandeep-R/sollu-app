import { getWords } from '@/app/actions/words'
import AddWordForm from '@/components/AddWordForm'
import WordList from '@/components/WordList'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import '@/components/AdminStyles.css'

export default async function AdminPage() {
  const user = await getUser()

  if (!user) {
    redirect('/signin')
  }

  // Check if user is admin
  const supabase = await createClient()
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleData?.role !== 'admin') {
    redirect('/')
  }

  const { words } = await getWords()

  return (
    <main className="admin-container">
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <Link href="/" className="back-link">
            Back to App
          </Link>
        </div>
        <AddWordForm />
        <WordList words={words} />
      </div>
    </main>
  )
}
