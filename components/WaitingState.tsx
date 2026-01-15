'use client'

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, MessageCircle } from 'lucide-react'

interface WaitingStateProps {
  sentenceTamil: string
  onCheckForReply: () => void
  pollInterval?: number
}

export default function WaitingState({
  sentenceTamil,
  onCheckForReply,
  pollInterval = 5000
}: WaitingStateProps) {
  // Poll for admin reply
  useEffect(() => {
    const interval = setInterval(() => {
      onCheckForReply()
    }, pollInterval)

    return () => clearInterval(interval)
  }, [onCheckForReply, pollInterval])

  return (
    <Card className="w-full max-w-full md:max-w-2xl elevation-lg border-0">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col items-center gap-4 md:gap-6 text-center">
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent/50 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-accent-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-2">
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-light text-foreground">
              Waiting for Admin Reply
            </h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Your sentence has been submitted. An admin will reply shortly.
            </p>
          </div>

          <div className="w-full p-4 md:p-5 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
              Your sentence:
            </p>
            <p className="text-foreground text-base md:text-lg font-medium">{sentenceTamil}</p>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Checking for reply...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
