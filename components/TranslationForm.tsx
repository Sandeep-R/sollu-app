'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, MessageCircle, Sparkles } from 'lucide-react'
import { submitTranslation } from '@/app/actions/conversations'
import { evaluateAdminReplyTranslation } from '@/app/actions/evaluations'
import { StoredEvaluation } from '@/lib/llm/types'
import { EvaluationFeedback, EvaluationLoading } from '@/components/EvaluationFeedback'

interface TranslationFormProps {
  conversationId: string
  adminReplyTamil: string
  learnerSentenceTamil: string
  onSubmitSuccess: () => void
}

export default function TranslationForm({
  conversationId,
  adminReplyTamil,
  learnerSentenceTamil,
  onSubmitSuccess
}: TranslationFormProps) {
  const [translation, setTranslation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<StoredEvaluation | null>(null)

  const handleTranslationChange = (value: string) => {
    setTranslation(value)
    // Clear evaluation when translation changes
    setEvaluation(null)
  }

  const handleEvaluate = async () => {
    if (!translation.trim()) {
      setError('Please enter your English translation')
      return
    }

    setIsEvaluating(true)
    setError(null)

    const result = await evaluateAdminReplyTranslation(
      conversationId,
      translation.trim()
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
      setError('Please evaluate your translation first and ensure it passes')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await submitTranslation(
      conversationId,
      translation.trim(),
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
        <CardTitle className="text-white text-center flex items-center justify-center gap-2 text-lg md:text-xl">
          <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
          Admin has Replied!
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="space-y-4 md:space-y-6">
          {/* Conversation thread */}
          <div className="space-y-3 md:space-y-4">
            <div className="p-3 md:p-4 bg-white/5 rounded-lg border-l-4 border-white/30">
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">
                Your sentence:
              </p>
              <p className="text-white text-sm md:text-base">{learnerSentenceTamil}</p>
            </div>

            <div className="p-3 md:p-4 bg-purple-500/20 rounded-lg border-l-4 border-purple-400">
              <p className="text-purple-200 text-xs uppercase tracking-wide mb-1">
                Admin reply (Tamil):
              </p>
              <p className="text-white text-base md:text-lg font-medium">{adminReplyTamil}</p>
            </div>
          </div>

          {/* Translation form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="translation" className="text-white/90 text-sm md:text-base">
                Translate the admin&apos;s reply to English:
              </Label>
              <textarea
                id="translation"
                value={translation}
                onChange={e => handleTranslationChange(e.target.value)}
                placeholder="Write your English translation here..."
                className="w-full h-20 md:h-24 p-3 rounded-md bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none text-base"
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
                  disabled={isEvaluating || !translation.trim()}
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
                      {evaluation ? 'Re-evaluate' : 'Evaluate Translation'}
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
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Conversation
                  </>
                )}
              </Button>

              {!canSubmit && !evaluation && (
                <p className="text-white/60 text-xs text-center">
                  Evaluate your translation to complete the conversation
                </p>
              )}
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
