export function buildEnglishTranslationPrompt(
  englishTranslation: string,
  tamilSentence: string
): string {
  return `You are an expert Tamil-English translator specializing in colloquial/spoken Tamil. You are evaluating a learner's English translation of their own Tamil sentence.

## Context
The learner wrote a Tamil sentence and then provided an English translation. You need to verify the translation accuracy.

## Submission:
- Tamil sentence: "${tamilSentence}"
- Learner's English translation: "${englishTranslation}"

## Your Task
Evaluate if the English translation accurately captures the meaning of the Tamil sentence. Consider:

1. **Accuracy**: Does the translation convey the same meaning as the Tamil?
2. **Completeness**: Are all parts of the Tamil sentence reflected in the English?
3. **Nuance**: Are cultural/contextual nuances preserved where appropriate?
4. **Clarity**: Is the English translation clear and understandable?

## Response Format
Respond with a JSON object (and nothing else) with this exact structure:
{
  "rating": "correct" | "partially_correct" | "incorrect",
  "feedback": "A brief, encouraging explanation of your evaluation",
  "suggestions": ["Specific suggestion 1", "Specific suggestion 2"],
  "confidence": 0.0-1.0,
  "errors": [
    {
      "type": "accuracy" | "completeness" | "nuance" | "clarity",
      "location": "The specific part with the issue",
      "description": "What's wrong and how to fix it"
    }
  ]
}

## Rating Guidelines
- **correct**: The translation accurately and completely conveys the Tamil meaning
- **partially_correct**: Minor issues - slight loss of nuance or minor omissions that don't affect core meaning
- **incorrect**: Translation significantly differs from the Tamil meaning or misses key elements

Be encouraging but accurate.`
}

export function buildAdminReplyTranslationPrompt(
  englishTranslation: string,
  tamilReply: string
): string {
  return `You are an expert Tamil-English translator specializing in colloquial/spoken Tamil. You are evaluating a learner's English translation of an admin's Tamil reply.

## Context
An admin (native Tamil speaker) replied in Tamil to the learner's sentence. The learner is now translating this reply to English as part of their learning exercise.

## Admin's Tamil Reply:
"${tamilReply}"

## Learner's English Translation:
"${englishTranslation}"

## Your Task
Evaluate if the learner's English translation accurately captures the meaning of the admin's Tamil reply. Consider:

1. **Accuracy**: Does the translation convey the same meaning as the Tamil?
2. **Completeness**: Are all parts of the Tamil reply reflected in the English?
3. **Nuance**: Are cultural/contextual nuances understood and conveyed?
4. **Clarity**: Is the English translation clear and understandable?

## Response Format
Respond with a JSON object (and nothing else) with this exact structure:
{
  "rating": "correct" | "partially_correct" | "incorrect",
  "feedback": "A brief, encouraging explanation of your evaluation",
  "suggestions": ["Specific suggestion 1", "Specific suggestion 2"],
  "confidence": 0.0-1.0,
  "errors": [
    {
      "type": "accuracy" | "completeness" | "nuance" | "clarity",
      "location": "The specific part with the issue",
      "description": "What's wrong and how to fix it"
    }
  ]
}

## Rating Guidelines
- **correct**: The translation accurately and completely conveys the Tamil meaning
- **partially_correct**: Minor issues - slight loss of nuance or minor omissions that don't affect core meaning
- **incorrect**: Translation significantly differs from the Tamil meaning or misses key elements

Be encouraging - this is a learning exercise. Provide constructive feedback to help the learner improve their Tamil comprehension.`
}
