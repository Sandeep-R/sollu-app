'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { submitLearnerSentence } from '@/app/actions/conversations'
import { evaluateTamilSentence } from '@/app/actions/evaluations'
import { Word } from '@/app/actions/words'
import { StoredEvaluation } from '@/lib/llm/types'
import { EvaluationFeedback, EvaluationLoading } from '@/components/EvaluationFeedback'

interface SentenceSubmissionFormProps {
  userId: string
  sessionId: string
  words: { noun: Word | null; verb: Word | null; adjective: Word | null }
  onSubmitSuccess: () => void
}

export default function SentenceSubmissionForm({
  userId,
  sessionId,
  words,
  onSubmitSuccess
}: SentenceSubmissionFormProps) {
  const [sentence, setSentence] = useState('')
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<StoredEvaluation | null>(null)

  const availableWords = [words.noun, words.verb, words.adjective].filter(
    (w): w is Word => w !== null
  )

  const toggleWordSelection = (wordId: number) => {
    setSelectedWords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(wordId)) {
        newSet.delete(wordId)
      } else {
        newSet.add(wordId)
      }
      return newSet
    })
    setEvaluation(null)
  }

  const handleSentenceChange = (value: string) => {
    setSentence(value)
    setEvaluation(null)
  }

  const handleEvaluate = async () => {
    if (!sentence.trim()) {
      setError('Please enter a Tamil sentence')
      return
    }

    if (selectedWords.size === 0) {
      setError('Please select at least one word that you used')
      return
    }

    setIsEvaluating(true)
    setError(null)

    const result = await evaluateTamilSentence(
      sentence.trim(),
      Array.from(selectedWords)
    )

    setIsEvaluating(false)

    if (result.error) {
      setError(result.error)
    } else if (result.evaluation) {
      setEvaluation(result.evaluation)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sentence.trim()) {
      setError('Please enter a Tamil sentence')
      return
    }

    if (selectedWords.size === 0) {
      setError('Please select at least one word that you used')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await submitLearnerSentence(
      userId,
      sessionId,
      sentence.trim(),
      Array.from(selectedWords),
      evaluation || undefined
    )

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      onSubmitSuccess()
    }
  }

  const canSubmit = sentence.trim() && selectedWords.size > 0

  return (
    <Card className="w-full max-w-3xl elevation-lg border-0">
      <CardHeader className="p-6 md:p-8 pb-4">
        <CardTitle className="text-center text-2xl md:text-3xl font-light">
          Compose Your Sentence
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 md:p-8 pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Word Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              Select words to include
            </Label>
            <div className="flex flex-wrap gap-2">
              {availableWords.map(word => (
                <button
                  key={word.id}
                  type="button"
                  onClick={() => toggleWordSelection(word.id)}
                  className={`
                    px-4 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px]
                    ${selectedWords.has(word.id)
                      ? 'bg-primary text-primary-foreground elevation-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                    }
                  `}
                >
                  <span className="text-base">{word.tamil || word.transliteration}</span>
                  <span className="text-xs ml-2 opacity-70">({word.word_type})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sentence Input */}
          <div className="space-y-3">
            <Label htmlFor="sentence" className="text-sm font-medium text-foreground">
              Your Tamil sentence
            </Label>
            <textarea
              id="sentence"
              value={sentence}
              onChange={e => handleSentenceChange(e.target.value)}
              placeholder="Write a sentence using the selected words..."
              className="w-full h-32 md:h-40 p-4 rounded-lg bg-background text-foreground placeholder:text-muted-foreground border border-border focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-base leading-relaxed transition-all"
            />
          </div>

          {/* Evaluation Section */}
          {isEvaluating && <EvaluationLoading />}

          {evaluation && !isEvaluating && (
            <EvaluationFeedback
              evaluation={evaluation}
              onReEvaluate={handleEvaluate}
              isLoading={isEvaluating}
            />
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-center">
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {/* Evaluate button - optional but recommended */}
            {evaluation?.rating !== 'correct' && (
              <Button
                type="button"
                onClick={handleEvaluate}
                disabled={isEvaluating || !sentence.trim() || selectedWords.size === 0}
                variant="outline"
                className="w-full gap-2"
                size="lg"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{evaluation ? 'Re-evaluate' : 'Evaluate Sentence (Optional)'}</span>
                  </>
                )}
              </Button>
            )}

            {/* Submit button - always enabled when sentence and words are provided */}
            <Button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              variant={evaluation?.rating === 'correct' ? 'success' : 'default'}
              size="lg"
              className="w-full gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit to Instructor</span>
                </>
              )}
            </Button>

            {/* Helper text based on evaluation state */}
            {!evaluation && canSubmit && (
              <p className="text-muted-foreground text-xs text-center">
                You can submit directly or evaluate first for feedback
              </p>
            )}
            {evaluation && evaluation.rating !== 'correct' && (
              <p className="text-warning text-xs text-center font-medium">
                Consider revising based on feedback, or submit as-is to get help from your instructor
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
