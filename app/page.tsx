import FlashcardDeck from '@/components/FlashcardDeck'
import AuthButton from '@/components/AuthButton'
import NotificationPromptBanner from '@/components/NotificationPromptBanner'
import { getUser } from '@/lib/auth'

export default async function Home() {
  const user = await getUser()

  return (
    <main className="min-h-screen bg-background">
      <AuthButton />

      {/* Hero Section with subtle gradient accent */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-accent/5 to-transparent h-[300px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-20 pb-6 md:pb-8">
          <div className="text-center space-y-3 mb-0">
            <h1 className="text-foreground font-bold">
              Sollu
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Learn tamil with a partner
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-12 md:pb-20">
        {/* Show notification prompt banner for existing users */}
        {user && <NotificationPromptBanner />}

        <FlashcardDeck userId={user?.id ?? null} />
      </div>
    </main>
  )
}
