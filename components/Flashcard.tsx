'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, RotateCcw } from 'lucide-react'

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
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-[320px]">
      {wordTypeLabel && (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/50 border border-border/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {wordTypeLabel}
          </span>
        </div>
      )}

      <div
        onClick={onFlip}
        className={`w-full h-[240px] md:h-[280px] cursor-pointer transition-all duration-300 ${
          isDone ? 'opacity-60 scale-95' : 'hover:scale-[1.02]'
        }`}
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative w-full h-full transition-transform duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front of card */}
          <Card
            className="absolute w-full h-full flex flex-col items-center justify-center p-8 md:p-10 elevation-lg border-0 bg-card transition-smooth hover:elevation-xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="text-xl md:text-2xl font-medium text-foreground text-center tracking-tight">
                {word.transliteration}
              </div>
              {word.tamil && (
                <div className="text-2xl md:text-3xl text-primary/90 font-normal text-center">
                  {word.tamil}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RotateCcw className="w-3 h-3" />
              <span>Tap to reveal</span>
            </div>
          </Card>

          {/* Back of card */}
          <Card
            className="absolute w-full h-full flex flex-col items-center justify-center p-8 md:p-10 bg-primary text-primary-foreground elevation-lg border-0 transition-smooth"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="text-xl md:text-2xl font-medium text-center leading-relaxed">
                {word.meaning}
              </div>
              {word.tamil && (
                <div className="text-lg md:text-xl text-primary-foreground/80 font-light text-center">
                  {word.tamil}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
              <RotateCcw className="w-3 h-3" />
              <span>Tap to flip back</span>
            </div>
          </Card>
        </div>
      </div>

      {onMarkDone && (
        <Button
          onClick={handleDoneClick}
          variant={isDone ? 'secondary' : 'outline'}
          size="default"
          disabled={isDone}
          className={`
            min-w-[140px] transition-all duration-300
            ${isDone
              ? 'bg-success text-success-foreground hover:bg-success border-success shadow-sm'
              : 'hover:bg-secondary hover:border-primary/20'
            }
          `}
        >
          <Check className={`w-4 h-4 mr-2 transition-transform ${isDone ? 'scale-110' : ''}`} />
          {isDone ? 'Completed' : 'Mark Complete'}
        </Button>
      )}
    </div>
  )
}
