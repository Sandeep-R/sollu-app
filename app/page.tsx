import FlashcardDeck from '@/components/FlashcardDeck'

export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
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
      <FlashcardDeck />
    </main>
  )
}
