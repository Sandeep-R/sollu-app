'use client'

import { useState, useEffect, useCallback } from 'react'
import Flashcard from './Flashcard'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'
import { getRandomWords, markWordDone, Word } from '@/app/actions/words'

interface FlashcardDeckProps {
  userId: string | null
}

export default function FlashcardDeck({ userId }: FlashcardDeckProps) {
  const [sessionId, setSessionId] = useState<string>('')
  const [words, setWords] = useState<{ noun: Word | null; verb: Word | null; adjective: Word | null }>({
    noun: null,
    verb: null,
    adjective: null
  })
  const [flippedCards, setFlippedCards] = useState<{ noun: boolean; verb: boolean; adjective: boolean }>({
    noun: false,
    verb: false,
    adjective: false
  })
  const [doneWords, setDoneWords] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate session ID on mount
  useEffect(() => {
    if (!userId) return

    const storedSessionId = sessionStorage.getItem('learningSessionId')
    if (storedSessionId) {
      setSessionId(storedSessionId)
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('learningSessionId', newSessionId)
      setSessionId(newSessionId)
    }
  }, [userId])

  // Fetch words when session is ready
  const fetchWords = useCallback(async () => {
    if (!userId || !sessionId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await getRandomWords(userId, sessionId)
      if (result.error) {
        setError(result.error)
      } else {
        setWords({
          noun: result.noun,
          verb: result.verb,
          adjective: result.adjective
        })
        setFlippedCards({ noun: false, verb: false, adjective: false })
      }
    } catch (err) {
      setError('Failed to load words')
    } finally {
      setIsLoading(false)
    }
  }, [userId, sessionId])

  useEffect(() => {
    if (sessionId && userId) {
      fetchWords()
    }
  }, [sessionId, userId, fetchWords])

  const handleFlip = (type: 'noun' | 'verb' | 'adjective') => {
    setFlippedCards(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const handleMarkDone = async (wordId: number) => {
    if (!userId || !sessionId) return

    const result = await markWordDone(userId, wordId, sessionId)
    if (result.success) {
      setDoneWords(prev => new Set([...prev, wordId]))
    }
  }

  const handleRefresh = async () => {
    if (!userId || !sessionId) return

    setIsLoading(true)

    // Create a new session
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('learningSessionId', newSessionId)
    setSessionId(newSessionId)
    setDoneWords(new Set())
  }

  // Show message if user is not authenticated
  if (!userId) {
    return (
      <div className="text-white/80 text-center p-8">
        <p className="text-lg mb-2">Sign in to start learning!</p>
        <p className="text-sm opacity-70">Track your progress and learn Tamil words</p>
      </div>
    )
  }

  // Show loading while fetching words or waiting for session
  if (isLoading || !sessionId) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-300 text-center p-8">
        <p>{error}</p>
        <Button
          onClick={fetchWords}
          variant="outline"
          className="mt-4 bg-white/20 text-white border-white/30 hover:bg-white/30"
        >
          Try Again
        </Button>
      </div>
    )
  }

  const hasAnyWords = words.noun || words.verb || words.adjective

  // Check if all current cards are marked done
  const nounDone = !words.noun || doneWords.has(words.noun.id)
  const verbDone = !words.verb || doneWords.has(words.verb.id)
  const adjectiveDone = !words.adjective || doneWords.has(words.adjective.id)
  const allCurrentCardsDone = hasAnyWords && nounDone && verbDone && adjectiveDone

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {!hasAnyWords ? (
        <div className="text-white/80 text-center p-8">
          <p className="text-lg">No words available yet.</p>
          <p className="text-sm opacity-70">Check back later!</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-center md:items-start w-full">
            {words.noun && (
              <Flashcard
                word={words.noun}
                isFlipped={flippedCards.noun}
                onFlip={() => handleFlip('noun')}
                onMarkDone={handleMarkDone}
                isDone={doneWords.has(words.noun.id)}
              />
            )}
            {words.verb && (
              <Flashcard
                word={words.verb}
                isFlipped={flippedCards.verb}
                onFlip={() => handleFlip('verb')}
                onMarkDone={handleMarkDone}
                isDone={doneWords.has(words.verb.id)}
              />
            )}
            {words.adjective && (
              <Flashcard
                word={words.adjective}
                isFlipped={flippedCards.adjective}
                onFlip={() => handleFlip('adjective')}
                onMarkDone={handleMarkDone}
                isDone={doneWords.has(words.adjective.id)}
              />
            )}
          </div>

          {allCurrentCardsDone && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-white/80 text-center">Great job! You&apos;ve completed all three cards.</p>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white px-6"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Get New Cards
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
