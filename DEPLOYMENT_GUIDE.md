# Deployment Guide

## Email Confirmation Links Configuration

The email confirmation links sent by Supabase currently point to `localhost`. To fix this for production:

### Step 1: Configure Supabase Dashboard

1. Go to your Supabase Dashboard:
   - URL: https://supabase.com/dashboard/project/xvgiansmsshnlcfglswl

2. Navigate to **Authentication** → **URL Configuration**

3. Update the following settings:
   - **Site URL**: Set to your production domain (e.g., `https://yourdomain.com`)
   - **Redirect URLs**: Add your production URL to the list of allowed redirect URLs

4. Save the changes

### Step 2: Update Environment Variables for Production

When deploying to production (Vercel, Netlify, etc.), make sure to set:

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

This environment variable is already configured in your `.env.local` for development.

### Step 3: Deployment Checklist

Before deploying to production:

- [ ] Update Supabase Site URL in dashboard
- [ ] Add production domain to Supabase Redirect URLs
- [ ] Set `NEXT_PUBLIC_SITE_URL` environment variable in hosting provider
- [ ] Set all other environment variables from `.env.local`
- [ ] Test email confirmation flow in production
- [ ] Verify sign up/sign in works correctly

## Environment Variables Required for Production

Copy these from your `.env.local` to your hosting provider:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xvgiansmsshnlcfglswl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Site URL (IMPORTANT: Change to your production domain)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Anthropic API (for LLM evaluation)
ANTHROPIC_API_KEY=your_api_key_here
LLM_PROVIDER=anthropic
LLM_MODEL=claude-sonnet-4-5-20250929
LLM_EVALUATION_ENABLED=true
```

## Testing Production Email Flow

After deployment:

1. Sign up with a new email address
2. Check the confirmation email
3. Verify the link points to your production domain (not localhost)
4. Click the link and confirm it works
5. Complete sign in

## Common Issues

**Issue**: Email links still point to localhost
**Solution**:
- Check Supabase Dashboard Site URL is set correctly
- Verify `NEXT_PUBLIC_SITE_URL` is set in hosting provider
- Clear browser cache and try again

**Issue**: "Invalid redirect URL" error
**Solution**:
- Add your production URL to Supabase Redirect URLs list
- Make sure the URL matches exactly (including https://)

## Hosting Recommendations

### Vercel (Recommended for Next.js)
1. Connect your GitHub repository
2. Add environment variables in Project Settings
3. Deploy automatically on push to main

### Other Platforms
- Netlify: Similar to Vercel, works well with Next.js
- Railway: Good for full-stack apps
- Fly.io: For Docker deployments

## Support

If you encounter issues:
1. Check Supabase logs: https://supabase.com/dashboard/project/xvgiansmsshnlcfglswl/logs
2. Check hosting provider logs
3. Verify all environment variables are set correctly
