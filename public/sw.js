/**
 * Service Worker for Push Notifications
 *
 * This service worker handles:
 * - Push notification events (receiving notifications)
 * - Notification click events (navigating to app)
 * - Notification close events (tracking)
 */

const APP_URL = self.location.origin;

// Handle push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received', event);

  if (!event.data) {
    console.log('[Service Worker] Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[Service Worker] Push data:', data);

    const { title, body, icon, badge, data: notificationData, tag, requireInteraction } = data;

    const options = {
      body: body || '',
      icon: icon || `${APP_URL}/icon-192.png`,
      badge: badge || `${APP_URL}/icon-192.png`,
      data: notificationData || {},
      tag: tag || 'default',
      requireInteraction: requireInteraction || false,
      vibrate: [200, 100, 200], // Vibration pattern
      actions: notificationData?.conversationId
        ? [
            { action: 'open', title: 'View', icon: `${APP_URL}/icon-192.png` },
            { action: 'close', title: 'Close' },
          ]
        : [],
    };

    event.waitUntil(
      self.registration.showNotification(title || 'Sollu App', options).then(() => {
        // Log notification delivery
        console.log('[Service Worker] Notification shown');
        return logNotificationEvent('delivered', notificationData);
      })
    );
  } catch (error) {
    console.error('[Service Worker] Error handling push event:', error);
  }
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);

  event.notification.close();

  const data = event.notification.data || {};
  const conversationId = data.conversationId;

  // Determine URL to open
  let url = APP_URL;
  if (conversationId) {
    url = `${APP_URL}/conversations/${conversationId}`;
  } else if (data.url) {
    url = data.url;
  }

  // Handle action buttons
  if (event.action === 'close') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to find an existing window and focus it
        for (const client of clientList) {
          if (client.url.startsWith(APP_URL) && 'focus' in client) {
            return client.focus().then((client) => {
              // Navigate to the URL if needed
              if (client.url !== url) {
                return client.navigate(url);
              }
              return client;
            });
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
      .then(() => {
        // Log notification click
        return logNotificationEvent('clicked', data);
      })
  );
});

// Handle notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event);

  const data = event.notification.data || {};
  event.waitUntil(logNotificationEvent('closed', data));
});

// Log notification events (delivery, click, close)
async function logNotificationEvent(eventType, data) {
  try {
    // This would be sent to your backend to update notification_log table
    // For now, we just log it
    console.log(`[Service Worker] Notification ${eventType}:`, data);

    // In a production app, you'd send this to your backend:
    // await fetch(`${APP_URL}/api/notifications/log`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     eventType,
    //     notificationId: data.notificationId,
    //     conversationId: data.conversationId,
    //   }),
    // });
  } catch (error) {
    console.error('[Service Worker] Error logging notification event:', error);
  }
}

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting(); // Activate immediately
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(clients.claim()); // Take control of all clients
});

console.log('[Service Worker] Loaded');
