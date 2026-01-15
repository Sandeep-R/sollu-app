'use client'

import { useState } from 'react'
import Flashcard from './Flashcard'
import { Button } from '@/components/ui/button'

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
    <div className="flex flex-col items-center gap-8 w-full max-w-[600px]">
      <div className="flex gap-4 items-center mb-4">
        <span className="text-white text-base font-medium opacity-90">
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      <Flashcard
        word={currentWord}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />

      <div className="flex gap-4 w-full justify-center">
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white px-8"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          variant="outline"
          className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white px-8"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
