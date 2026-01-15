'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Send } from 'lucide-react'
import { submitLearnerSentence } from '@/app/actions/conversations'
import { Word } from '@/app/actions/words'

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
  const [error, setError] = useState<string | null>(null)

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
      Array.from(selectedWords)
    )

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
        <CardTitle className="text-white text-center">Write a Tamil Sentence</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-white/90">Select the words you used:</Label>
            <div className="flex flex-wrap gap-2">
              {availableWords.map(word => (
                <button
                  key={word.id}
                  type="button"
                  onClick={() => toggleWordSelection(word.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
            <Label htmlFor="sentence" className="text-white/90">
              Your Tamil sentence:
            </Label>
            <textarea
              id="sentence"
              value={sentence}
              onChange={e => setSentence(e.target.value)}
              placeholder="Write a sentence using the words above..."
              className="w-full h-32 p-3 rounded-md bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
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
                <Send className="w-4 h-4 mr-2" />
                Submit Sentence
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
