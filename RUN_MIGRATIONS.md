# Run Database Migrations - Step by Step

## Quick Guide: Run Migrations via Supabase Dashboard

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: **sollu-app** (or your project name)
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run Migration 1 - push_subscriptions

1. Click **+ New query**
2. Copy the entire content from: `supabase/migrations/009_push_subscriptions.sql`
3. Paste it into the SQL Editor
4. Click **Run** (or press Cmd+Enter / Ctrl+Enter)
5. Wait for ✅ "Success. No rows returned"

### Step 3: Run Migration 2 - notification_preferences

1. Click **+ New query** (create a new tab)
2. Copy the entire content from: `supabase/migrations/010_notification_preferences.sql`
3. Paste it into the SQL Editor
4. Click **Run**
5. Wait for ✅ "Success. No rows returned"

### Step 4: Run Migration 3 - notification_log

1. Click **+ New query** (create a new tab)
2. Copy the entire content from: `supabase/migrations/011_notification_log.sql`
3. Paste it into the SQL Editor
4. Click **Run**
5. Wait for ✅ "Success. No rows returned"

### Step 5: Verify Tables Were Created

1. In Supabase Dashboard, click **Table Editor** (left sidebar)
2. You should now see 3 new tables:
   - ✅ `push_subscriptions`
   - ✅ `notification_preferences`
   - ✅ `notification_log`

---

## Get Service Role Key

### Step 1: Navigate to API Settings

1. In Supabase Dashboard, click **Settings** (gear icon, bottom left)
2. Click **API** from the settings menu

### Step 2: Copy Service Role Key

1. Scroll to **Project API keys** section
2. Find the **service_role** key (NOT the anon key)
3. Click the **Copy** icon next to the service_role key
4. **Keep this secret!** Never commit it to version control

### Step 3: Add to .env.local

1. Open your `.env.local` file in the editor
2. Add a new line with:
   ```
   SUPABASE_SERVICE_ROLE_KEY=paste_your_key_here
   ```
3. Save the file
4. Restart your dev server (we'll do this after)

---

## Verification Checklist

After completing all steps:

- [ ] Migration 1 ran successfully (push_subscriptions table created)
- [ ] Migration 2 ran successfully (notification_preferences table created)
- [ ] Migration 3 ran successfully (notification_log table created)
- [ ] All 3 tables visible in Table Editor
- [ ] Service role key copied from Supabase
- [ ] Service role key added to .env.local
- [ ] Dev server restarted

---

## Troubleshooting

### "relation already exists" error
- This is OK! It means the table was already created
- Just continue with the next migration

### "permission denied" error
- Make sure you're logged into the correct Supabase project
- Try refreshing the dashboard

### Can't find service_role key
- Make sure you're in Settings > API (not Database Settings)
- Look for "Project API keys" section
- The service_role key is usually at the bottom

---

## After Migrations Complete

Once all migrations are done and the service role key is added:

1. Restart the dev server:
   ```bash
   # Stop the current server (Ctrl+C in the terminal)
   npm run dev
   ```

2. Test the notification flow:
   - Sign up as a new user
   - You should see the notification permission prompt
   - Allow notifications
   - Test by submitting a sentence

---

## Need Help?

If you run into issues:
1. Check the Supabase Dashboard logs (Logs section in left sidebar)
2. Check your browser console for errors
3. Verify all environment variables are set correctly
