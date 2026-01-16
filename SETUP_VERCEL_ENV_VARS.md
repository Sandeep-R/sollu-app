# Vercel Environment Variables Setup

## Required Environment Variables

You need to add these environment variables to your Vercel project:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your project: `sollu-app`
- Go to: **Settings** → **Environment Variables**

### 2. Add These Variables

#### Already Set (verify these exist):
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- ✅ `VAPID_PRIVATE_KEY`
- ✅ `VAPID_SUBJECT`

#### MISSING - Add This One:
- ❌ **`SUPABASE_SERVICE_ROLE_KEY`** ← **THIS IS MISSING!**

### 3. How to Get SUPABASE_SERVICE_ROLE_KEY

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings** → **API**
4. Find the **`service_role`** key (it's labeled as "secret" - don't use the anon key!)
5. Copy the entire key (it's a long string starting with `eyJ...`)

### 4. Add to Vercel

1. In Vercel → Settings → Environment Variables
2. Click **Add New**
3. Name: `SUPABASE_SERVICE_ROLE_KEY`
4. Value: Paste the service_role key from Supabase
5. **Important**: Select all environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Click **Save**

### 5. Redeploy

After adding the variable:
- Go to **Deployments** tab
- Click the **⋯** menu on the latest deployment
- Click **Redeploy**

Or just push a new commit to trigger a new deployment.

## Verification

After redeploying, test by visiting:
- `https://your-app.vercel.app/api/notifications/test-send`

You should receive a push notification!

## Security Note

⚠️ **Never commit `SUPABASE_SERVICE_ROLE_KEY` to git!** It should only be in Vercel environment variables.
