import FlashcardDeck from '@/components/FlashcardDeck'
import AuthButton from '@/components/AuthButton'
import { getUser } from '@/lib/auth'

export default async function Home() {
  const user = await getUser()

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      <AuthButton />
      <h1 style={{
        color: 'white',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '3rem',
        textAlign: 'center',
        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        Learn Tamil
      </h1>
      {user && (
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '1rem',
          fontSize: '1rem',
          textAlign: 'center'
        }}>
          Welcome back! Ready to learn?
        </p>
      )}
      <FlashcardDeck />
    </main>
  )
}
