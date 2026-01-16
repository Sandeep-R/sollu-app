# Push Notification Diagnostic Checklist

Please provide the following information to help diagnose the issue:

## 1. Browser Console Logs
- Open DevTools (F12) → Console tab
- Refresh the page
- Copy ALL console messages (especially ones starting with 🔵, ✅, ❌, or [SW Registration])
- Include any red error messages

## 2. Service Worker Status
- Open DevTools → Application tab → Service Workers (left sidebar)
- Take a screenshot or tell me:
  - Is `/sw.js` registered?
  - What is the status? (activated, installing, etc.)
  - Any error messages?

## 3. Service Worker File Access
- Visit: `https://your-app.vercel.app/sw.js` directly in your browser
- What do you see?
  - [ ] JavaScript code (good!)
  - [ ] 404 Not Found
  - [ ] Redirect to login
  - [ ] Blank page
  - [ ] Other error

## 4. Debug Endpoint
- Visit: `https://your-app.vercel.app/api/notifications/debug`
- Copy the entire JSON response

## 5. Debug Page
- Visit: `https://your-app.vercel.app/debug-sw`
- What do you see on the page?
- Copy any error messages or status information shown

## 6. Network Tab
- Open DevTools → Network tab
- Refresh the page
- Look for `/sw.js` request
- What is the status code?
  - [ ] 200 OK
  - [ ] 404 Not Found
  - [ ] 401 Unauthorized
  - [ ] Other: _______
- What are the response headers? (especially Content-Type)

## 7. Environment Variables
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Verify these are set (don't share the actual values, just confirm they exist):
  - [ ] NEXT_PUBLIC_VAPID_PUBLIC_KEY
  - [ ] VAPID_PRIVATE_KEY
  - [ ] VAPID_SUBJECT

## 8. Browser & Device Info
- Browser: (Chrome, Safari, Firefox, etc.)
- Version: _______
- Device: (Desktop, iPhone, Android, etc.)
- OS: _______
- Is it working locally? (Yes/No)

## 9. What Happens When You Try to Enable Notifications?
- Go to the notification setup page
- Click "Enable Notifications"
- What error message do you see? (if any)
- Copy the exact error message

## 10. Vercel Deployment Logs
- Go to Vercel Dashboard → Your Project → Deployments → Latest Deployment → Logs
- Look for any errors related to:
  - Service worker
  - Push notifications
  - Build errors
- Copy any relevant error messages

---

**Please provide as much of this information as possible. The more details you give, the faster I can fix it!**
