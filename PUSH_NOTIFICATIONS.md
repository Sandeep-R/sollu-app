# Push Notifications Implementation Guide

## Overview

This Tamil learning app now has a complete push notification system for iOS and Android PWAs. The system supports:

1. **Action-triggered notifications**: When learners submit sentences (admins are notified) and when admins reply (learners are notified)
2. **Scheduled notifications**: Daily reminders at 9 AM IST for learners to complete their words

## Architecture

### Database Tables

Three new tables have been created:

1. **`push_subscriptions`**: Stores Web Push subscription data for each user/device
2. **`notification_preferences`**: User preferences for notification types
3. **notification_log`**: Analytics and tracking for sent notifications

### Key Components

#### Frontend
- **Service Worker** (`public/sw.js`): Handles receiving and displaying notifications
- **Subscription Manager** (`lib/notifications/subscribe.ts`): Client-side subscription management
- **NotificationPermission Component** (`components/NotificationPermission.tsx`): UI for requesting permission
- **Settings Page** (`app/settings/notifications/page.tsx`): User notification preferences

#### Backend
- **Notification Service** (`lib/notifications/service.ts`): Server-side notification sending
- **Templates** (`lib/notifications/templates.ts`): Notification message templates
- **VAPID Configuration** (`lib/notifications/vapid.ts`): Web Push authentication
- **API Routes**:
  - `/api/notifications/subscribe`: Save push subscriptions
  - `/api/notifications/unsubscribe`: Remove subscriptions
  - `/api/notifications/send`: Send notifications
  - `/api/cron/daily-reminders`: Daily reminder cron job

## Setup Instructions

### 1. Database Migration

Run the database migrations to create the required tables:

```bash
# In your Supabase project, run these migrations in order:
# - supabase/migrations/009_push_subscriptions.sql
# - supabase/migrations/010_notification_preferences.sql
# - supabase/migrations/011_notification_log.sql
```

Or use Supabase CLI:

```bash
supabase db push
```

### 2. Environment Variables

The VAPID keys have already been generated. Add these to your production environment (Vercel):

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your_public_key>
VAPID_PRIVATE_KEY=<your_private_key>
VAPID_SUBJECT=mailto:admin@sollu.app
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
```

#### Getting the Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the `service_role` key (NOT the `anon` key)
4. Add it to your `.env.local` and Vercel environment variables

**Important**: Never expose the service role key to the client!

### 3. Vercel Deployment

The `vercel.json` file is already configured for the daily reminders cron job:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reminders",
      "schedule": "30 3 * * *"
    }
  ]
}
```

This runs at 9:00 AM IST (3:30 AM UTC) every day.

### 4. Optional: Cron Secret

For additional security, add a CRON_SECRET to your environment variables:

```bash
CRON_SECRET=<generate_a_random_secret>
```

Then, when calling the cron endpoint manually, include it as a Bearer token:

```bash
curl -H "Authorization: Bearer <your_secret>" https://your-domain.com/api/cron/daily-reminders
```

## Testing

### Test Push Notifications Locally

1. Start the development server:
```bash
npm run dev
```

2. Sign up as a new user or sign in
3. When prompted, allow notifications
4. Test the flow:
   - As a learner, submit a sentence
   - As an admin, reply to the sentence
   - Check if notifications appear

### Test on Different Platforms

#### iOS (16.4+)
1. Add the PWA to your home screen
2. Open the PWA
3. Allow notifications when prompted
4. Test notification delivery

#### Android
1. Add the PWA to your home screen (or use Chrome browser)
2. Open the PWA
3. Allow notifications when prompted
4. Test notification delivery

#### Desktop (Chrome/Edge/Firefox)
1. Open the app in a browser
2. Allow notifications when prompted
3. Test notification delivery

### Test Daily Reminders

You can manually trigger the daily reminders endpoint:

```bash
# Without authentication
curl -X POST http://localhost:3000/api/cron/daily-reminders

# With CRON_SECRET
curl -X POST http://localhost:3000/api/cron/daily-reminders \
  -H "Authorization: Bearer your_cron_secret"
```

## User Flow

### New User Signup
1. User signs up
2. Redirected to `/setup-notifications`
3. Shown NotificationPermission component
4. Can enable or skip notifications
5. If enabled:
   - Browser requests permission
   - Service worker registers
   - Subscription saved to database
   - User redirected to home

### Managing Notifications
1. Navigate to `/settings/notifications`
2. Toggle notification types on/off:
   - Action notifications (admin replies)
   - Scheduled notifications (daily reminders)
3. Enable/disable browser notifications
4. Changes save automatically

## Notification Types

### 1. Learner Submission (to Admins)
- **Trigger**: Learner submits a Tamil sentence
- **Recipient**: All admins
- **Template**: "New sentence from {email}: {sentence_preview}"
- **Action**: Click to view conversation

### 2. Admin Reply (to Learner)
- **Trigger**: Admin replies to a sentence
- **Recipient**: The learner who submitted
- **Template**: "Admin replied: {reply_preview}"
- **Action**: Click to view conversation

### 3. Daily Reminder (to Learners)
- **Trigger**: Cron job at 9 AM IST
- **Recipient**: Learners who haven't completed words today
- **Template**: "Good morning! Time to learn Tamil. Complete your words for today! 📚"
- **Action**: Click to open word list

## Troubleshooting

### Notifications Not Working

1. **Check browser support**:
   - iOS: Requires 16.4+ and must be installed as PWA
   - Safari: Limited support, use Chrome/Edge instead
   - Check: `isPushNotificationSupported()` in browser console

2. **Check permissions**:
   - Look for permission status in browser settings
   - Permission status: granted, denied, or default
   - If denied, user must manually enable in browser settings

3. **Check subscription**:
   - Open browser DevTools > Application > Service Workers
   - Verify service worker is registered and active
   - Check Push Messaging subscription exists

4. **Check environment variables**:
   - Verify VAPID keys are set correctly
   - Verify service role key is set
   - Check keys match between client and server

5. **Check database**:
   - Verify migrations ran successfully
   - Check `push_subscriptions` table has entries
   - Check `notification_preferences` table has user settings

### Service Worker Not Registering

1. **HTTPS Required**: Service workers only work on HTTPS (or localhost)
2. **Check scope**: Service worker is registered at root (`/`)
3. **Check file location**: `sw.js` must be in `public/` directory
4. **Clear cache**: Try hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

### Daily Reminders Not Sending

1. **Check Vercel cron jobs**: Verify in Vercel dashboard under Cron
2. **Check logs**: View Vercel function logs for errors
3. **Test manually**: Call the endpoint directly to test
4. **Check timezone**: Reminders send at 3:30 AM UTC (9:00 AM IST)

## Browser Compatibility

| Platform | Browser | Support |
|----------|---------|---------|
| iOS 16.4+ | Safari (PWA) | ✅ Full support |
| iOS < 16.4 | Safari | ❌ Not supported |
| Android | Chrome, Edge, Firefox | ✅ Full support |
| macOS | Chrome, Edge, Firefox | ✅ Full support |
| macOS | Safari | ⚠️ Limited support |
| Windows | Chrome, Edge, Firefox | ✅ Full support |
| Linux | Chrome, Firefox | ✅ Full support |

## Security Considerations

1. **VAPID Keys**: Private key never exposed to client
2. **Service Role Key**: Only used server-side, never in client code
3. **RLS Policies**: Users can only manage their own subscriptions
4. **CORS**: API routes properly protected with authentication
5. **Cron Secret**: Optional but recommended for production

## Performance

- Push subscriptions cached in database
- Notifications sent asynchronously
- Failed subscriptions automatically cleaned up
- Service worker caches efficiently

## Future Enhancements

Potential features to add:

1. **Notification Categories**: Different sounds/vibrations per type
2. **Batch Notifications**: Group multiple notifications
3. **Rich Notifications**: Images, action buttons, progress bars
4. **Notification History**: View past notifications in-app
5. **Custom Reminder Times**: Let users choose their reminder time
6. **Weekly Progress Reports**: Summary notifications once per week
7. **Milestone Notifications**: Celebrate user achievements

## Maintenance

### Regular Tasks

1. **Monitor notification logs**: Check `notification_log` table for delivery issues
2. **Clean up old logs**: Run cleanup function periodically (automated after 90 days)
3. **Update VAPID keys**: Rotate keys every 6-12 months (requires user re-subscription)
4. **Check error rates**: Monitor failed notification counts

### Monitoring Queries

```sql
-- Check notification delivery rate
SELECT
  notification_type,
  COUNT(*) as total,
  SUM(CASE WHEN delivered THEN 1 ELSE 0 END) as delivered,
  ROUND(100.0 * SUM(CASE WHEN delivered THEN 1 ELSE 0 END) / COUNT(*), 2) as delivery_rate
FROM notification_log
WHERE sent_at > NOW() - INTERVAL '7 days'
GROUP BY notification_type;

-- Check active subscriptions
SELECT
  platform,
  COUNT(*) as count
FROM push_subscriptions
WHERE enabled = true
GROUP BY platform;

-- Find users with notifications disabled
SELECT
  u.email,
  np.action_notifications_enabled,
  np.scheduled_notifications_enabled
FROM notification_preferences np
JOIN auth.users u ON u.id = np.user_id
WHERE NOT (np.action_notifications_enabled AND np.scheduled_notifications_enabled);
```

## Resources

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID Protocol](https://datatracker.ietf.org/doc/html/rfc8292)
- [iOS PWA Support](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
