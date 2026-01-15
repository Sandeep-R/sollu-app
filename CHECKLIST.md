# LLM Evaluation System - Setup Checklist

Use this checklist to complete the setup of the LLM evaluation system.

## ✅ Pre-Completed (Already Done)

- [x] Install dependencies (`openai`, `zod`)
- [x] Implement LLM service abstraction
- [x] Implement OpenAI provider
- [x] Create evaluation prompts
- [x] Create server actions for evaluations
- [x] Update conversation actions to require evaluations
- [x] Create EvaluationFeedback component
- [x] Update SentenceSubmissionForm with evaluation
- [x] Update TranslationForm with evaluation
- [x] Update ConversationList to show evaluation results
- [x] Create migration files
- [x] Add environment variable template

## 📋 Your Tasks (To Complete Now)

### 1. Database Setup
- [ ] **Apply Migration 007** (Add evaluation fields to conversations table)
  - Go to: https://app.supabase.com/project/xvgiansmsshnlcfglswl/sql/new
  - Copy/paste contents of `supabase/migrations/007_add_evaluations.sql`
  - Click "Run"

- [ ] **Apply Migration 008** (Create evaluation_history table)
  - Copy/paste contents of `supabase/migrations/008_evaluation_history.sql`
  - Click "Run"

- [ ] **Verify migrations**
  - Run verification query from SETUP_LLM_EVALUATION.md
  - Should see 6 columns listed

### 2. OpenAI Setup
- [ ] **Get OpenAI API key**
  - Visit: https://platform.openai.com/api-keys
  - Create new key
  - Copy key (starts with `sk-`)

- [ ] **Update .env.local**
  - Open `.env.local`
  - Replace `sk-your-openai-api-key-here` with your real key
  - Save file

- [ ] **Restart dev server**
  - Stop current server (Ctrl+C)
  - Run `npm run dev`

### 3. Testing
- [ ] **Test Tamil sentence evaluation**
  - Login as learner
  - Select words
  - Write Tamil sentence + English translation
  - Click "Evaluate Sentence"
  - Verify feedback appears
  - Get "Correct" rating
  - Submit to admin

- [ ] **Test admin reply translation**
  - Login as admin
  - Reply to a conversation in Tamil
  - Switch to learner
  - Translate admin's reply
  - Click "Evaluate Translation"
  - Get "Correct" rating
  - Complete conversation

- [ ] **Test admin dashboard**
  - Login as admin
  - View conversations page
  - Verify evaluation badges appear
  - Click conversation to see detailed feedback

### 4. Production Deployment (If Deploying)
- [ ] **Add environment variables to Vercel/hosting platform**
  - `OPENAI_API_KEY`
  - `LLM_PROVIDER=openai`
  - `LLM_MODEL=gpt-4-turbo`
  - `LLM_EVALUATION_ENABLED=true`

- [ ] **Redeploy application**

- [ ] **Test on production**

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ Learners can evaluate their Tamil sentences
2. ✅ Evaluation feedback appears with ratings and suggestions
3. ✅ Submit button is disabled until evaluation passes
4. ✅ Learners can evaluate their translations of admin replies
5. ✅ Admin dashboard shows evaluation badges and detailed feedback
6. ✅ No console errors related to LLM or evaluations

## 📚 Reference Documents

- **Setup Guide:** [SETUP_LLM_EVALUATION.md](SETUP_LLM_EVALUATION.md) - Detailed instructions
- **Implementation Plan:** [PLAN_LLM_EVALUATION.md](PLAN_LLM_EVALUATION.md) - Original plan
- **Environment Template:** [.env.example](.env.example) - Variable reference

## 🆘 Quick Troubleshooting

**Issue: "OPENAI_API_KEY not set" error**
→ Add key to `.env.local` and restart server

**Issue: "column does not exist" error**
→ Apply migrations (Step 1)

**Issue: Evaluation takes too long**
→ Try `LLM_MODEL=gpt-3.5-turbo` for faster/cheaper results

**Issue: Everything passes as "correct"**
→ Check if `LLM_EVALUATION_ENABLED=false` (set to `true`)

## 💰 Cost Monitoring

- GPT-4 Turbo: ~$0.01-0.03 per evaluation
- GPT-3.5 Turbo: ~$0.001-0.003 per evaluation

To reduce costs:
- Use `gpt-3.5-turbo` model
- Set `LLM_EVALUATION_ENABLED=false` during development
- Monitor usage at https://platform.openai.com/usage

---

**Estimated Time to Complete:** 15-30 minutes

**Need help?** See [SETUP_LLM_EVALUATION.md](SETUP_LLM_EVALUATION.md) for detailed troubleshooting.
