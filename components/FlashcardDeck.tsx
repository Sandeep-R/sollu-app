'use client'

import { useState, useEffect, useCallback } from 'react'
import Flashcard from './Flashcard'
import SentenceSubmissionForm from './SentenceSubmissionForm'
import WaitingState from './WaitingState'
import TranslationForm from './TranslationForm'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2, CheckCircle2, BookOpen, Sparkles } from 'lucide-react'
import { getRandomWords, markWordDone, Word } from '@/app/actions/words'
import { getActiveConversation, Conversation } from '@/app/actions/conversations'

interface FlashcardDeckProps {
  userId: string | null
}

type ConversationFlow = 'cards' | 'sentence' | 'waiting' | 'translate' | 'completed'

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

  // Conversation flow state
  const [flowState, setFlowState] = useState<ConversationFlow>('cards')
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)

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

  // Check for active conversation (user-level, not session-level)
  const checkConversation = useCallback(async () => {
    if (!userId) return

    const result = await getActiveConversation(userId)
    if (result.conversation) {
      setActiveConversation(result.conversation)
      if (result.conversation.status === 'pending') {
        setFlowState('waiting')
      } else if (result.conversation.status === 'replied') {
        setFlowState('translate')
      }
    }
  }, [userId])

  // Fetch words when session is ready
  const fetchWords = useCallback(async () => {
    if (!userId || !sessionId) return

    setIsLoading(true)
    setError(null)

    try {
      // First check if there's an active conversation
      await checkConversation()

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
  }, [userId, sessionId, checkConversation])

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
    setFlowState('cards')
    setActiveConversation(null)
  }

  const handleSentenceSubmitted = () => {
    setFlowState('waiting')
    checkConversation()
  }

  const handleCheckForReply = useCallback(async () => {
    if (!userId) return

    const result = await getActiveConversation(userId)
    if (result.conversation) {
      setActiveConversation(result.conversation)
      if (result.conversation.status === 'replied') {
        setFlowState('translate')
      }
    }
  }, [userId])

  const handleTranslationSubmitted = () => {
    setFlowState('completed')
  }

  // Show message if user is not authenticated
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-12 md:p-20">
        <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h3 className="text-2xl font-light text-foreground">Welcome</h3>
          <p className="text-muted-foreground leading-relaxed">
            Sign in to begin your Tamil learning journey
          </p>
        </div>
      </div>
    )
  }

  // Show loading while fetching words or waiting for session
  if (isLoading || !sessionId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Preparing your session</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-6 p-12 md:p-20">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-destructive font-medium">{error}</p>
          <Button
            onClick={fetchWords}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const hasAnyWords = words.noun || words.verb || words.adjective

  // Check if all current cards are marked done
  const nounDone = !words.noun || doneWords.has(words.noun.id)
  const verbDone = !words.verb || doneWords.has(words.verb.id)
  const adjectiveDone = !words.adjective || doneWords.has(words.adjective.id)
  const allCurrentCardsDone = hasAnyWords && nounDone && verbDone && adjectiveDone

  // Render based on flow state
  if (flowState === 'waiting' && activeConversation) {
    return (
      <div className="flex flex-col items-center gap-4 md:gap-8 w-full px-4 md:px-0">
        <WaitingState
          sentenceTamil={activeConversation.learner_sentence_tamil}
          onCheckForReply={handleCheckForReply}
        />
      </div>
    )
  }

  if (flowState === 'translate' && activeConversation && activeConversation.admin_reply_tamil) {
    return (
      <div className="flex flex-col items-center gap-4 md:gap-8 w-full px-4 md:px-0">
        <TranslationForm
          conversationId={activeConversation.id}
          adminReplyTamil={activeConversation.admin_reply_tamil}
          learnerSentenceTamil={activeConversation.learner_sentence_tamil}
          onSubmitSuccess={handleTranslationSubmitted}
        />
      </div>
    )
  }

  if (flowState === 'completed') {
    return (
      <div className="flex flex-col items-center gap-8 md:gap-12 w-full px-4 md:px-0 py-12 md:py-20">
        <div className="text-center space-y-6 max-w-lg">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-success/10 flex items-center justify-center mx-auto elevation-md">
            <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-success" />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl md:text-4xl font-light text-foreground tracking-tight">
              Conversation Complete
            </h3>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Excellent work! Ready to continue your learning journey?
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            size="lg"
            className="mt-6 min-w-[200px] elevation-md hover:elevation-lg transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start New Session
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 md:gap-12 w-full px-4 md:px-8 py-6 md:py-12">
      {!hasAnyWords ? (
        <div className="flex flex-col items-center gap-6 p-12 md:p-20">
          <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h3 className="text-2xl font-light text-foreground">No Words Available</h3>
            <p className="text-muted-foreground leading-relaxed">
              Check back soon for new words to learn
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12 justify-center items-center md:items-start w-full max-w-7xl">
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

          {allCurrentCardsDone && flowState === 'cards' && (
            <div className="flex flex-col items-center gap-6 w-full max-w-3xl mt-8">
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-success/10 border border-success/20">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <p className="text-foreground font-medium">
                  Ready for the next step
                </p>
              </div>
              <SentenceSubmissionForm
                userId={userId}
                sessionId={sessionId}
                words={words}
                onSubmitSuccess={handleSentenceSubmitted}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
