# Push Notification System for PWA

## Overview

Build a push notification system for the PWA that sends:
1. **Action-triggered notifications**: When learners submit sentences (admin notified) and when admins reply (learner notified)
2. **Scheduled notifications**: Daily reminders at 9 AM IST for learners to complete words

## Platform Support

- **Android**: Full Web Push API support
- **iOS**: Web Push API support (iOS 16.4+ for PWAs)
- **Web/Desktop**: Full support

## Database Changes

### 1. Migration: Create push subscriptions table
**File:** `supabase/migrations/009_push_subscriptions.sql`

Create `push_subscriptions` table:
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `endpoint` (TEXT) - Web Push endpoint URL
- `p256dh` (TEXT) - Public key for encryption
- `auth` (TEXT) - Auth secret for encryption
- `user_agent` (TEXT) - Browser/device info
- `platform` (TEXT) - 'ios', 'android', 'web', 'desktop'
- `enabled` (BOOLEAN) - User preference to receive notifications
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- Unique constraint on (user_id, endpoint)

RLS Policies:
- Users can insert/select/update/delete their own subscriptions
- Admins can read all subscriptions (for debugging)

### 2. Migration: Create notification preferences table
**File:** `supabase/migrations/010_notification_preferences.sql`

Create `notification_preferences` table:
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users, unique)
- `action_notifications_enabled` (BOOLEAN, default true) - Action-triggered notifications
- `scheduled_notifications_enabled` (BOOLEAN, default true) - Daily reminders
- `scheduled_time` (TIME, default '09:00:00') - Time for scheduled notifications (IST)
- `timezone` (TEXT, default 'Asia/Kolkata') - User timezone
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

RLS Policies:
- Users can read/update their own preferences
- System can read preferences for sending notifications

### 3. Migration: Create notification log table (optional, for analytics)
**File:** `supabase/migrations/011_notification_log.sql`

Create `notification_log` table:
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `notification_type` (ENUM: 'action_triggered', 'scheduled')
- `title` (TEXT)
- `body` (TEXT)
- `data` (JSONB) - Additional notification data
- `sent_at` (TIMESTAMP)
- `delivered` (BOOLEAN) - Whether notification was delivered
- `clicked` (BOOLEAN) - Whether user clicked notification
- `conversation_id` (UUID, nullable) - Link to conversation if applicable

## Backend Infrastructure

### 4. Create Supabase Edge Function for sending notifications
**File:** `supabase/functions/send-push-notification/index.ts`

Edge function that:
- Accepts notification payload (user_id, title, body, data)
- Retrieves user's push subscriptions from database
- Sends Web Push notification to all user's devices
- Handles VAPID keys for authentication
- Logs notification delivery
- Returns success/failure status

### 5. Create Supabase Edge Function for scheduled notifications
**File:** `supabase/functions/send-daily-reminders/index.ts`

Edge function that:
- Runs via Supabase Cron or external cron trigger
- Queries all learners with scheduled notifications enabled
- Checks if they've completed words today
- Sends reminder notification to those who haven't
- Runs at 9 AM IST daily

### 6. Create notification service utilities
**File:** `lib/notifications/service.ts`

Server-side utilities:
- `sendNotification(userId, title, body, data)` - Send action-triggered notification
- `sendDailyReminders()` - Trigger scheduled notifications
- `getUserSubscriptions(userId)` - Get user's push subscriptions
- `validateSubscription(subscription)` - Validate push subscription

### 7. Create VAPID key management
**File:** `lib/notifications/vapid.ts`

VAPID key utilities:
- Generate/load VAPID keys
- Store in Supabase secrets or environment variables
- Use for Web Push authentication

## Frontend Changes

### 8. Create service worker for push notifications
**File:** `public/sw.js` or `app/sw.js`

Service worker that:
- Handles push event (receives notifications)
- Shows notification with title, body, icon
- Handles notification click (navigate to app/conversation)
- Handles notification close
- Manages notification display

### 9. Create push notification subscription manager
**File:** `lib/notifications/subscribe.ts`

Client-side utilities:
- `requestPermission()` - Request notification permission
- `subscribeToPush()` - Create push subscription
- `saveSubscription(userId, subscription)` - Save to database
- `unsubscribe(userId)` - Remove subscription
- `isSupported()` - Check if browser supports Web Push

### 10. Create NotificationPermission component
**File:** `components/NotificationPermission.tsx`

Component that:
- Requests notification permission on signup
- Shows permission prompt with explanation
- Handles permission grant/deny
- Saves subscription to database
- Shows permission status

### 11. Update signup flow
**File:** `app/signup/page.tsx` or `components/SignUpForm.tsx`

Changes:
- After successful signup, request notification permission
- Show NotificationPermission component
- Save subscription if granted

### 12. Update conversation actions
**File:** `app/actions/conversations.ts`

Modify `submitLearnerSentence`:
- After successful submission, send notification to all admins
- Notification: "New sentence from [learner email]: [sentence preview]"
- Include conversation_id in notification data

Modify `replyToConversation`:
- After admin replies, send notification to learner
- Notification: "Admin replied to your sentence: [reply preview]"
- Include conversation_id in notification data

### 13. Create notification settings page
**File:** `app/settings/notifications/page.tsx`

Settings page where users can:
- Enable/disable action notifications
- Enable/disable scheduled notifications
- View notification history (optional)
- Test notification

## Scheduled Job Setup

### 14. Configure Supabase Cron or Vercel Cron
**Option A: Supabase Cron (Recommended)**
- Use Supabase's pg_cron extension
- Schedule function to run daily at 9 AM IST
- Call Edge Function for sending reminders

**Option B: Vercel Cron Jobs**
- Create API route: `app/api/cron/daily-reminders/route.ts`
- Configure in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/daily-reminders",
    "schedule": "0 3 * * *" // 9 AM IST = 3:30 AM UTC (adjust for IST)
  }]
}
```

### 15. Create daily reminders API route
**File:** `app/api/cron/daily-reminders/route.ts`

API route that:
- Verifies cron secret (security)
- Calls notification service to send daily reminders
- Returns status

## Notification Content

### 16. Define notification templates
**File:** `lib/notifications/templates.ts`

Templates for:
- **Learner submission**: "New sentence from [email]: [sentence preview]"
- **Admin reply**: "Admin replied: [reply preview]"
- **Daily reminder**: "Good morning! Time to learn Tamil. Complete your words for today! 📚"

## Integration Points

### 17. Update conversation flow
- After learner submits sentence → Trigger admin notification
- After admin replies → Trigger learner notification
- Include conversation context in notification data

### 18. Add notification badge/indicator
**File:** `components/NotificationBadge.tsx`

Component showing:
- Unread notification count
- Notification icon in header
- Click to view notifications

## Security & Best Practices

### 19. VAPID Key Security
- Store VAPID keys in Supabase secrets or environment variables
- Never expose private key to client
- Use HTTPS for all push endpoints

### 20. Rate Limiting
- Limit notification frequency per user
- Prevent spam/abuse
- Implement exponential backoff for failures

### 21. Error Handling
- Handle subscription failures gracefully
- Clean up invalid subscriptions
- Log errors for debugging

## Testing Strategy

### 22. Test notification flow
- Test permission request
- Test subscription creation
- Test notification sending
- Test notification click handling
- Test on iOS and Android devices

### 23. Test scheduled notifications
- Test cron job execution
- Test IST timezone handling
- Test notification delivery
- Test user preferences (enabled/disabled)

## Implementation Phases

### Phase 1: Foundation
1. Create database tables (subscriptions, preferences, log)
2. Set up VAPID keys
3. Create service worker
4. Implement subscription management

### Phase 2: Action-Triggered Notifications
1. Integrate with conversation actions
2. Create notification sending service
3. Test learner → admin flow
4. Test admin → learner flow

### Phase 3: Scheduled Notifications
1. Set up cron job
2. Create daily reminder function
3. Test scheduled delivery
4. Handle timezone (IST)

### Phase 4: Polish & Settings
1. Create notification settings page
2. Add notification preferences UI
3. Add notification history (optional)
4. Error handling and edge cases

## Dependencies

Install required packages:
- `web-push` - For sending Web Push notifications (server-side)
- Service worker registration (built into browsers)

## Environment Variables

Add to `.env.local` and Vercel:
- `VAPID_PUBLIC_KEY` - Public VAPID key (can be exposed)
- `VAPID_PRIVATE_KEY` - Private VAPID key (server-only)
- `VAPID_SUBJECT` - VAPID subject (usually your app URL)
- `CRON_SECRET` - Secret for securing cron endpoints (optional)

## iOS Considerations

- iOS 16.4+ supports Web Push for PWAs
- For older iOS: Fallback to in-app notifications or email
- Test on actual iOS device (simulator may not support)

## Notification Payload Structure

```typescript
interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: {
    conversationId?: string
    type: 'learner_submission' | 'admin_reply' | 'daily_reminder'
    url?: string
  }
  tag?: string // For grouping notifications
  requireInteraction?: boolean
}
```

## Data Flow

### Action-Triggered Flow:
```
Learner submits sentence
  ↓
submitLearnerSentence() action
  ↓
Save to database
  ↓
Call sendNotification() service
  ↓
Query all admin subscriptions
  ↓
Send push notification via Edge Function
  ↓
Service worker receives push
  ↓
Show notification to admin
```

### Scheduled Flow:
```
Cron job triggers at 9 AM IST
  ↓
Call sendDailyReminders() function
  ↓
Query learners with scheduled notifications enabled
  ↓
Check if they've completed words today
  ↓
Send reminder to those who haven't
  ↓
Service worker receives push
  ↓
Show notification to learner
```

## Todo List

1. **db_push_subscriptions** - Create push_subscriptions table with RLS policies
2. **db_notification_preferences** - Create notification_preferences table for user settings
3. **db_notification_log** - Create notification_log table for analytics (optional)
4. **vapid_setup** - Set up VAPID keys and store in environment variables
5. **service_worker** - Create service worker for handling push notifications and showing notifications
6. **subscription_manager** - Create client-side subscription manager (request permission, subscribe, save) (depends on: service_worker)
7. **notification_permission_component** - Create NotificationPermission component for signup flow (depends on: subscription_manager)
8. **update_signup** - Integrate notification permission request into signup flow (depends on: notification_permission_component)
9. **notification_service** - Create server-side notification service utilities (depends on: vapid_setup, db_push_subscriptions)
10. **supabase_edge_function** - Create Supabase Edge Function for sending push notifications (depends on: notification_service)
11. **update_conversation_actions** - Integrate notification sending into submitLearnerSentence and replyToConversation (depends on: supabase_edge_function)
12. **scheduled_function** - Create Supabase Edge Function for daily reminders (depends on: notification_service)
13. **cron_setup** - Set up cron job (Supabase Cron or Vercel Cron) for 9 AM IST daily reminders (depends on: scheduled_function)
14. **notification_templates** - Create notification message templates
15. **notification_settings** - Create notification settings page for user preferences (depends on: db_notification_preferences)
16. **notification_badge** - Add notification badge/indicator component (optional)
