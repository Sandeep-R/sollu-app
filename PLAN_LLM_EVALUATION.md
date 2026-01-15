# LLM Evaluation Integration Plan

## Overview

Build an LLM evaluation system that validates learner responses before submission. The system will evaluate both Tamil sentences and English translations, provide immediate feedback with correctness ratings (correct/partially correct/incorrect), and require learners to address feedback before submitting to admin.

## Evaluation Flow

### Initial Tamil Sentence Flow

```
Learner types Tamil sentence + English translation
  ↓
Click "Evaluate" button
  ↓
LLM evaluates both Tamil sentence and English translation
  ↓
Show feedback:
 - Correctness rating (correct/partially correct/incorrect)
 - Suggestions for improvement
 - Specific errors identified
  ↓
If CORRECT → Enable "Submit to Admin" button
If PARTIALLY CORRECT/INCORRECT → 
 - Disable "Submit to Admin" button
 - Show feedback prominently
 - Allow learner to edit in place
 - Allow re-evaluation (unlimited retries)
```

### Admin Reply Translation Flow

```
Admin replies in Tamil
  ↓
Learner translates to English
  ↓
Click "Evaluate Translation" button
  ↓
LLM evaluates English translation against admin's Tamil reply
  ↓
Show feedback (same structure as above)
  ↓
If CORRECT → Enable "Complete Conversation" button
If PARTIALLY CORRECT/INCORRECT → 
 - Disable "Complete Conversation" button
 - Show feedback
 - Allow edit and re-evaluation
```

## Database Changes

### 1. Migration: Add evaluation fields to conversations table

**File:** `supabase/migrations/007_add_evaluations.sql`

Add columns to `conversations` table:

- `tamil_sentence_evaluation` (JSONB) - Stores evaluation of Tamil sentence
  - Structure: `{ rating: 'correct' | 'partially_correct' | 'incorrect', feedback: string, suggestions: string[], evaluated_at: timestamp, llm_provider: string, model: string }`
- `english_translation_evaluation` (JSONB) - Stores evaluation of English translation
  - Same structure as above
- `admin_reply_translation_evaluation` (JSONB) - Stores evaluation of admin reply translation
  - Same structure as above
- `evaluation_attempts` (INTEGER) - Track number of evaluation attempts
- `final_tamil_sentence` (TEXT) - Store the final approved Tamil sentence
- `final_english_translation` (TEXT) - Store the final approved English translation

### 2. Migration: Create evaluation history table (optional, for analytics)

**File:** `supabase/migrations/008_evaluation_history.sql`

Create `evaluation_history` table:

- `id` (UUID, primary key)
- `conversation_id` (UUID, references conversations)
- `evaluation_type` (ENUM: 'tamil_sentence', 'english_translation', 'admin_reply_translation')
- `evaluation_result` (JSONB) - Full evaluation result
- `learner_input` (TEXT) - What the learner submitted
- `created_at` (TIMESTAMP)

This allows tracking all evaluation attempts for analytics.

## LLM Evaluation System

### 3. Create LLM service abstraction

**File:** `lib/llm/service.ts`

Create abstract LLM service interface:

```typescript
interface LLMProvider {
  evaluateTamilSentence(tamil: string, english: string, words: Word[]): Promise<EvaluationResult>
  evaluateEnglishTranslation(english: string, tamil: string): Promise<EvaluationResult>
  evaluateAdminReplyTranslation(englishTranslation: string, tamilReply: string): Promise<EvaluationResult>
}

interface EvaluationResult {
  rating: 'correct' | 'partially_correct' | 'incorrect'
  feedback: string
  suggestions: string[]
  confidence?: number
  errors?: Array<{ type: string, location: string, description: string }>
}
```

### 4. Implement OpenAI provider

**File:** `lib/llm/providers/openai.ts`

Implement OpenAI provider:

- Use GPT-4 or GPT-4 Turbo for best evaluation quality
- Create structured prompts for each evaluation type
- Parse responses into EvaluationResult format
- Handle rate limiting and errors
- Support streaming for better UX (optional)

### 5. Implement Anthropic provider

**File:** `lib/llm/providers/anthropic.ts`

Implement Anthropic Claude provider:

- Use Claude 3 Opus or Sonnet for evaluation
- Similar structure to OpenAI provider
- Handle Anthropic-specific API patterns

### 6. Create evaluation prompts

**File:** `lib/llm/prompts.ts`

Create well-crafted prompts for:

1. **Tamil Sentence Evaluation Prompt:**
   - Context: Learner is learning colloquial Tamil
   - Input: Tamil sentence, English translation, words used
   - Task: Evaluate grammar, word usage, naturalness, correctness
   - Output: Rating + feedback + suggestions

2. **English Translation Evaluation Prompt:**
   - Context: Learner translated their Tamil sentence
   - Input: Tamil sentence, English translation
   - Task: Check if translation accurately reflects Tamil meaning
   - Output: Rating + feedback + suggestions

3. **Admin Reply Translation Evaluation Prompt:**
   - Context: Learner translating admin's Tamil reply
   - Input: Admin's Tamil reply, learner's English translation
   - Task: Check translation accuracy
   - Output: Rating + feedback + suggestions

### 7. Create evaluation service

**File:** `lib/llm/evaluator.ts`

Main evaluation service:

- Select provider based on configuration
- Handle provider switching
- Implement caching (optional, for cost optimization)
- Error handling and fallbacks
- Rate limiting

## Backend Changes

### 8. Create evaluation actions

**File:** `app/actions/evaluations.ts`

Server actions:

- `evaluateTamilSentence(userId, sessionId, tamilSentence, englishTranslation, wordIds)` - Evaluates initial sentence
- `evaluateAdminReplyTranslation(conversationId, englishTranslation)` - Evaluates admin reply translation
- `getEvaluationHistory(conversationId)` - Gets evaluation history (for admins/analytics)
- `approveSentence(conversationId)` - Marks sentence as approved (when correct)

### 9. Update conversation actions

**File:** `app/actions/conversations.ts`

Modify `submitLearnerSentence`:

- Check if sentence has been evaluated and is marked as correct
- Only allow submission if evaluation rating is 'correct'
- Store final approved sentences

Modify `submitTranslation`:

- Check if translation has been evaluated and is correct
- Only allow completion if evaluation rating is 'correct'

## Frontend Changes

### 10. Update SentenceSubmissionForm component

**File:** `components/SentenceSubmissionForm.tsx`

Changes:

- Add "Evaluate" button (separate from Submit)
- Show evaluation feedback in a prominent card/alert
- Display rating with color coding (green/yellow/red)
- Show suggestions as actionable items
- Disable "Submit to Admin" button until rating is 'correct'
- Allow editing sentence in place
- Show evaluation status (evaluating, evaluated, etc.)
- Display evaluation attempts count
- Add loading state during evaluation

### 11. Create EvaluationFeedback component

**File:** `components/EvaluationFeedback.tsx`

New component:

- Displays evaluation results
- Color-coded rating badges
- Expandable feedback section
- Suggestions list (can be clickable to auto-fill)
- Error highlights if applicable
- "Re-evaluate" button

### 12. Update TranslationForm component

**File:** `components/TranslationForm.tsx`

Changes:

- Add "Evaluate Translation" button
- Integrate EvaluationFeedback component
- Disable "Complete Conversation" until translation is correct
- Allow editing and re-evaluation

### 13. Update admin conversations view

**File:** `components/ConversationList.tsx`

Changes:

- Show evaluation results in conversation details
- Display evaluation ratings
- Show evaluation history if available
- Highlight conversations with incorrect evaluations

## Configuration

### 14. Environment variables

**IMPORTANT**: All LLM API keys must use server-only environment variables (NO `NEXT_PUBLIC_` prefix).

Add to `.env.local` (local development):
```bash
# Server-only API keys (never exposed to client)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...  # Optional

# Configuration
LLM_PROVIDER=openai
LLM_MODEL=gpt-4-turbo
LLM_EVALUATION_ENABLED=true
```

Add to Vercel Environment Variables (production):
- `OPENAI_API_KEY` - OpenAI API key (server-only)
- `ANTHROPIC_API_KEY` - Anthropic API key (optional, server-only)
- `LLM_PROVIDER` - Default provider ('openai' or 'anthropic')
- `LLM_MODEL` - Model to use (e.g., 'gpt-4-turbo', 'claude-3-opus')
- `LLM_EVALUATION_ENABLED` - Feature flag (default: true)

**Security Note**: 
- ✅ Use `OPENAI_API_KEY` (server-only)
- ❌ NEVER use `NEXT_PUBLIC_OPENAI_API_KEY` (would expose to browser)
- Ensure `.env.local` is in `.gitignore` (already configured)

### 15. Create LLM configuration

**File:** `lib/llm/config.ts`

Configuration management:

- Load provider settings from env
- Default model selection
- Rate limiting configuration
- Cost tracking (optional)

## Prompt Engineering

### 16. Design evaluation prompts

**File:** `lib/llm/prompts/tamil-sentence.ts`

Key considerations:

- Focus on colloquial Tamil (not formal)
- Check word usage correctness
- Grammar and naturalness
- Cultural appropriateness
- Provide constructive, actionable feedback
- Be encouraging but accurate

**File:** `lib/llm/prompts/translation.ts`

Key considerations:

- Accuracy of translation
- Nuance preservation
- Natural English phrasing
- Completeness

## Error Handling & Edge Cases

### 17. Handle evaluation failures

- Network errors → Retry with exponential backoff
- API rate limits → Queue or show message
- Invalid responses → Fallback to manual review option
- Timeout → Show error, allow retry

### 18. Cost optimization

- Cache evaluations for identical inputs (optional)
- Batch evaluations if possible
- Use cheaper models for simple checks (if applicable)
- Track usage and costs

## Testing Strategy

### 19. Evaluation quality testing

- Test with various sentence types (correct, partially correct, incorrect)
- Verify rating accuracy
- Check suggestion quality
- Test edge cases (very short/long sentences, special characters)

### 20. Integration testing

- Test full flow: type → evaluate → edit → re-evaluate → submit
- Test with different providers
- Test error scenarios
- Test rate limiting

## UI/UX Considerations

### 21. Feedback display

- Use clear visual indicators (icons, colors)
- Make feedback scannable
- Highlight specific errors in text
- Provide actionable suggestions
- Show progress (evaluation attempts)

### 22. Evaluation button states

- "Evaluate" → "Evaluating..." → Show results
- Disable during evaluation
- Show evaluation time
- Allow cancellation (if streaming)

## Implementation Phases

### Phase 1: Core Evaluation System

1. Set up LLM service abstraction
2. Implement OpenAI provider (ensure API key is server-only)
3. Create evaluation prompts
4. Build evaluation service (server-side only)
5. Add database fields

**Security Checkpoint**: Verify all LLM code is in server-only files, API keys use `process.env.OPENAI_API_KEY` (not `NEXT_PUBLIC_`), and no LLM imports in client components.

### Phase 2: Integration

1. Create evaluation actions
2. Update SentenceSubmissionForm
3. Create EvaluationFeedback component
4. Update conversation submission flow

### Phase 3: Translation Evaluation

1. Add translation evaluation
2. Update TranslationForm
3. Integrate evaluation into completion flow

### Phase 4: Admin & Analytics

1. Show evaluations in admin dashboard
2. Add evaluation history tracking
3. Analytics and reporting

### Phase 5: Enhancements

1. Add Anthropic provider
2. Implement caching
3. Cost optimization
4. Advanced features (auto-fix, suggestions)

## Dependencies

Install required packages:

- `openai` - OpenAI SDK
- `@anthropic-ai/sdk` - Anthropic SDK
- `zod` - For response validation (optional but recommended)

## Security Considerations

### API Key Security

**CRITICAL: API keys must NEVER be exposed to the client**

#### 1. Environment Variable Naming

- ✅ **CORRECT**: Use `OPENAI_API_KEY` (server-only, no `NEXT_PUBLIC_` prefix)
- ❌ **WRONG**: `NEXT_PUBLIC_OPENAI_API_KEY` (would expose to client browser)

**Rule**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. LLM API keys must NEVER use this prefix.

#### 2. Code Structure Requirements

- **All LLM calls must be in Server Actions** (`app/actions/evaluations.ts`)
- **Never import LLM providers in client components** (`'use client'` files)
- **API keys only accessed via `process.env.OPENAI_API_KEY`** in server code
- All evaluation functions must be marked with `'use server'`

**Correct Pattern:**
```typescript
// ✅ CORRECT - Server Action (app/actions/evaluations.ts)
'use server'
import OpenAI from 'openai'

export async function evaluateTamilSentence(...) {
  // API key only accessible on server
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }
  
  const openai = new OpenAI({ apiKey })
  // LLM calls here - never exposed to client
  // ...
}
```

**Wrong Pattern:**
```typescript
// ❌ WRONG - Client Component
'use client'
import OpenAI from 'openai'

export function SomeComponent() {
  // This would expose the API key to the browser!
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}
```

#### 3. File Structure Verification

Ensure LLM provider files are in server-only locations:
- ✅ `lib/llm/providers/openai.ts` - Can be imported by server actions
- ✅ `lib/llm/evaluator.ts` - Server-side service
- ❌ Never import these in `components/` files marked with `'use client'`

#### 4. Environment Variable Setup Checklist

- [ ] `.env.local` is in `.gitignore` (already configured)
- [ ] `OPENAI_API_KEY` added to `.env.local` (without `NEXT_PUBLIC_` prefix)
- [ ] `OPENAI_API_KEY` added to Vercel environment variables
- [ ] Never commit `.env.local` to git
- [ ] Verify API key is accessible only in server actions: `process.env.OPENAI_API_KEY`
- [ ] Test that API key is undefined in client components (should be `undefined`)

#### 5. Verification Steps

**Test API key security:**
```typescript
// In a client component, this should be undefined:
console.log(process.env.OPENAI_API_KEY) // Should be undefined

// In a server action, this should have the value:
console.log(process.env.OPENAI_API_KEY) // Should have the key
```

#### 6. Additional Security Measures

- Never expose API keys to client
- All LLM calls must be server-side
- Validate inputs before sending to LLM
- Rate limit evaluation requests per user
- Sanitize LLM responses before displaying
- Use environment variable validation (e.g., with Zod)
- Implement API key rotation capability
- Monitor API usage for anomalies

## Cost Estimation

- OpenAI GPT-4 Turbo: ~$0.01-0.03 per evaluation
- Anthropic Claude: Similar pricing
- Consider caching identical evaluations
- Track usage per user/conversation

## Todo List

1. **db_evaluation_fields** - Create migration to add evaluation fields to conversations table (JSONB columns for evaluations, attempt tracking)
2. **db_evaluation_history** - Create evaluation_history table for tracking all evaluation attempts (optional, for analytics) (depends on: db_evaluation_fields)
3. **llm_service_abstraction** - Create LLM service abstraction interface and provider system
4. **openai_provider** - Implement OpenAI provider with GPT-4 for evaluations (depends on: llm_service_abstraction)
5. **evaluation_prompts** - Design and create evaluation prompts for Tamil sentence, English translation, and admin reply translation
6. **evaluator_service** - Create main evaluation service with provider selection and error handling (depends on: openai_provider, evaluation_prompts)
7. **evaluation_actions** - Create server actions: evaluateTamilSentence, evaluateAdminReplyTranslation, getEvaluationHistory (depends on: evaluator_service, db_evaluation_fields)
8. **update_conversation_actions** - Update submitLearnerSentence and submitTranslation to require correct evaluation before submission (depends on: evaluation_actions)
9. **evaluation_feedback_component** - Create EvaluationFeedback component to display ratings, feedback, and suggestions
10. **update_sentence_form** - Update SentenceSubmissionForm with Evaluate button, feedback display, and conditional submit enablement (depends on: evaluation_actions, evaluation_feedback_component)
11. **update_translation_form** - Update TranslationForm with evaluation for admin reply translation (depends on: evaluation_actions, evaluation_feedback_component)
12. **admin_evaluation_view** - Update ConversationList to show evaluation results in admin dashboard (depends on: evaluation_actions)
13. **env_config** - Set up environment variables and configuration for LLM providers
14. **anthropic_provider** - Implement Anthropic Claude provider (Phase 5 enhancement) (depends on: llm_service_abstraction)
