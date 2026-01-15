'use client'

import { useState } from 'react'
import Flashcard from './Flashcard'

interface Word {
  id: number
  transliteration: string
  meaning: string
  tamil?: string
}

const words: Word[] = [
  {
    id: 1,
    transliteration: 'Vanakkam',
    meaning: 'Hello / Greetings',
    tamil: 'வணக்கம்'
  },
  {
    id: 2,
    transliteration: 'Nandri',
    meaning: 'Thank you',
    tamil: 'நன்றி'
  },
  {
    id: 3,
    transliteration: 'Nalla irukkingala?',
    meaning: 'How are you?',
    tamil: 'நல்லா இருக்கீங்களா?'
  }
]

export default function FlashcardDeck() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const currentWord = words[currentIndex]

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % words.length)
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length)
  }

  const handleFlip = () => {
    setIsFlipped((prev) => !prev)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      width: '100%',
      maxWidth: '600px'
    }}>
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <span style={{
          color: 'white',
          fontSize: '1rem',
          fontWeight: '500',
          opacity: 0.9
        }}>
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      <Flashcard 
        word={currentWord} 
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />

      <div style={{
        display: 'flex',
        gap: '1rem',
        width: '100%',
        justifyContent: 'center'
      }}>
        <button
          onClick={handlePrevious}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          Next
        </button>
      </div>
    </div>
  )
}
