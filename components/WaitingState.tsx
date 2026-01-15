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
    <Card className="w-full max-w-full md:max-w-2xl bg-white/10 backdrop-blur-sm border-white/20">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col items-center gap-4 md:gap-6 text-center">
          <div className="relative">
            <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-white/60" />
            <div className="absolute -bottom-1 -right-1 bg-white/20 rounded-full p-1">
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-white animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-semibold text-white">
              Waiting for Admin Reply
            </h3>
            <p className="text-white/70 text-xs md:text-sm">
              Your sentence has been submitted. An admin will reply shortly.
            </p>
          </div>

          <div className="w-full p-3 md:p-4 bg-white/5 rounded-lg">
            <p className="text-white/50 text-xs uppercase tracking-wide mb-2">
              Your sentence:
            </p>
            <p className="text-white text-base md:text-lg">{sentenceTamil}</p>
          </div>

          <div className="flex items-center gap-2 text-white/50 text-xs md:text-sm">
            <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
            <span>Checking for reply...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
