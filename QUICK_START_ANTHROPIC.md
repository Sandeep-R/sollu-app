# 🚀 Quick Start - Anthropic Claude

## ⚡ 3 Steps to Get Started

### 1️⃣ Add Your API Key

Open [.env.local](.env.local) and replace line 6:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY-HERE
```

**Get your key:** https://console.anthropic.com/settings/keys

### 2️⃣ Restart Server

```bash
pkill -f "next dev" && npm run dev
```

### 3️⃣ Test It!

1. Go to http://localhost:3000
2. Login as learner
3. Write Tamil sentence
4. Click "Evaluate Sentence"
5. See AI feedback! 🎉

---

## ✅ What's Already Done

- ✅ Anthropic SDK installed
- ✅ Claude provider implemented
- ✅ Configuration updated
- ✅ Using Claude 3.5 Sonnet (best model)
- ✅ Evaluation enabled

## 📍 Where to Add Your Key

**File:** `.env.local`
**Line:** 6
**Format:** `ANTHROPIC_API_KEY=sk-ant-api03-...`

**Before:**
```bash
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

**After:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-AbCdEfGh1234567890...
```

---

## 💰 Cost

**Claude 3.5 Sonnet:**
- ~$0.01-0.03 per evaluation
- ~$1-3 for 100 evaluations

**Want cheaper?** Use Haiku in `.env.local`:
```bash
LLM_MODEL=claude-3-haiku-20240307
```
- ~$0.001-0.003 per evaluation
- 10x cheaper!

---

## 🆘 Troubleshooting

**"API key not set" error:**
→ Add key to line 6 of `.env.local` and restart

**"401 Unauthorized" error:**
→ Check key at https://console.anthropic.com/settings/keys

**Need to test without AI:**
→ Set `LLM_EVALUATION_ENABLED=false` in `.env.local`

---

## 📚 Full Documentation

- **Detailed setup:** [SETUP_ANTHROPIC.md](SETUP_ANTHROPIC.md)
- **How it works:** [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)
- **Flow explanation:** [CORRECTED_FLOW.md](CORRECTED_FLOW.md)

---

That's it! Add your API key and you're ready to go! 🎊
