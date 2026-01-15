# Corrected LLM Evaluation Flow

## The Correct Flow

### Step 1: Learner Writes Tamil Sentence
- Learner selects words from flashcards
- Learner writes a Tamil sentence using those words
- **NO English translation required at this step**
- Learner clicks "Evaluate Sentence"
- LLM evaluates only the Tamil sentence for:
  - Grammar correctness
  - Word usage
  - Naturalness
  - Meaning clarity
- If evaluation passes (rating: "correct"), learner can submit to admin
- If not, learner edits and re-evaluates

### Step 2: Admin Replies in Tamil
- Admin sees the Tamil sentence
- Admin replies in Tamil
- Status changes to "replied"

### Step 3: Learner Translates Admin's Reply
- Learner sees admin's Tamil reply
- **Learner translates the admin's Tamil reply to English**
- Learner clicks "Evaluate Translation"
- LLM evaluates the translation accuracy
- If correct, learner can complete the conversation
- If not, learner edits and re-evaluates

## Key Changes Made

1. **Removed English translation from initial submission**
   - [components/SentenceSubmissionForm.tsx](components/SentenceSubmissionForm.tsx) - Removed English input field
   - [app/actions/evaluations.ts](app/actions/evaluations.ts) - Updated to accept only Tamil sentence
   - [app/actions/conversations.ts](app/actions/conversations.ts) - Removed English translation parameter

2. **Updated LLM evaluation logic**
   - [lib/llm/evaluator.ts](lib/llm/evaluator.ts) - Updated function signature
   - [lib/llm/providers/openai.ts](lib/llm/providers/openai.ts) - Removed English translation evaluation
   - [lib/llm/prompts/tamil-sentence.ts](lib/llm/prompts/tamil-sentence.ts) - Updated prompt to evaluate only Tamil

3. **Updated interfaces**
   - [lib/llm/types.ts](lib/llm/types.ts) - Updated LLMProvider interface
   - Removed `evaluateEnglishTranslation` method

4. **Translation evaluation remains unchanged**
   - [components/TranslationForm.tsx](components/TranslationForm.tsx) - Still evaluates learner's English translation of admin's reply
   - [lib/llm/prompts/translation.ts](lib/llm/prompts/translation.ts) - Admin reply translation prompt unchanged

## Database Schema

The database columns remain the same as planned:
- `tamil_sentence_evaluation` - Evaluation of learner's Tamil sentence
- `admin_reply_translation_evaluation` - Evaluation of learner's English translation of admin's reply
- `english_translation_evaluation` - NOT USED (reserved for future)
- `learner_sentence_english` - Remains null (not used in current flow)
- `learner_translation_english` - Stores learner's translation of admin's reply

## What's Evaluated

| Step | What's Evaluated | By Whom | Evaluation Stored In |
|------|------------------|---------|---------------------|
| 1. Initial submission | Tamil sentence only | LLM | `tamil_sentence_evaluation` |
| 2. Admin reply | Nothing (admin just replies) | N/A | N/A |
| 3. Translation | Learner's English translation of admin's Tamil reply | LLM | `admin_reply_translation_evaluation` |

## Setup Instructions

Follow [SETUP_LLM_EVALUATION.md](SETUP_LLM_EVALUATION.md) for setup instructions. The flow described there is now correct.

## Testing the Corrected Flow

1. **As Learner:**
   - Select words
   - Write Tamil sentence (no English required)
   - Click "Evaluate Sentence"
   - Get feedback, edit if needed
   - Submit when correct

2. **As Admin:**
   - See learner's Tamil sentence
   - Reply in Tamil

3. **As Learner:**
   - See admin's Tamil reply
   - Translate to English
   - Click "Evaluate Translation"
   - Get feedback, edit if needed
   - Complete conversation when correct
