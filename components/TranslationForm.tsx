'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, MessageCircle } from 'lucide-react'
import { submitTranslation } from '@/app/actions/conversations'

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
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!translation.trim()) {
      setError('Please enter your English translation')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await submitTranslation(conversationId, translation.trim())

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      onSubmitSuccess()
    }
  }

  return (
    <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-center flex items-center justify-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Admin has Replied!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Conversation thread */}
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border-l-4 border-white/30">
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">
                Your sentence:
              </p>
              <p className="text-white">{learnerSentenceTamil}</p>
            </div>

            <div className="p-4 bg-purple-500/20 rounded-lg border-l-4 border-purple-400">
              <p className="text-purple-200 text-xs uppercase tracking-wide mb-1">
                Admin reply (Tamil):
              </p>
              <p className="text-white text-lg font-medium">{adminReplyTamil}</p>
            </div>
          </div>

          {/* Translation form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="translation" className="text-white/90">
                Translate the admin&apos;s reply to English:
              </Label>
              <textarea
                id="translation"
                value={translation}
                onChange={e => setTranslation(e.target.value)}
                placeholder="Write your English translation here..."
                className="w-full h-24 p-3 rounded-md bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
              />
            </div>

            {error && (
              <p className="text-red-300 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-purple-700 hover:bg-white/90"
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
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
