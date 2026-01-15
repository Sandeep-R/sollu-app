import FlashcardDeck from '@/components/FlashcardDeck'
import AuthButton from '@/components/AuthButton'
import { getUser } from '@/lib/auth'

export default async function Home() {
  const user = await getUser()

  return (
    <main className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
      <AuthButton />
      <h1 className="text-white text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-center drop-shadow-lg mt-16 md:mt-0">
        Learn Tamil
      </h1>
      {user && (
        <p className="text-white/90 mb-6 text-base text-center">
          Welcome back! Ready to learn?
        </p>
      )}
      <FlashcardDeck userId={user?.id ?? null} />
    </main>
  )
}
