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
    <main className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="text-xs md:text-sm h-9 md:h-10">
              <Link href="/admin/conversations">Conversations</Link>
            </Button>
            <Button variant="outline" asChild className="text-xs md:text-sm h-9 md:h-10">
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
