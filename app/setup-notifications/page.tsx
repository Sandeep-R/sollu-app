'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NotificationPermission from '@/components/NotificationPermission'
import { createClient } from '@/lib/supabase/client'

export default function SetupNotificationsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Not logged in, redirect to home
        router.push('/')
      } else {
        setUserId(user.id)
      }
      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleComplete = (granted: boolean) => {
    // Redirect to home after notification setup (granted or skipped)
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!userId) {
    return null
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <NotificationPermission userId={userId} onComplete={handleComplete} showSkip={true} />
    </main>
  )
}
