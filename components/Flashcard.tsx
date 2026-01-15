'use client'

interface FlashcardProps {
  word: {
    id: number
    transliteration: string
    meaning: string
    tamil?: string
  }
  isFlipped: boolean
  onFlip: () => void
}

export default function Flashcard({ word, isFlipped, onFlip }: FlashcardProps) {
  return (
    <div
      onClick={onFlip}
      style={{
        width: '100%',
        aspectRatio: '16/9',
        maxWidth: '500px',
        perspective: '1000px',
        cursor: 'pointer'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front of card */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#667eea',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {word.transliteration}
          </div>
          {word.tamil && (
            <div style={{
              fontSize: '1.5rem',
              color: '#764ba2',
              marginTop: '0.5rem'
            }}>
              {word.tamil}
            </div>
          )}
          <div style={{
            marginTop: '2rem',
            fontSize: '0.9rem',
            color: '#666',
            fontStyle: 'italic'
          }}>
            Click to reveal meaning
          </div>
        </div>

        {/* Back of card */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: '#667eea',
            borderRadius: '1rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            transform: 'rotateY(180deg)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            {word.meaning}
          </div>
          {word.tamil && (
            <div style={{
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.9)',
              marginTop: '1.5rem'
            }}>
              {word.tamil}
            </div>
          )}
          <div style={{
            marginTop: '2rem',
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.8)',
            fontStyle: 'italic'
          }}>
            Click to flip back
          </div>
        </div>
      </div>
    </div>
  )
}
