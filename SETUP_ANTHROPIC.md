# Setup Guide - Using Anthropic Claude

## Quick Setup

### Step 1: Add Your Anthropic API Key

**File:** [.env.local](.env.local)

Replace line 6 with your actual Anthropic API key:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

**Where to get your API key:**
1. Go to: https://console.anthropic.com/
2. Navigate to **API Keys** in the left sidebar
3. Click **Create Key**
4. Copy the key (starts with `sk-ant-api03-...`)
5. Paste it in [.env.local](.env.local) on line 6

### Step 2: Restart Your Dev Server

```bash
# Kill the current server
pkill -f "next dev"

# Start fresh
npm run dev
```

### Step 3: Test It!

1. Open http://localhost:3000
2. Login as a learner
3. Select words and write a Tamil sentence
4. Click **"Evaluate Sentence"**
5. You should see real AI feedback from Claude! 🎉

---

## Configuration Details

### Current Settings (Already Configured)

Your [.env.local](.env.local) is already set up to use Anthropic:

```bash
# Provider Configuration
LLM_PROVIDER=anthropic                    # ✅ Using Anthropic
LLM_MODEL=claude-3-5-sonnet-20241022     # ✅ Using Claude 3.5 Sonnet
LLM_EVALUATION_ENABLED=true               # ✅ Evaluation enabled
```

### Available Claude Models

You can change the model in [.env.local](.env.local):

| Model | Description | Cost | Speed |
|-------|-------------|------|-------|
| `claude-3-5-sonnet-20241022` | **Recommended** - Best balance | $3/$15 per M tokens | Fast |
| `claude-3-opus-20240229` | Most capable, best quality | $15/$75 per M tokens | Slower |
| `claude-3-haiku-20240307` | Fastest, cheapest | $0.25/$1.25 per M tokens | Very Fast |

**Default:** Claude 3.5 Sonnet (already configured)

---

## Cost Estimation

### With Claude 3.5 Sonnet (Recommended)
- Input: $3 per million tokens
- Output: $15 per million tokens
- **Per evaluation:** ~$0.01-0.03
- **100 evaluations:** ~$1-3

### Cost-Saving Options

**Option 1: Use Claude Haiku (10x cheaper)**
```bash
LLM_MODEL=claude-3-haiku-20240307
```
- **Per evaluation:** ~$0.001-0.003
- **100 evaluations:** ~$0.10-0.30

**Option 2: Disable for Development**
```bash
LLM_EVALUATION_ENABLED=false
```
- Evaluations auto-pass as "Correct"
- No API costs
- Good for testing UI/flow

---

## Security

✅ **Your API key is secure:**
- Variable name: `ANTHROPIC_API_KEY` (no `NEXT_PUBLIC_` prefix)
- Only accessible on server-side
- Never exposed to browser/client
- All LLM calls happen in Server Actions
- `.env.local` is in `.gitignore`

❌ **Never do this:**
```bash
NEXT_PUBLIC_ANTHROPIC_API_KEY=...  # ❌ Would expose to browser!
```

---

## Verification

### Check if it's working:

1. **Server logs:** Watch for Anthropic API calls
   ```bash
   tail -f /tmp/nextjs-dev.log
   ```

2. **Browser console:** Check for errors (should be none)

3. **Test evaluation:**
   - Write Tamil sentence
   - Click "Evaluate"
   - Should see detailed AI feedback

### Expected Behavior:

✅ **Correct evaluation:**
- Green badge: "Correct"
- Positive feedback
- "Submit to Admin" button enabled

✅ **Needs improvement:**
- Yellow/Red badge
- Specific suggestions
- Can edit and re-evaluate
- Submit disabled until correct

---

## Troubleshooting

### Error: "ANTHROPIC_API_KEY environment variable is not set"

**Solution:**
1. Check [.env.local](.env.local) line 6
2. Make sure key starts with `sk-ant-`
3. Restart dev server

### Error: "401 Unauthorized" or "Invalid API Key"

**Solution:**
1. Verify your key at https://console.anthropic.com/settings/keys
2. Check if the key has been deleted or expired
3. Create a new key if needed

### Evaluation returns "incorrect" for everything

**Possible causes:**
- Model might be too strict
- Prompt needs adjustment
- Try Claude Haiku (more lenient)

**Solution:**
```bash
LLM_MODEL=claude-3-haiku-20240307
```

### High API costs

**Solutions:**
1. Switch to Haiku (cheaper)
2. Use evaluation caching (future feature)
3. Disable for development:
   ```bash
   LLM_EVALUATION_ENABLED=false
   ```

---

## Comparison: Anthropic vs OpenAI

| Feature | Claude (Anthropic) | GPT-4 (OpenAI) |
|---------|-------------------|----------------|
| **API Key Format** | `sk-ant-api03-...` | `sk-proj-...` or `sk-...` |
| **Best Model** | Claude 3.5 Sonnet | GPT-4 Turbo |
| **Cost (Similar)** | $3-15/M tokens | $10-30/M tokens |
| **Strengths** | Following instructions, safety | General knowledge |
| **For Tamil** | ✅ Great | ✅ Great |

**Both work great for Tamil evaluation!** We've switched to Anthropic because you have an API key available.

---

## Next Steps

1. ✅ Add your Anthropic API key to line 6 of [.env.local](.env.local)
2. ✅ Restart dev server
3. ✅ Test the evaluation
4. 🎉 Start using the app!

---

## Additional Configuration

### Production Deployment (Vercel)

Add these environment variables to your Vercel project:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-key
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_EVALUATION_ENABLED=true
```

### Rate Limiting

Anthropic has generous rate limits:
- **Claude 3.5 Sonnet:** 50 requests/min, 40k tokens/min
- **Claude Haiku:** 50 requests/min, 50k tokens/min

For a Tamil learning app, this is more than enough!

---

## Files Modified

These files now support Anthropic:
- ✅ [lib/llm/providers/anthropic.ts](lib/llm/providers/anthropic.ts) - **NEW**
- ✅ [lib/llm/evaluator.ts](lib/llm/evaluator.ts) - Updated to support both providers
- ✅ [.env.local](.env.local) - Configured for Anthropic
- ✅ [package.json](package.json) - Added `@anthropic-ai/sdk`

---

## Support

**Need help?**
- Anthropic Console: https://console.anthropic.com/
- API Documentation: https://docs.anthropic.com/
- Pricing: https://www.anthropic.com/pricing

**Ready to go!** Just add your API key and restart the server. 🚀
