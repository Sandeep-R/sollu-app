# Push Notifications

This section can be added to your main README.md file.

---

## 🔔 Push Notifications

The app includes a complete push notification system for iOS and Android PWAs.

### Features

- ✅ **Action-triggered notifications**: Get notified when admins reply to your sentences
- ✅ **Daily reminders**: Receive reminders at 9 AM IST to complete your daily lessons
- ✅ **Customizable settings**: Control which notifications you receive
- ✅ **Cross-platform**: Works on iOS 16.4+, Android, and Desktop

### User Guide

#### Enabling Notifications

1. **During Signup**: After creating an account, you'll be prompted to enable notifications
2. **Later**: Go to Settings > Notifications to enable/disable anytime

#### Managing Preferences

Visit `/settings/notifications` to:
- Enable/disable action notifications (admin replies)
- Enable/disable daily reminders
- Manage your notification subscriptions

#### Platform Support

| Platform | Supported | Notes |
|----------|-----------|-------|
| iOS 16.4+ | ✅ | Must install as PWA (Add to Home Screen) |
| Android | ✅ | Works in browser and as PWA |
| Desktop | ✅ | Chrome, Edge, Firefox |

### For Developers

#### Setup

1. Run database migrations:
   ```bash
   supabase db push
   ```

2. Configure environment variables:
   ```bash
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   VAPID_SUBJECT=mailto:admin@yourdomain.com
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Deploy to Vercel with cron job enabled

#### Documentation

- **[PUSH_NOTIFICATIONS_SUMMARY.md](./PUSH_NOTIFICATIONS_SUMMARY.md)** - Quick overview
- **[PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md)** - Complete documentation
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Deployment guide

#### Architecture

```
┌─────────────┐
│   Client    │
│   (PWA)     │
└──────┬──────┘
       │ Subscribe
       ▼
┌─────────────┐     ┌──────────────┐
│  Service    │────▶│  Push        │
│  Worker     │◀────│  Subscription│
└──────┬──────┘     └──────────────┘
       │ Display
       ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ Notification│◀────│  Server      │────▶│  Database    │
│  (Browser)  │     │  (Next.js)   │     │  (Supabase)  │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Web Push    │
                    │  API         │
                    └──────────────┘
```

#### Notification Flow

**Learner submits sentence:**
1. Sentence saved to database
2. Server fetches all admin subscriptions
3. Notification sent via Web Push API
4. Admins receive push notification
5. Click opens conversation

**Admin replies:**
1. Reply saved to database
2. Server fetches learner's subscriptions
3. Notification sent via Web Push API
4. Learner receives push notification
5. Click opens conversation

**Daily reminder (9 AM IST):**
1. Cron job triggers at 9 AM IST
2. Server queries learners without progress today
3. Notifications sent to eligible learners
4. Learners receive reminder
5. Click opens word list

#### Testing

```bash
# Test locally
npm run dev

# Test cron job manually
curl -X POST http://localhost:3000/api/cron/daily-reminders

# Check subscriptions in DB
SELECT * FROM push_subscriptions WHERE enabled = true;
```

### Troubleshooting

**Notifications not working?**

1. Check browser support (iOS 16.4+, modern browsers)
2. Verify notification permission granted
3. Ensure service worker registered
4. Check environment variables set correctly
5. Verify database migrations ran

**Need help?** See [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md) for detailed troubleshooting.

---
