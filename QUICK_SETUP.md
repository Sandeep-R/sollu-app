# ⚡ Quick Setup - 5 Minutes

## 1️⃣ Run Migrations (2 minutes)

**URL**: https://supabase.com/dashboard → SQL Editor

Copy and run each file in order:

```
✅ supabase/migrations/009_push_subscriptions.sql
✅ supabase/migrations/010_notification_preferences.sql
✅ supabase/migrations/011_notification_log.sql
```

**How**:
- Click "+ New query"
- Paste entire file content
- Click "Run" or press Cmd+Enter

---

## 2️⃣ Get Service Role Key (1 minute)

**URL**: https://supabase.com/dashboard → Settings → API

**Find**: "Project API keys" section

**Copy**: The `service_role` key (the LONG one, not the anon key)

**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...` (very long string)

---

## 3️⃣ Add Key to .env.local (30 seconds)

Open `.env.local` and find this line:

```bash
# SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
```

Replace it with:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_actual_key_here
```

**Important**: Remove the `#` at the start!

---

## 4️⃣ Restart Dev Server (30 seconds)

In your terminal:
1. Press `Ctrl+C` to stop the current server
2. Run: `npm run dev`

---

## ✅ Verify It Works

1. Open http://localhost:3000
2. Sign up as a new user
3. You should see the notification permission prompt
4. Click "Enable Notifications"
5. If successful, you're done! 🎉

---

## 🆘 Need Help?

If migrations fail:
- Check you're in the right Supabase project
- "already exists" errors are OK (table already created)

If service role key doesn't work:
- Make sure you copied the `service_role` key (not `anon`)
- Make sure there's no `#` at the start of the line
- Make sure you restarted the server after adding it

---

**Total Time**: ~5 minutes
**Difficulty**: Easy ⭐
