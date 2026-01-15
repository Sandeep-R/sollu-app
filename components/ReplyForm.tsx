'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Send } from 'lucide-react'
import { replyToConversation } from '@/app/actions/conversations'

interface ReplyFormProps {
  conversationId: string
  onReplySuccess: () => void
  onCancel: () => void
}

export default function ReplyForm({
  conversationId,
  onReplySuccess,
  onCancel
}: ReplyFormProps) {
  const [reply, setReply] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reply.trim()) {
      setError('Please enter a reply')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await replyToConversation(conversationId, reply.trim())

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      onReplySuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reply">Your Tamil Reply:</Label>
        <textarea
          id="reply"
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder="Write your Tamil reply here..."
          className="w-full h-24 p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          size="sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Reply
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
