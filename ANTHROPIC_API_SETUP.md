# Anthropic API Setup Guide

## Error: 401 Insufficient Permissions

You're seeing this error because your current API key is **restricted** and doesn't have the `model.request` scope.

### Fix: Create a New Unrestricted API Key

#### Step 1: Go to Anthropic Console
Visit: https://console.anthropic.com/settings/keys

#### Step 2: Create New Key
1. Click **"Create Key"** button
2. Give it a descriptive name: `Sollu App - Full Access`
3. **IMPORTANT**: Do NOT add any restrictions
   - Leave all scopes enabled (especially `model.request`)
   - This ensures full API access for your app
4. Click **"Create Key"**
5. Copy the key immediately (you won't be able to see it again)

#### Step 3: Update Environment Variable

Replace the API key in your `.env.local` file:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-NEW-KEY-HERE
```

#### Step 4: Restart Development Server

```bash
# Kill the current server
pkill -f "next dev"

# Start fresh
npm run dev
```

#### Step 5: Test the Fix

1. Go to http://localhost:3000
2. Complete the flashcards
3. Submit a sentence for evaluation
4. Verify the AI evaluation works without errors

## API Key Types

### ✅ Unrestricted Key (What You Need)
- Full access to all API endpoints
- Can use any Claude model
- Suitable for development and production

### ❌ Restricted/Custom Key (Your Current Key)
- Limited scopes (missing `model.request`)
- May be restricted to specific models or features
- Causes 401 errors when trying to use restricted features

## Security Best Practices

1. **Never commit API keys to git**
   - Your `.env.local` is already in `.gitignore`
   - Keep it that way!

2. **Use different keys for dev/prod**
   - Development: One key for local testing
   - Production: Separate key for deployed app

3. **Rotate keys regularly**
   - Change API keys every few months
   - Immediately rotate if a key is exposed

4. **Monitor usage**
   - Check: https://console.anthropic.com/settings/usage
   - Set up billing alerts to avoid surprises

## Troubleshooting

### Still Getting 401 After Key Update?

1. **Check the key was copied correctly**
   ```bash
   # Should start with: sk-ant-api03-
   grep ANTHROPIC_API_KEY .env.local
   ```

2. **Restart the dev server**
   ```bash
   pkill -f "next dev" && npm run dev
   ```

3. **Clear browser cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

4. **Verify the key in Anthropic Console**
   - Check it's not disabled or deleted
   - Verify it has no scope restrictions

### Getting Different Errors?

**Error**: "model not found"
- **Fix**: Already fixed - you're using `claude-sonnet-4-5-20250929`

**Error**: Rate limit exceeded
- **Fix**: Wait a few minutes, or upgrade your Anthropic plan

**Error**: Insufficient credits
- **Fix**: Add payment method at https://console.anthropic.com/settings/billing

## Current Configuration

Your app is configured to use:
- **Provider**: Anthropic (Claude)
- **Model**: `claude-sonnet-4-5-20250929` (Claude Sonnet 4.5)
- **Feature**: LLM-powered sentence evaluation

This configuration is already set correctly in your `.env.local`.

## Need Help?

1. Check Anthropic API docs: https://docs.anthropic.com/
2. View API status: https://status.anthropic.com/
3. Contact Anthropic support: https://console.anthropic.com/support
