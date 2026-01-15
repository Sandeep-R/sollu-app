# LLM Evaluation System - Setup Guide

This guide will help you complete the setup of the LLM evaluation system for your Tamil learning app.

## Current Status

✅ **Completed:**
- All code implementation (LLM services, UI components, server actions)
- Migration files created
- Environment variable template added

⏳ **Remaining:**
- Apply database migrations
- Add your OpenAI API key
- Test the system

---

## Step 1: Apply Database Migrations

The evaluation system requires new columns in the `conversations` table and a new `evaluation_history` table.

### Option A: Supabase Dashboard (Recommended)

1. **Go to your Supabase SQL Editor:**
   - Visit: https://app.supabase.com/project/xvgiansmsshnlcfglswl/sql/new

2. **Apply Migration 007 (Evaluation Fields):**
   - Open `supabase/migrations/007_add_evaluations.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run**
   - You should see: "Success. No rows returned"

3. **Apply Migration 008 (Evaluation History):**
   - Open `supabase/migrations/008_evaluation_history.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run**
   - You should see: "Success. No rows returned"

4. **Verify the migrations:**
   - Run this query to check if the columns exist:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'conversations'
   AND column_name IN (
     'tamil_sentence_evaluation',
     'english_translation_evaluation',
     'admin_reply_translation_evaluation',
     'evaluation_attempts',
     'final_tamil_sentence',
     'final_english_translation'
   );
   ```
   - You should see 6 rows returned

### Option B: Supabase CLI

```bash
# Link your project (you'll need your database password)
npx supabase link --project-ref xvgiansmsshnlcfglswl

# Push migrations
npx supabase db push
```

---

## Step 2: Set Up OpenAI API Key

1. **Get an OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy it (starts with `sk-`)

2. **Update `.env.local`:**
   - Open `.env.local` in your project root
   - Replace `sk-your-openai-api-key-here` with your actual key:
   ```bash
   OPENAI_API_KEY=sk-proj-abc123...
   ```

3. **Verify other settings:**
   - Ensure these are set in `.env.local`:
   ```bash
   LLM_PROVIDER=openai
   LLM_MODEL=gpt-4-turbo
   LLM_EVALUATION_ENABLED=true
   ```

4. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

---

## Step 3: Deploy Environment Variables (Production)

If you're deploying to Vercel or another platform:

### Vercel:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add these variables:
   - `OPENAI_API_KEY` = `sk-proj-your-key`
   - `LLM_PROVIDER` = `openai`
   - `LLM_MODEL` = `gpt-4-turbo`
   - `LLM_EVALUATION_ENABLED` = `true`

4. Redeploy your application

---

## Step 4: Test the System

### Test 1: Tamil Sentence Evaluation

1. **Login as a learner**
2. **Navigate to the learning page**
3. **Select some words** from the flashcard deck
4. **Write a Tamil sentence and English translation**
5. **Click "Evaluate Sentence"**
   - You should see a loading spinner
   - After 2-5 seconds, you should see evaluation feedback with:
     - Rating badge (Correct/Partially Correct/Incorrect)
     - Feedback text
     - Suggestions (if any)
6. **If rating is NOT correct:**
   - Edit your sentence
   - Click "Re-evaluate"
   - Repeat until you get "Correct"
7. **Click "Submit to Admin"** (should only be enabled when rating is "Correct")

### Test 2: Admin Reply Translation Evaluation

1. **Login as an admin** (or have someone do this)
2. **Reply to a pending conversation in Tamil**
3. **Switch back to learner account**
4. **You should see the admin's reply**
5. **Enter an English translation**
6. **Click "Evaluate Translation"**
   - Check the feedback
7. **If correct, click "Complete Conversation"**

### Test 3: Admin Dashboard

1. **Login as admin**
2. **Go to Conversations page**
3. **You should see evaluation badges** next to conversations:
   - Green checkmark for "Correct"
   - Yellow alert for "Partially Correct"
   - Red X for "Incorrect"
4. **Click on a conversation** to see detailed evaluation feedback

---

## Troubleshooting

### Error: "OPENAI_API_KEY environment variable is not set"

**Solution:**
- Make sure you added the key to `.env.local`
- Restart your dev server (`npm run dev`)
- Verify the key starts with `sk-`

### Error: "column 'tamil_sentence_evaluation' does not exist"

**Solution:**
- Migrations haven't been applied yet
- Follow Step 1 to apply migrations
- Verify with the SQL query in Step 1

### Evaluation takes too long or times out

**Possible causes:**
- OpenAI API is slow (normal for GPT-4)
- Network issues
- Rate limiting

**Solutions:**
- Try using `gpt-3.5-turbo` instead (faster, cheaper):
  ```bash
  LLM_MODEL=gpt-3.5-turbo
  ```
- Check your OpenAI usage limits
- Wait a bit and try again

### Evaluation always returns "incorrect"

**Solution:**
- Check the prompts in `lib/llm/prompts/`
- The model might be too strict
- Try with different test sentences
- Check OpenAI playground to test your prompt

### API costs are too high

**Solutions:**
1. **Use cheaper model:**
   ```bash
   LLM_MODEL=gpt-3.5-turbo  # ~10x cheaper than GPT-4
   ```

2. **Disable for development:**
   ```bash
   LLM_EVALUATION_ENABLED=false
   ```
   (All evaluations will auto-pass with "correct" rating)

3. **Add rate limiting** (future enhancement)

---

## Cost Estimation

- **GPT-4 Turbo:** ~$0.01-0.03 per evaluation
- **GPT-3.5 Turbo:** ~$0.001-0.003 per evaluation

For 100 evaluations:
- GPT-4: ~$1-3
- GPT-3.5: ~$0.10-0.30

---

## Security Notes

✅ **API Key Security:**
- API keys are server-only (no `NEXT_PUBLIC_` prefix)
- Never exposed to browser/client
- All LLM calls happen in Server Actions
- `.env.local` is in `.gitignore` (never committed)

✅ **Verification:**
- LLM provider code is in `lib/llm/` (server-side)
- Server actions are in `app/actions/` (marked with `'use server'`)
- Client components only call server actions, never LLM directly

---

## What's Next?

Once the system is working, you can:

1. **Add Anthropic provider** (Phase 5 enhancement)
   - Implement `lib/llm/providers/anthropic.ts`
   - Use Claude for evaluations

2. **Add caching** (cost optimization)
   - Cache identical evaluations
   - Reduce duplicate API calls

3. **Analytics dashboard**
   - View evaluation success rates
   - Track common errors
   - Identify difficult words/patterns

4. **Auto-suggestions**
   - Parse LLM suggestions
   - Offer "Apply suggestion" buttons
   - Auto-fix common mistakes

---

## Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Confirm migrations are applied
4. Test with simple sentences first
5. Check OpenAI API status: https://status.openai.com/

---

## Files Reference

**Core Implementation:**
- [lib/llm/evaluator.ts](lib/llm/evaluator.ts) - Main evaluation service
- [lib/llm/providers/openai.ts](lib/llm/providers/openai.ts) - OpenAI integration
- [lib/llm/prompts/](lib/llm/prompts/) - Evaluation prompts
- [app/actions/evaluations.ts](app/actions/evaluations.ts) - Server actions

**UI Components:**
- [components/EvaluationFeedback.tsx](components/EvaluationFeedback.tsx) - Feedback display
- [components/SentenceSubmissionForm.tsx](components/SentenceSubmissionForm.tsx) - Learner form
- [components/TranslationForm.tsx](components/TranslationForm.tsx) - Translation form
- [components/ConversationList.tsx](components/ConversationList.tsx) - Admin view

**Database:**
- [supabase/migrations/007_add_evaluations.sql](supabase/migrations/007_add_evaluations.sql) - Add evaluation fields
- [supabase/migrations/008_evaluation_history.sql](supabase/migrations/008_evaluation_history.sql) - Create history table

**Configuration:**
- [.env.local](.env.local) - Environment variables
- [.env.example](.env.example) - Template
