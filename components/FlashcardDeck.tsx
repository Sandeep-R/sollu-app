'use client'

import { useState, useEffect, useCallback } from 'react'
import Flashcard from './Flashcard'
import SentenceSubmissionForm from './SentenceSubmissionForm'
import WaitingState from './WaitingState'
import TranslationForm from './TranslationForm'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2, CheckCircle } from 'lucide-react'
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

  // Render based on flow state
  if (flowState === 'waiting' && activeConversation) {
    return (
      <div className="flex flex-col items-center gap-8 w-full">
        <WaitingState
          sentenceTamil={activeConversation.learner_sentence_tamil}
          onCheckForReply={handleCheckForReply}
        />
      </div>
    )
  }

  if (flowState === 'translate' && activeConversation && activeConversation.admin_reply_tamil) {
    return (
      <div className="flex flex-col items-center gap-8 w-full">
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
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
          <h3 className="text-2xl font-semibold text-white">Conversation Complete!</h3>
          <p className="text-white/70">Great job! You can now get new cards to continue learning.</p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white px-6"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Get New Cards
          </Button>
        </div>
      </div>
    )
  }

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

          {allCurrentCardsDone && flowState === 'cards' && (
            <div className="flex flex-col items-center gap-4 w-full">
              <p className="text-white/80 text-center">Great job! Now write a Tamil sentence using these words.</p>
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
