import FlashcardDeck from '@/components/FlashcardDeck'
import AuthButton from '@/components/AuthButton'
import { getUser } from '@/lib/auth'

export default async function Home() {
  const user = await getUser()

  return (
    <main className="gradient-bg min-h-screen flex flex-col items-center justify-center p-8 relative">
      <AuthButton />
      <h1 className="text-white text-4xl font-bold mb-12 text-center drop-shadow-lg">
        Learn Tamil
      </h1>
      {user && (
        <p className="text-white/90 mb-4 text-base text-center">
          Welcome back! Ready to learn?
        </p>
      )}
      <FlashcardDeck />
    </main>
  )
}
