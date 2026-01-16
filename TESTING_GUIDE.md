# Testing Push Notifications - Complete Guide

## 🎯 Understanding the Notification Flow

### Who Gets Notified When?

| Action | Who is Notified | Who is NOT Notified |
|--------|-----------------|---------------------|
| **Learner submits sentence** | All Admins | The learner who submitted |
| **Admin replies to sentence** | The learner who submitted | The admin who replied |
| **9 AM IST daily** | Learners without progress | Everyone else |

**Important**: You can't test notifications by yourself! You need two accounts:
- One **learner** account
- One **admin** account

---

## ✅ Setup Requirements

### For Both Accounts:
1. ✅ Sign up/Sign in
2. ✅ Enable notifications at `/settings/notifications`
3. ✅ Allow browser permission when prompted
4. ✅ Verify "Push Subscription: Active" shows as green

---

## 🧪 Test Scenario 1: Learner → Admin Notification

### Setup:
- **Browser 1**: Admin account with notifications enabled
- **Browser 2** (or Incognito): Learner account

### Steps:
1. **As Learner** (Browser 2):
   - Go to home page
   - Submit a Tamil sentence using the flashcards

2. **As Admin** (Browser 1):
   - You should receive a notification:
   - Title: "New Sentence Submission"
   - Body: "[learner-email]: [sentence preview]"
   - Click notification → Opens conversation page

### Troubleshooting:
- ❌ **No notification received?**
  - Check admin has notifications enabled
  - Check browser console for errors
  - Check server logs: `tail -f /tmp/claude/.../bd22d3f.output`

---

## 🧪 Test Scenario 2: Admin → Learner Notification

### Setup:
- **Browser 1**: Learner account with notifications enabled
- **Browser 2** (or Incognito): Admin account

### Steps:
1. **As Learner** (Browser 1):
   - Submit a sentence (so there's something for admin to reply to)

2. **As Admin** (Browser 2):
   - Go to `/admin/conversations`
   - Find the learner's sentence
   - Write a Tamil reply
   - Submit

3. **As Learner** (Browser 1):
   - You should receive a notification:
   - Title: "Admin Reply"
   - Body: "[reply preview]"
   - Click notification → Opens conversation page

### Troubleshooting:
- ❌ **No notification received?**
  - Check learner has notifications enabled
  - Check the learner account is the one who submitted the sentence
  - Verify `user_id` in `push_subscriptions` table matches the learner

---

## 🧪 Test Scenario 3: Test Notification (Any User)

### Quick Test (No second account needed):
1. Enable notifications at `/settings/notifications`
2. Visit: `http://localhost:3000/api/notifications/test-send`
3. Should receive notification immediately
4. Check response shows: `"sentCount": 1, "failedCount": 0`

---

## 🔍 Diagnostic Tools

### 1. Test Notifications Page
**URL**: `http://localhost:3000/test-notifications`

Shows:
- Service worker status
- Notification permission
- Push subscription status
- Test buttons

### 2. Configuration Test
**URL**: `http://localhost:3000/api/notifications/test`

Checks:
- Environment variables set
- Database tables exist
- Authentication status

### 3. Send Test Notification
**URL**: `http://localhost:3000/api/notifications/test-send`

Sends a test notification to yourself.

---

## 🗄️ Database Checks

### Check who has notifications enabled:

```sql
-- All users with active subscriptions
SELECT
  u.email,
  ps.platform,
  ps.enabled,
  ps.created_at
FROM auth.users u
JOIN push_subscriptions ps ON ps.user_id = u.id
WHERE ps.enabled = true;

-- Check specific user
SELECT * FROM push_subscriptions
WHERE user_id = 'your-user-id';

-- Check notification preferences
SELECT * FROM notification_preferences
WHERE user_id = 'your-user-id';
```

### Check notification log:

```sql
-- Recent notifications
SELECT
  nl.*,
  u.email as user_email
FROM notification_log nl
JOIN auth.users u ON u.id = nl.user_id
ORDER BY nl.sent_at DESC
LIMIT 20;

-- Notifications for specific user
SELECT * FROM notification_log
WHERE user_id = 'your-user-id'
ORDER BY sent_at DESC;
```

---

## 🐛 Common Issues

### Issue 1: "No subscriptions found for user"
**Cause**: The user doesn't have notifications enabled
**Fix**:
1. Sign in as that user
2. Go to `/settings/notifications`
3. Click "Enable"
4. Allow browser permission

### Issue 2: Notifications not received
**Check**:
1. Service worker registered? → Check `/test-notifications`
2. Permission granted? → Check browser settings
3. Subscription active? → Check `/settings/notifications`
4. Browser allows notifications? → Check system settings

### Issue 3: Wrong user gets notified
**Check**:
- Who submitted the sentence? (Check `conversations` table)
- Who replied? (Learner should get notified, not admin)
- Are you testing with the correct accounts?

### Issue 4: Service worker not receiving push events
**Check**:
1. Open DevTools → Application → Service Workers
2. Verify `sw.js` is registered and active
3. Check Console for service worker logs
4. Try unregistering and re-registering

---

## 📱 Browser-Specific Notes

### Chrome/Edge:
- ✅ Full support
- Service worker shows in DevTools → Application
- Can test on desktop and Android

### Firefox:
- ✅ Full support
- May need to allow notifications in preferences

### Safari:
- ⚠️ Desktop: Limited support
- ✅ iOS 16.4+ PWA: Full support (must install as PWA)

---

## ✅ Success Checklist

Before reporting issues, verify:

- [ ] Database migrations ran successfully
- [ ] VAPID keys are correct (generated with `generate-vapid-keys-proper.js`)
- [ ] Service role key is in `.env.local`
- [ ] Dev server restarted after env changes
- [ ] Both test accounts have notifications enabled
- [ ] Service worker is active (check `/test-notifications`)
- [ ] Tested with correct flow (learner→admin or admin→learner)
- [ ] Checked server logs for errors
- [ ] Checked browser console for errors

---

## 🎬 Step-by-Step Test (Full Flow)

### 1. Prepare Admin Account
```
1. Open Browser 1 (regular window)
2. Sign in as admin
3. Go to /settings/notifications
4. Click "Enable" → Allow permission
5. Verify "Push Subscription: Active"
6. Leave this window open
```

### 2. Prepare Learner Account
```
1. Open Browser 2 (incognito/different browser)
2. Sign up or sign in as learner
3. Go to /settings/notifications
4. Click "Enable" → Allow permission
5. Verify "Push Subscription: Active"
```

### 3. Test Learner → Admin
```
1. In Browser 2 (learner):
   - Go to home page
   - Submit a Tamil sentence

2. In Browser 1 (admin):
   - Wait 2-3 seconds
   - Should receive notification
   - Click notification → Opens conversation
```

### 4. Test Admin → Learner
```
1. In Browser 1 (admin):
   - Go to /admin/conversations
   - Reply to learner's sentence

2. In Browser 2 (learner):
   - Wait 2-3 seconds
   - Should receive notification
   - Click notification → Opens conversation
```

---

## 📊 Expected Results

### When Everything Works:

**Learner submits sentence:**
```
✅ Admin browser: Notification appears
✅ Notification title: "New Sentence Submission"
✅ Notification body: Shows learner email + sentence preview
✅ Click → Opens /conversations/[id]
✅ Server logs: "Sent 1 notifications"
✅ Database: Row in notification_log with delivered=true
```

**Admin replies:**
```
✅ Learner browser: Notification appears
✅ Notification title: "Admin Reply"
✅ Notification body: Shows reply preview
✅ Click → Opens /conversations/[id]
✅ Server logs: "Sent 1 notifications"
✅ Database: Row in notification_log with delivered=true
```

---

## 🆘 Still Not Working?

1. **Check server logs**:
   ```bash
   tail -f /tmp/claude/-Users-sandeepramachandran-sollu-app/tasks/bd22d3f.output
   ```

2. **Check browser console** (F12 → Console tab)

3. **Verify in database**:
   ```sql
   SELECT * FROM push_subscriptions WHERE enabled = true;
   ```

4. **Test direct notification**:
   ```
   Visit: http://localhost:3000/api/notifications/test-send
   ```

5. **Check service worker**:
   ```
   Visit: http://localhost:3000/test-notifications
   ```

---

## 📝 Notes

- Notifications are sent asynchronously (may take 1-2 seconds)
- Browser must have focus to show notification immediately
- If browser is closed, notifications queue and show when reopened
- Service worker must be active (auto-activates when page loads)
- Can't test alone - need two separate accounts

---

**Last Updated**: Testing guide for push notification implementation
