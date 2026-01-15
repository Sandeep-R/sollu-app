'use client'

import { StoredEvaluation, EvaluationRating } from '@/lib/llm/types'
import { CheckCircle, AlertCircle, XCircle, Lightbulb, RefreshCw } from 'lucide-react'

interface EvaluationFeedbackProps {
  evaluation: StoredEvaluation
  onReEvaluate?: () => void
  isLoading?: boolean
}

const ratingConfig: Record<EvaluationRating, { label: string; color: string; bgColor: string; Icon: typeof CheckCircle }> = {
  correct: {
    label: 'Correct',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    Icon: CheckCircle,
  },
  partially_correct: {
    label: 'Partially Correct',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
    Icon: AlertCircle,
  },
  incorrect: {
    label: 'Incorrect',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    Icon: XCircle,
  },
}

export function EvaluationFeedback({ evaluation, onReEvaluate, isLoading }: EvaluationFeedbackProps) {
  const config = ratingConfig[evaluation.rating]
  const { Icon } = config

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor}`}>
      {/* Header with rating */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <span className={`font-semibold ${config.color}`}>{config.label}</span>
          {evaluation.confidence !== undefined && (
            <span className="text-sm text-gray-500">
              ({Math.round(evaluation.confidence * 100)}% confidence)
            </span>
          )}
        </div>
        {onReEvaluate && evaluation.rating !== 'correct' && (
          <button
            onClick={onReEvaluate}
            disabled={isLoading}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Re-evaluate
          </button>
        )}
      </div>

      {/* Feedback */}
      <p className="text-gray-700 mb-3">{evaluation.feedback}</p>

      {/* Errors (if any) */}
      {evaluation.errors && evaluation.errors.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Issues found:</h4>
          <ul className="space-y-2">
            {evaluation.errors.map((error, index) => (
              <li key={index} className="text-sm bg-white/50 rounded p-2">
                <span className="font-medium capitalize">{error.type}</span>
                {error.location && (
                  <span className="text-gray-600"> in &quot;{error.location}&quot;</span>
                )}
                <span className="text-gray-600">: {error.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {evaluation.suggestions && evaluation.suggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
            <Lightbulb className="h-4 w-4" />
            Suggestions:
          </div>
          <ul className="space-y-1">
            {evaluation.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-gray-400">•</span>
                {suggestion}
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
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-blue-700 font-medium">Evaluating your sentence...</span>
      </div>
      <p className="text-sm text-blue-600 mt-2">
        Our AI is checking grammar, word usage, and naturalness.
      </p>
    </div>
  )
}
