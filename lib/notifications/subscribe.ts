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
 * Check if running on iOS
 */
function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if running as installed PWA (standalone mode)
 */
function isStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Check if the browser supports push notifications
 */
export function isPushNotificationSupported(): boolean {
  // Check iOS first - iOS Safari doesn't support push notifications unless PWA is installed
  const isIOS = isIOSDevice();
  if (isIOS) {
    // iOS 16.4+ supports push notifications, but only for installed PWAs
    return isStandaloneMode();
  }

  // For other platforms, check standard Web Push API support
  const hasBasicSupport =
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  return hasBasicSupport;
}

/**
 * Get reason why push notifications are not supported (if applicable)
 */
export function getNotSupportedReason(): string | null {
  const isIOS = isIOSDevice();
  const isStandalone = isStandaloneMode();

  // iOS-specific messaging
  if (isIOS) {
    if (!isStandalone) {
      return 'On iOS, push notifications are only available when the app is installed and opened from your home screen. Please tap the Share button and select "Add to Home Screen", then open the app from your home screen.';
    }
    // If iOS and standalone, it should be supported (iOS 16.4+)
    // But if it's not working, might be iOS version issue
    return null;
  }

  // For other platforms, check what's missing
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasPushManager = 'PushManager' in window;
  const hasNotification = 'Notification' in window;

  if (!hasServiceWorker) {
    return 'Service Workers are not supported in your browser.';
  }

  if (!hasPushManager) {
    return 'Push Manager is not supported in your browser.';
  }

  if (!hasNotification) {
    return 'Notifications API is not supported in your browser.';
  }

  return null;
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
    console.log('[SW] Attempting to register service worker at /sw.js');
    
    // Check if service worker file is accessible
    try {
      const response = await fetch('/sw.js', { method: 'HEAD' });
      if (!response.ok) {
        console.error(`[SW] Service worker file not accessible: ${response.status} ${response.statusText}`);
        throw new Error(`Service worker file not accessible: ${response.status} ${response.statusText}`);
      }
      console.log('[SW] Service worker file is accessible');
    } catch (fetchError) {
      console.error('[SW] Error checking service worker file:', fetchError);
      throw new Error(`Cannot access service worker file: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Service worker registered successfully:', {
      scope: registration.scope,
      active: registration.active?.scriptURL,
      installing: registration.installing?.scriptURL,
      waiting: registration.waiting?.scriptURL,
    });

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('[SW] Service worker is ready');

    return registration;
  } catch (error) {
    console.error('[SW] Error registering service worker:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to register service worker: ${errorMessage}`);
  }
}

/**
 * Validate VAPID public key format
 */
function validateVapidKey(key: string): { valid: boolean; error?: string } {
  if (!key || key.trim().length === 0) {
    return { valid: false, error: 'VAPID key is empty' };
  }

  // Remove any whitespace
  const cleanKey = key.trim();

  // VAPID public key should be URL-safe base64 (no padding typically)
  // When decoded, it should be 65 bytes (uncompressed EC public key)
  try {
    const padding = '='.repeat((4 - (cleanKey.length % 4)) % 4);
    const base64 = (cleanKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    
    // EC public key (uncompressed) should be 65 bytes: 0x04 + 32 bytes X + 32 bytes Y
    if (rawData.length !== 65) {
      return {
        valid: false,
        error: `Invalid VAPID key length: expected 65 bytes, got ${rawData.length} bytes. Key length: ${cleanKey.length} chars`,
      };
    }

    // Check first byte is 0x04 (uncompressed point indicator)
    if (rawData.charCodeAt(0) !== 0x04) {
      return {
        valid: false,
        error: `Invalid VAPID key format: first byte should be 0x04 (uncompressed), got 0x${rawData.charCodeAt(0).toString(16)}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid VAPID key format: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  // Remove whitespace
  const cleanKey = base64String.trim();
  
  const padding = '='.repeat((4 - (cleanKey.length % 4)) % 4);
  const base64 = (cleanKey + padding).replace(/\-/g, '+').replace(/_/g, '/');

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

    // Validate VAPID key format
    const validation = validateVapidKey(vapidPublicKey);
    if (!validation.valid) {
      console.error('[Subscribe] Invalid VAPID key:', validation.error);
      console.error('[Subscribe] Key received:', vapidPublicKey.substring(0, 20) + '...');
      throw new Error(`Invalid VAPID public key: ${validation.error}`);
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

    if (!subscriptionJSON.endpoint || !subscriptionJSON.keys?.p256dh || !subscriptionJSON.keys?.auth) {
      throw new Error('Invalid subscription data: missing endpoint or keys');
    }

    const platform = detectPlatform();
    const userAgent = navigator.userAgent;

    console.log('[Subscribe] Saving subscription to database:', {
      userId,
      endpoint: subscriptionJSON.endpoint.substring(0, 50) + '...',
      platform,
    });

    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        endpoint: subscriptionJSON.endpoint,
        keys: {
          p256dh: subscriptionJSON.keys.p256dh,
          auth: subscriptionJSON.keys.auth,
        },
        userAgent,
        platform,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      const errorDetails = errorData.details ? ` - ${errorData.details}` : '';
      throw new Error(`Failed to save push subscription: ${errorMessage}${errorDetails}`);
    }

    const result = await response.json();
    console.log('[Subscribe] Push subscription saved to database successfully:', result);
    return true;
  } catch (error) {
    console.error('[Subscribe] Error saving push subscription:', error);
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
