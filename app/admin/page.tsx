import { getWords } from '@/app/actions/words'
import AddWordForm from '@/components/AddWordForm'
import WordList from '@/components/WordList'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

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
    <main className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/conversations">Conversations</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back to App</Link>
            </Button>
          </div>
        </div>
        <AddWordForm />
        <WordList words={words} />
      </div>
    </main>
  )
}
