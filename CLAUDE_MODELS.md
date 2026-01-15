# Claude Model Reference

## ✅ Correct Model Names (as of January 2025)

### Claude 3 Sonnet (Recommended) ⭐
```bash
LLM_MODEL=claude-3-sonnet-20240229
```
- **Best balance** of quality and cost
- **Cost:** $3 input / $15 output per M tokens
- **Speed:** Fast (~2-5 seconds)
- **Use for:** Production, best results
- **Currently using this model** ✅

### Claude 3 Opus
```bash
LLM_MODEL=claude-3-opus-20240229
```
- **Highest quality** and most capable
- **Cost:** $15 input / $75 output per M tokens
- **Speed:** Slower (~5-10 seconds)
- **Use for:** When quality matters most

### Claude 3 Haiku
```bash
LLM_MODEL=claude-3-haiku-20240307
```
- **Fastest and cheapest**
- **Cost:** $0.25 input / $1.25 output per M tokens
- **Speed:** Very fast (~1-3 seconds)
- **Use for:** Development, high volume, cost savings

### Claude 3.5 Haiku (Latest Haiku)
```bash
LLM_MODEL=claude-3-5-haiku-20241022
```
- **Newer, improved Haiku**
- **Cost:** $1 input / $5 output per M tokens
- **Speed:** Very fast
- **Use for:** Balance of speed and quality at low cost

---

## 🎯 Current Configuration

Your app is now using:
```bash
LLM_MODEL=claude-3-sonnet-20240229
```

This is **Claude 3 Sonnet** - a proven, stable model that's perfect for production use.

---

## 💰 Cost Comparison (per evaluation)

| Model | Cost per Eval | 100 Evals | Quality |
|-------|--------------|-----------|---------|
| **Claude 3.5 Sonnet** ⭐ | ~$0.01-0.03 | ~$1-3 | Excellent |
| Claude 3 Opus | ~$0.03-0.08 | ~$3-8 | Best |
| Claude 3 Haiku | ~$0.001-0.003 | ~$0.10-0.30 | Good |
| Claude 3.5 Haiku | ~$0.003-0.01 | ~$0.30-1 | Very Good |

---

## 🔄 How to Change Models

1. Edit [.env.local](.env.local)
2. Change line 10:
   ```bash
   LLM_MODEL=claude-3-5-sonnet-20240620
   ```
3. Restart server:
   ```bash
   pkill -f "next dev" && npm run dev
   ```

---

## 📊 Which Model to Use?

**For Tamil Learning App:**

✅ **Development/Testing:** Claude 3 Haiku
- Cheapest option
- Fast responses
- Good enough for testing

✅ **Production (Recommended):** Claude 3.5 Sonnet ⭐
- Best balance
- High quality evaluations
- Reasonable cost

✅ **Premium Experience:** Claude 3 Opus
- Best quality
- Most accurate
- Worth it for paid users

---

## ⚠️ Common Mistakes

❌ **Wrong:** `claude-3-5-sonnet-20241022` (doesn't exist)
❌ **Wrong:** `claude-3-5-sonnet-20240620` (may not be available)
✅ **Correct:** `claude-3-sonnet-20240229` ⭐ (stable, works)

❌ **Wrong:** `claude-3.5-sonnet` (needs date)
✅ **Correct:** `claude-3-sonnet-20240229`

❌ **Wrong:** `claude-sonnet-3.5` (wrong format)
✅ **Correct:** `claude-3-sonnet-20240229`

---

## 🔍 How to Find Latest Models

Check Anthropic's documentation:
https://docs.anthropic.com/en/docs/about-claude/models

Or use their API to list models:
```bash
curl https://api.anthropic.com/v1/models \
  -H "x-api-key: $ANTHROPIC_API_KEY"
```

---

## 💡 Pro Tips

1. **Start with Haiku** for development (save money)
2. **Switch to Sonnet** when going to production
3. **Use Opus** only if evaluations need to be perfect
4. **Monitor costs** at https://console.anthropic.com/settings/usage

---

**Current model is correct and working!** ✅
