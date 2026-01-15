'use client'

import { StoredEvaluation, EvaluationRating } from '@/lib/llm/types'
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EvaluationFeedbackProps {
  evaluation: StoredEvaluation
  onReEvaluate?: () => void
  isLoading?: boolean
}

const ratingConfig: Record<EvaluationRating, { label: string; color: string; bgColor: string; borderColor: string; Icon: typeof CheckCircle2 }> = {
  correct: {
    label: 'Excellent',
    color: 'text-success',
    bgColor: 'bg-success/5',
    borderColor: 'border-success/20',
    Icon: CheckCircle2,
  },
  partially_correct: {
    label: 'Good Progress',
    color: 'text-warning',
    bgColor: 'bg-warning/5',
    borderColor: 'border-warning/20',
    Icon: AlertTriangle,
  },
  incorrect: {
    label: 'Needs Improvement',
    color: 'text-destructive',
    bgColor: 'bg-destructive/5',
    borderColor: 'border-destructive/20',
    Icon: XCircle,
  },
}

export function EvaluationFeedback({ evaluation, onReEvaluate, isLoading }: EvaluationFeedbackProps) {
  const config = ratingConfig[evaluation.rating]
  const { Icon } = config

  return (
    <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-6 elevation-sm transition-smooth`}>
      {/* Header with rating */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div>
            <span className={`text-lg font-medium ${config.color} block`}>{config.label}</span>
            {evaluation.confidence !== undefined && (
              <span className="text-xs text-muted-foreground">
                {Math.round(evaluation.confidence * 100)}% confidence
              </span>
            )}
          </div>
        </div>
        {onReEvaluate && evaluation.rating !== 'correct' && (
          <Button
            onClick={onReEvaluate}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Re-evaluate</span>
          </Button>
        )}
      </div>

      {/* Feedback */}
      <p className="text-foreground leading-relaxed mb-4">{evaluation.feedback}</p>

      {/* Errors (if any) */}
      {evaluation.errors && evaluation.errors.length > 0 && (
        <div className="mb-4 space-y-2">
          <h4 className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Issues Found
          </h4>
          <ul className="space-y-2">
            {evaluation.errors.map((error, index) => (
              <li key={index} className="text-sm bg-card/50 rounded-lg p-3 border border-border/50">
                <span className="font-medium capitalize text-foreground">{error.type}</span>
                {error.location && (
                  <span className="text-muted-foreground"> in "{error.location}"</span>
                )}
                <span className="text-muted-foreground">: {error.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {evaluation.suggestions && evaluation.suggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-3">
            <Lightbulb className="h-4 w-4" />
            <span>Suggestions</span>
          </div>
          <ul className="space-y-2">
            {evaluation.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-3 leading-relaxed">
                <span className="text-primary mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Loading state component
export function EvaluationLoading() {
  return (
    <div className="rounded-xl border border-primary/10 bg-primary/5 p-6 elevation-sm">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="flex-1">
          <p className="text-foreground font-medium mb-1">Analyzing your sentence</p>
          <p className="text-sm text-muted-foreground">
            Checking grammar, word usage, and naturalness
          </p>
        </div>
      </div>
    </div>
  )
}
