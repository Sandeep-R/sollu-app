# Push Notifications Deployment Checklist

## Pre-Deployment

### ✅ Database Setup

- [ ] Run migration `009_push_subscriptions.sql`
- [ ] Run migration `010_notification_preferences.sql`
- [ ] Run migration `011_notification_log.sql`
- [ ] Verify tables created successfully in Supabase dashboard
- [ ] Check RLS policies are enabled

### ✅ Environment Variables

**Local (.env.local)**
- [x] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Already set
- [x] `VAPID_PRIVATE_KEY` - Already set
- [x] `VAPID_SUBJECT` - Already set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Get from Supabase dashboard

**Production (Vercel)**
- [ ] Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` to Vercel environment variables
- [ ] Add `VAPID_PRIVATE_KEY` to Vercel environment variables
- [ ] Add `VAPID_SUBJECT` to Vercel environment variables
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables
- [ ] (Optional) Add `CRON_SECRET` for cron job security

### ✅ Code Review

- [x] Service worker created (`public/sw.js`)
- [x] Subscription manager implemented
- [x] Notification components created
- [x] Server-side service configured
- [x] API routes created
- [x] Cron job configured
- [x] Integration with conversation actions
- [x] Signup flow updated
- [x] Settings page created

## Deployment Steps

### 1. Get Supabase Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** > **API**
4. Scroll to **Project API keys**
5. Copy the `service_role` key (NOT the `anon` key)
6. Add to `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 2. Run Database Migrations

**Option A: Using Supabase Dashboard**
1. Go to SQL Editor in Supabase dashboard
2. Copy and paste each migration file:
   - `009_push_subscriptions.sql`
   - `010_notification_preferences.sql`
   - `011_notification_log.sql`
3. Execute each one in order

**Option B: Using Supabase CLI**
```bash
supabase db push
```

### 3. Test Locally

```bash
# Start the dev server
npm run dev

# Open http://localhost:3000
# Sign up as a new user
# Test notification permission flow
# Test subscribing to notifications
```

### 4. Deploy to Vercel

```bash
# Build and verify
npm run build

# Deploy
git add .
git commit -m "Add push notification system"
git push origin main
```

### 5. Configure Vercel Environment Variables

1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add all environment variables:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET` (optional)
5. Redeploy to apply changes

### 6. Verify Cron Job

1. In Vercel dashboard, go to **Cron Jobs**
2. Verify `daily-reminders` job is listed
3. Check schedule: `30 3 * * *` (9:00 AM IST)
4. Monitor execution logs

## Post-Deployment Testing

### Test on iOS

- [ ] Install PWA on iOS device (iPhone/iPad with iOS 16.4+)
- [ ] Open the PWA
- [ ] Allow notifications when prompted
- [ ] Submit a sentence and verify admin receives notification
- [ ] As admin, reply and verify learner receives notification

### Test on Android

- [ ] Install PWA on Android device or use Chrome
- [ ] Open the PWA
- [ ] Allow notifications when prompted
- [ ] Submit a sentence and verify admin receives notification
- [ ] As admin, reply and verify learner receives notification

### Test Daily Reminders

**Manual Test:**
```bash
# Call the cron endpoint
curl -X POST https://your-domain.vercel.app/api/cron/daily-reminders

# With authentication (if CRON_SECRET is set)
curl -X POST https://your-domain.vercel.app/api/cron/daily-reminders \
  -H "Authorization: Bearer your_cron_secret"
```

**Wait for Scheduled Execution:**
- [ ] Check Vercel function logs next day at 9 AM IST
- [ ] Verify learners received reminders
- [ ] Check `notification_log` table in Supabase

### Test Settings Page

- [ ] Navigate to `/settings/notifications`
- [ ] Toggle action notifications on/off
- [ ] Toggle scheduled notifications on/off
- [ ] Verify changes save correctly
- [ ] Verify preferences respected when sending notifications

## Monitoring

### Check Database

```sql
-- Verify subscriptions are being created
SELECT COUNT(*), platform FROM push_subscriptions GROUP BY platform;

-- Check notification preferences
SELECT COUNT(*) FROM notification_preferences;

-- Check notification delivery
SELECT
  notification_type,
  COUNT(*) as total,
  SUM(CASE WHEN delivered THEN 1 ELSE 0 END) as delivered_count
FROM notification_log
WHERE sent_at > NOW() - INTERVAL '24 hours'
GROUP BY notification_type;
```

### Check Vercel Logs

1. Go to Vercel dashboard
2. Select your project
3. Go to **Logs**
4. Filter by function: `/api/cron/daily-reminders`
5. Look for errors or failed executions

### Check Browser Console

For users experiencing issues:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for service worker errors
4. Go to **Application** > **Service Workers**
5. Verify service worker is registered and active

## Troubleshooting

### Notifications not working

**Check 1: Browser Support**
```javascript
// Run in browser console
console.log('Supported:', 'serviceWorker' in navigator && 'PushManager' in window)
console.log('Permission:', Notification.permission)
```

**Check 2: Subscription exists**
```javascript
// Run in browser console
navigator.serviceWorker.ready.then(reg =>
  reg.pushManager.getSubscription().then(sub =>
    console.log('Subscription:', sub)
  )
)
```

**Check 3: Database has subscription**
```sql
-- Run in Supabase SQL editor
SELECT * FROM push_subscriptions WHERE user_id = 'your_user_id';
```

**Check 4: Environment variables**
- Verify all variables are set in Vercel
- Redeploy after adding variables
- Check they're not accidentally prefixed with `NEXT_PUBLIC_` if they shouldn't be

### Cron job not running

- Verify `vercel.json` is committed to repo
- Check Vercel dashboard for cron job configuration
- Look at function logs for errors
- Test the endpoint manually

### Service worker not registering

- Must be on HTTPS (or localhost)
- Check `sw.js` is in `public/` directory
- Clear browser cache and try again
- Check for JavaScript errors in console

## Rollback Plan

If something goes wrong:

1. **Disable notifications in UI**: Users can turn off in settings
2. **Disable cron job**: Remove from Vercel dashboard
3. **Remove environment variables**: Won't affect existing functionality
4. **Rollback database**: Run:
   ```sql
   DROP TABLE IF EXISTS notification_log;
   DROP TABLE IF EXISTS notification_preferences;
   DROP TABLE IF EXISTS push_subscriptions;
   DROP TYPE IF EXISTS notification_type;
   ```

## Success Metrics

After deployment, monitor:

- [ ] Number of active push subscriptions
- [ ] Notification delivery rate (>90% target)
- [ ] User engagement (clicks on notifications)
- [ ] Daily reminder open rate
- [ ] User retention (compared to before notifications)

## Next Steps

After successful deployment:

1. Monitor for 1 week and gather metrics
2. Collect user feedback
3. Consider adding:
   - Custom reminder times
   - Notification history in-app
   - Rich notifications with images
   - Weekly progress reports
4. Document any issues and solutions
5. Update this checklist based on learnings

## Support

If issues arise:

1. Check logs in Vercel dashboard
2. Check database logs in Supabase
3. Review browser console for client-side errors
4. Check `PUSH_NOTIFICATIONS.md` for detailed troubleshooting
5. Test with different browsers/devices
