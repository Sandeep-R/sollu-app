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
import { MessageCircle, Clock, CheckCircle, Reply, Sparkles, AlertCircle, XCircle } from 'lucide-react'
import { ConversationWithUser, ConversationStatus } from '@/app/actions/conversations'
import { StoredEvaluation, EvaluationRating } from '@/lib/llm/types'
import ReplyForm from './ReplyForm'

interface ConversationListProps {
  conversations: ConversationWithUser[]
  onRefresh: () => void
}

const statusConfig: Record<ConversationStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="w-3 h-3 md:w-4 md:h-4" />,
    className: 'bg-yellow-100 text-yellow-800'
  },
  replied: {
    label: 'Replied',
    icon: <Reply className="w-3 h-3 md:w-4 md:h-4" />,
    className: 'bg-blue-100 text-blue-800'
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />,
    className: 'bg-green-100 text-green-800'
  }
}

const ratingConfig: Record<EvaluationRating, { label: string; icon: React.ReactNode; className: string }> = {
  correct: {
    label: 'Correct',
    icon: <CheckCircle className="w-3 h-3" />,
    className: 'bg-green-100 text-green-700'
  },
  partially_correct: {
    label: 'Partial',
    icon: <AlertCircle className="w-3 h-3" />,
    className: 'bg-yellow-100 text-yellow-700'
  },
  incorrect: {
    label: 'Incorrect',
    icon: <XCircle className="w-3 h-3" />,
    className: 'bg-red-100 text-red-700'
  }
}

function EvaluationBadge({ evaluation }: { evaluation: StoredEvaluation | null }) {
  if (!evaluation) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500">
        No eval
      </span>
    )
  }

  const config = ratingConfig[evaluation.rating]
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  )
}

function EvaluationDetails({ evaluation, title }: { evaluation: StoredEvaluation | null; title: string }) {
  if (!evaluation) {
    return null
  }

  const config = ratingConfig[evaluation.rating]

  return (
    <div className={`p-3 rounded-lg border ${
      evaluation.rating === 'correct' ? 'bg-green-50 border-green-200' :
      evaluation.rating === 'partially_correct' ? 'bg-yellow-50 border-yellow-200' :
      'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-700">{title}</span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
          {config.icon}
          {config.label}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-2">{evaluation.feedback}</p>
      {evaluation.suggestions && evaluation.suggestions.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-600 mb-1">Suggestions:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {evaluation.suggestions.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-[10px] text-gray-400 mt-2">
        Evaluated by {evaluation.llm_provider}/{evaluation.model} at {new Date(evaluation.evaluated_at).toLocaleString()}
      </p>
    </div>
  )
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
        <CardContent className="p-4 md:p-6">
          <div className="text-center text-muted-foreground py-6 md:py-8">
            <MessageCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm md:text-base">No conversations yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
          Conversations ({conversations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-[700px] md:min-w-0 px-4 md:px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px] text-xs md:text-sm">Learner</TableHead>
                  <TableHead className="min-w-[150px] text-xs md:text-sm">Tamil Sentence</TableHead>
                  <TableHead className="w-20 text-xs md:text-sm">Eval</TableHead>
                  <TableHead className="w-24 text-xs md:text-sm">Status</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[140px] text-xs md:text-sm">Created</TableHead>
                  <TableHead className="w-32 text-xs md:text-sm">Actions</TableHead>
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
                        <TableCell className="font-medium text-xs md:text-sm">
                          <span className="truncate block max-w-[100px] md:max-w-none">{conversation.user_email}</span>
                        </TableCell>
                        <TableCell className="max-w-[150px] md:max-w-xs">
                          <p className="truncate text-xs md:text-sm">{conversation.learner_sentence_tamil}</p>
                        </TableCell>
                        <TableCell>
                          <EvaluationBadge evaluation={conversation.tamil_sentence_evaluation} />
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${status.className}`}>
                            {status.icon}
                            <span className="hidden md:inline">{status.label}</span>
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs md:text-sm text-muted-foreground">
                          {formatDate(conversation.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                            {conversation.status === 'pending' && !isReplying && (
                              <Button
                                size="sm"
                                onClick={() => setReplyingTo(conversation.id)}
                                className="h-7 md:h-8 text-xs px-2"
                              >
                                <Reply className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                Reply
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setExpandedId(isExpanded ? null : conversation.id)}
                              className="h-7 md:h-8 text-xs px-2"
                            >
                              {isExpanded ? 'Hide' : 'Details'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Reply form row */}
                      {isReplying && (
                        <TableRow key={`${conversation.id}-reply`}>
                          <TableCell colSpan={6} className="bg-muted/50">
                            <div className="p-3 md:p-4">
                              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
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
                          <TableCell colSpan={6} className="bg-muted/30">
                            <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Learner&apos;s Tamil Sentence
                                </p>
                                <p className="text-sm md:text-lg">{conversation.learner_sentence_tamil}</p>
                              </div>

                              {conversation.learner_sentence_english && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Learner&apos;s English Translation
                                  </p>
                                  <p className="text-sm md:text-lg">{conversation.learner_sentence_english}</p>
                                </div>
                              )}

                              {/* Tamil Sentence Evaluation */}
                              <EvaluationDetails
                                evaluation={conversation.tamil_sentence_evaluation}
                                title="Tamil Sentence Evaluation"
                              />

                              {conversation.admin_reply_tamil && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Admin Reply (Tamil)
                                  </p>
                                  <p className="text-sm md:text-lg">{conversation.admin_reply_tamil}</p>
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
                                  <p className="text-sm md:text-lg">{conversation.learner_translation_english}</p>
                                  {conversation.completed_at && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Completed at: {formatDate(conversation.completed_at)}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Admin Reply Translation Evaluation */}
                              <EvaluationDetails
                                evaluation={conversation.admin_reply_translation_evaluation}
                                title="Translation Evaluation"
                              />

                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Word IDs Used
                                </p>
                                <p className="text-xs md:text-sm">{conversation.word_ids_used.join(', ') || 'None'}</p>
                              </div>

                              {conversation.evaluation_attempts > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Evaluation Attempts
                                  </p>
                                  <p className="text-xs md:text-sm">{conversation.evaluation_attempts}</p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
