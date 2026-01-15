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
    // Clear evaluation when words change
    setEvaluation(null)
  }

  const handleSentenceChange = (value: string) => {
    setSentence(value)
    // Clear evaluation when sentence changes
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

    if (!evaluation || evaluation.rating !== 'correct') {
      setError('Please evaluate your sentence first and ensure it passes')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await submitLearnerSentence(
      userId,
      sessionId,
      sentence.trim(),
      Array.from(selectedWords),
      evaluation
    )

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      onSubmitSuccess()
    }
  }

  const canSubmit = evaluation?.rating === 'correct'

  return (
    <Card className="w-full max-w-full md:max-w-2xl bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-white text-center text-lg md:text-xl">Write a Tamil Sentence</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <Label className="text-white/90 text-sm md:text-base">Select the words you used:</Label>
            <div className="flex flex-wrap gap-2">
              {availableWords.map(word => (
                <button
                  key={word.id}
                  type="button"
                  onClick={() => toggleWordSelection(word.id)}
                  className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all min-h-[44px] ${
                    selectedWords.has(word.id)
                      ? 'bg-white text-purple-700'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {word.tamil || word.transliteration} ({word.word_type})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sentence" className="text-white/90 text-sm md:text-base">
              Your Tamil sentence:
            </Label>
            <textarea
              id="sentence"
              value={sentence}
              onChange={e => handleSentenceChange(e.target.value)}
              placeholder="Write a sentence using the words above..."
              className="w-full h-24 md:h-32 p-3 rounded-md bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none text-base"
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
            <p className="text-red-300 text-sm text-center">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Evaluate Button - always visible unless already correct */}
            {(!evaluation || evaluation.rating !== 'correct') && (
              <Button
                type="button"
                onClick={handleEvaluate}
                disabled={isEvaluating || !sentence.trim() || selectedWords.size === 0}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 h-11 md:h-10"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {evaluation ? 'Re-evaluate' : 'Evaluate Sentence'}
                  </>
                )}
              </Button>
            )}

            {/* Submit Button - only enabled when evaluation passes */}
            <Button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className={`w-full h-11 md:h-10 ${
                canSubmit
                  ? 'bg-white text-purple-700 hover:bg-white/90'
                  : 'bg-white/30 text-white/50 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit to Admin
                </>
              )}
            </Button>

            {!canSubmit && !evaluation && (
              <p className="text-white/60 text-xs text-center">
                Evaluate your sentence to enable submission
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
