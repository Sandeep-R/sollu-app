'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MessageCircle, Clock, CheckCircle, Reply } from 'lucide-react'
import { ConversationWithUser, ConversationStatus } from '@/app/actions/conversations'
import ReplyForm from './ReplyForm'

interface ConversationListProps {
  conversations: ConversationWithUser[]
  onRefresh: () => void
}

const statusConfig: Record<ConversationStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="w-4 h-4" />,
    className: 'bg-yellow-100 text-yellow-800'
  },
  replied: {
    label: 'Replied',
    icon: <Reply className="w-4 h-4" />,
    className: 'bg-blue-100 text-blue-800'
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle className="w-4 h-4" />,
    className: 'bg-green-100 text-green-800'
  }
}

export default function ConversationList({ conversations, onRefresh }: ConversationListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleReplySuccess = () => {
    setReplyingTo(null)
    onRefresh()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No conversations yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Conversations ({conversations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Learner</TableHead>
              <TableHead>Tamil Sentence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.map(conversation => {
              const status = statusConfig[conversation.status]
              const isExpanded = expandedId === conversation.id
              const isReplying = replyingTo === conversation.id

              return (
                <>
                  <TableRow key={conversation.id}>
                    <TableCell className="font-medium">
                      {conversation.user_email}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{conversation.learner_sentence_tamil}</p>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(conversation.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {conversation.status === 'pending' && !isReplying && (
                          <Button
                            size="sm"
                            onClick={() => setReplyingTo(conversation.id)}
                          >
                            <Reply className="w-4 h-4 mr-1" />
                            Reply
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedId(isExpanded ? null : conversation.id)}
                        >
                          {isExpanded ? 'Hide' : 'Details'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Reply form row */}
                  {isReplying && (
                    <TableRow key={`${conversation.id}-reply`}>
                      <TableCell colSpan={5} className="bg-muted/50">
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            Replying to: <span className="text-foreground">{conversation.learner_sentence_tamil}</span>
                          </p>
                          <ReplyForm
                            conversationId={conversation.id}
                            onReplySuccess={handleReplySuccess}
                            onCancel={() => setReplyingTo(null)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Expanded details row */}
                  {isExpanded && (
                    <TableRow key={`${conversation.id}-details`}>
                      <TableCell colSpan={5} className="bg-muted/30">
                        <div className="p-4 space-y-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                              Learner&apos;s Tamil Sentence
                            </p>
                            <p className="text-lg">{conversation.learner_sentence_tamil}</p>
                          </div>

                          {conversation.admin_reply_tamil && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                Admin Reply (Tamil)
                              </p>
                              <p className="text-lg">{conversation.admin_reply_tamil}</p>
                              {conversation.admin_replied_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Replied at: {formatDate(conversation.admin_replied_at)}
                                </p>
                              )}
                            </div>
                          )}

                          {conversation.learner_translation_english && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                Learner&apos;s Translation
                              </p>
                              <p className="text-lg">{conversation.learner_translation_english}</p>
                              {conversation.completed_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Completed at: {formatDate(conversation.completed_at)}
                                </p>
                              )}
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                              Word IDs Used
                            </p>
                            <p className="text-sm">{conversation.word_ids_used.join(', ') || 'None'}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
