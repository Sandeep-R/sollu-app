'use client'

import { Card } from '@/components/ui/card'

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
      className="w-full aspect-video max-w-[500px] cursor-pointer"
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front of card */}
        <Card
          className="absolute w-full h-full flex flex-col items-center justify-center p-8 shadow-xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-4xl font-bold text-primary mb-4 text-center">
            {word.transliteration}
          </div>
          {word.tamil && (
            <div className="text-2xl text-muted-foreground mt-2">
              {word.tamil}
            </div>
          )}
          <div className="mt-8 text-sm text-muted-foreground italic">
            Click to reveal meaning
          </div>
        </Card>

        {/* Back of card */}
        <Card
          className="absolute w-full h-full flex flex-col items-center justify-center p-8 bg-primary text-primary-foreground shadow-xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="text-3xl font-bold text-center leading-relaxed">
            {word.meaning}
          </div>
          {word.tamil && (
            <div className="text-xl text-primary-foreground/90 mt-6">
              {word.tamil}
            </div>
          )}
          <div className="mt-8 text-sm text-primary-foreground/80 italic">
            Click to flip back
          </div>
        </Card>
      </div>
    </div>
  )
}
