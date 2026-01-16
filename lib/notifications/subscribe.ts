/**
 * Client-side Push Notification Subscription Manager
 *
 * Handles:
 * - Requesting notification permission
 * - Creating push subscriptions
 * - Saving subscriptions to database
 * - Unsubscribing from notifications
 * - Checking browser support
 */

import { getPublicVapidKey } from './vapid';

/**
 * Check if the browser supports push notifications
 */
export function isPushNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

/**
 * Check if notifications are enabled (permission granted)
 */
export function areNotificationsEnabled(): boolean {
  return getNotificationPermission() === 'granted';
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported in this browser');
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    throw error;
  }
}

/**
 * Register service worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser');
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service worker registered:', registration);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error('Error registering service worker:', error);
    throw error;
  }
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported in this browser');
  }

  try {
    // Get or register service worker
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await registerServiceWorker();
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      console.log('Already subscribed to push notifications');
      return subscription;
    }

    // Get VAPID public key
    const vapidPublicKey = getPublicVapidKey();
    if (!vapidPublicKey) {
      throw new Error('VAPID public key is not configured');
    }

    // Subscribe to push notifications
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('Subscribed to push notifications:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return false;
    }

    const successful = await subscription.unsubscribe();
    console.log('Unsubscribed from push notifications:', successful);
    return successful;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    throw error;
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return null;
    }

    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
}

/**
 * Save push subscription to database
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<boolean> {
  try {
    const subscriptionJSON = subscription.toJSON();

    const platform = detectPlatform();
    const userAgent = navigator.userAgent;

    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        endpoint: subscriptionJSON.endpoint,
        keys: {
          p256dh: subscriptionJSON.keys?.p256dh,
          auth: subscriptionJSON.keys?.auth,
        },
        userAgent,
        platform,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save push subscription');
    }

    console.log('Push subscription saved to database');
    return true;
  } catch (error) {
    console.error('Error saving push subscription:', error);
    throw error;
  }
}

/**
 * Remove push subscription from database
 */
export async function removePushSubscription(userId: string, endpoint: string): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        endpoint,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove push subscription');
    }

    console.log('Push subscription removed from database');
    return true;
  } catch (error) {
    console.error('Error removing push subscription:', error);
    throw error;
  }
}

/**
 * Detect user's platform
 */
function detectPlatform(): 'ios' | 'android' | 'web' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase();

  // Check if running as PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return isStandalone ? 'ios' : 'web';
  }

  if (/android/.test(userAgent)) {
    return isStandalone ? 'android' : 'web';
  }

  // Desktop PWA or regular web
  return isStandalone ? 'desktop' : 'web';
}

/**
 * Complete flow: Request permission, subscribe, and save to database
 */
export async function setupPushNotifications(userId: string): Promise<{
  success: boolean;
  permission: NotificationPermission;
  subscription?: PushSubscription;
  error?: string;
}> {
  try {
    console.log('[Subscribe] Starting setup for user:', userId);

    // Check if supported
    if (!isPushNotificationSupported()) {
      console.log('[Subscribe] Push notifications not supported');
      return {
        success: false,
        permission: 'default',
        error: 'Push notifications are not supported in this browser',
      };
    }

    console.log('[Subscribe] Browser supports push notifications');

    // Request permission
    console.log('[Subscribe] Requesting permission...');
    const permission = await requestNotificationPermission();
    console.log('[Subscribe] Permission result:', permission);

    if (permission !== 'granted') {
      return {
        success: false,
        permission,
        error: 'Notification permission denied',
      };
    }

    // Subscribe to push notifications
    console.log('[Subscribe] Creating push subscription...');
    const subscription = await subscribeToPushNotifications();
    console.log('[Subscribe] Subscription created:', !!subscription);

    if (!subscription) {
      return {
        success: false,
        permission,
        error: 'Failed to create push subscription',
      };
    }

    // Save to database
    console.log('[Subscribe] Saving subscription to database...');
    await savePushSubscription(userId, subscription);
    console.log('[Subscribe] Subscription saved successfully!');

    return {
      success: true,
      permission,
      subscription,
    };
  } catch (error) {
    console.error('[Subscribe] Error setting up push notifications:', error);
    return {
      success: false,
      permission: getNotificationPermission(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
