'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface FlashcardProps {
  word: {
    id: number
    transliteration: string
    meaning: string
    tamil?: string
    word_type?: string
  }
  isFlipped: boolean
  onFlip: () => void
  onMarkDone?: (wordId: number) => void
  isDone?: boolean
}

export default function Flashcard({ word, isFlipped, onFlip, onMarkDone, isDone }: FlashcardProps) {
  const handleDoneClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMarkDone && !isDone) {
      onMarkDone(word.id)
    }
  }

  const wordTypeLabel = word.word_type
    ? word.word_type.charAt(0).toUpperCase() + word.word_type.slice(1)
    : null

  return (
    <div className="flex flex-col items-center gap-3">
      {wordTypeLabel && (
        <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
          {wordTypeLabel}
        </span>
      )}
      <div
        onClick={onFlip}
        className={`w-[280px] h-[200px] cursor-pointer transition-opacity ${isDone ? 'opacity-50' : ''}`}
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
            className="absolute w-full h-full flex flex-col items-center justify-center p-5 shadow-xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-lg font-bold text-primary text-center leading-tight">
              {word.transliteration}
            </div>
            {word.tamil && (
              <div className="text-base text-muted-foreground mt-2 text-center">
                {word.tamil}
              </div>
            )}
            <div className="mt-auto pt-2 text-xs text-muted-foreground italic">
              Click to reveal meaning
            </div>
          </Card>

          {/* Back of card */}
          <Card
            className="absolute w-full h-full flex flex-col items-center justify-center p-5 bg-primary text-primary-foreground shadow-xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="text-base font-bold text-center leading-tight">
              {word.meaning}
            </div>
            {word.tamil && (
              <div className="text-sm text-primary-foreground/90 mt-2 text-center">
                {word.tamil}
              </div>
            )}
            <div className="mt-auto pt-2 text-xs text-primary-foreground/80 italic">
              Click to flip back
            </div>
          </Card>
        </div>
      </div>
      {onMarkDone && (
        <Button
          onClick={handleDoneClick}
          variant={isDone ? 'secondary' : 'outline'}
          size="sm"
          disabled={isDone}
          className={isDone
            ? 'bg-green-600 text-white hover:bg-green-600 cursor-default'
            : 'bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white'
          }
        >
          <Check className="w-4 h-4 mr-1" />
          {isDone ? 'Done' : 'Mark Done'}
        </Button>
      )}
    </div>
  )
}
