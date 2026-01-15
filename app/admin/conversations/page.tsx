'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'
import ConversationList from '@/components/ConversationList'
import {
  getAllConversations,
  ConversationWithUser,
  ConversationStatus
} from '@/app/actions/conversations'

type FilterStatus = ConversationStatus | 'all'

export default function AdminConversationsPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('all')

  const fetchConversations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const statusFilter = filter === 'all' ? undefined : filter
    const result = await getAllConversations(statusFilter)

    if (result.error) {
      if (result.error === 'Unauthorized') {
        router.push('/')
        return
      }
      setError(result.error)
    } else {
      setConversations(result.conversations)
    }

    setIsLoading(false)
  }, [filter, router])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'replied', label: 'Replied' },
    { value: 'completed', label: 'Completed' }
  ]

  return (
    <main className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Conversations</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="text-xs md:text-sm h-9 md:h-10">
              <Link href="/admin">Back to Admin</Link>
            </Button>
            <Button variant="outline" asChild className="text-xs md:text-sm h-9 md:h-10">
              <Link href="/">Back to App</Link>
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">Filter:</span>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {filterOptions.map(option => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(option.value)}
                  className="h-8 text-xs md:text-sm px-2 md:px-3"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="hidden md:block flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConversations}
            disabled={isLoading}
            className="h-8 md:h-9 text-xs md:text-sm self-start md:self-auto"
          >
            <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8 md:p-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center p-6 md:p-8">
            <p className="text-red-500 mb-4 text-sm md:text-base">{error}</p>
            <Button onClick={fetchConversations}>Try Again</Button>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            onRefresh={fetchConversations}
          />
        )}
      </div>
    </main>
  )
}
