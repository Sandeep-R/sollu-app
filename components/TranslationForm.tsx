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
    <Card className="w-full max-w-full md:max-w-2xl elevation-lg border-0">
      <CardHeader className="p-6 md:p-8">
        <CardTitle className="text-foreground text-center flex items-center justify-center gap-2 text-xl md:text-2xl font-light">
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
          Admin has Replied!
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 md:p-8 pt-0">
        <div className="space-y-4 md:space-y-6">
          {/* Conversation thread */}
          <div className="space-y-3 md:space-y-4">
            <div className="p-4 md:p-5 bg-accent/10 rounded-lg border-l-4 border-accent/50">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
                Your sentence:
              </p>
              <p className="text-foreground text-sm md:text-base">{learnerSentenceTamil}</p>
            </div>

            <div className="p-4 md:p-5 bg-primary/10 rounded-lg border-l-4 border-primary">
              <p className="text-primary text-xs uppercase tracking-wider mb-2">
                Admin reply (Tamil):
              </p>
              <p className="text-foreground text-base md:text-lg font-medium">{adminReplyTamil}</p>
            </div>
          </div>

          {/* Translation form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="translation" className="text-foreground text-sm md:text-base">
                Translate the admin&apos;s reply to English:
              </Label>
              <textarea
                id="translation"
                value={translation}
                onChange={e => handleTranslationChange(e.target.value)}
                placeholder="Write your English translation here..."
                className="w-full h-24 md:h-28 p-4 rounded-lg bg-background text-foreground placeholder:text-muted-foreground border border-border focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-base transition-all"
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
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm text-center">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {/* Evaluate Button - always visible unless already correct */}
              {(!evaluation || evaluation.rating !== 'correct') && (
                <Button
                  type="button"
                  onClick={handleEvaluate}
                  disabled={isEvaluating || !translation.trim()}
                  size="lg"
                  className="w-full elevation-sm hover:elevation-md"
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
                variant={canSubmit ? 'success' : 'secondary'}
                size="lg"
                className="w-full elevation-sm hover:elevation-md"
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
                <p className="text-muted-foreground text-xs text-center">
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
