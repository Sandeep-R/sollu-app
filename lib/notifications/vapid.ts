/**
 * VAPID Key Management
 *
 * VAPID (Voluntary Application Server Identification) keys are used to authenticate
 * push notifications from your server to the push service.
 *
 * Generate keys using web-push library:
 * npx web-push generate-vapid-keys
 *
 * Then add them to your environment variables:
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY (safe to expose to client)
 * - VAPID_PRIVATE_KEY (server-only, keep secret)
 * - VAPID_SUBJECT (mailto:your-email@domain.com or your website URL)
 */

// Public key (safe to expose to client)
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

// Private key (server-only, never expose to client)
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

// Subject (mailto: or website URL)
export const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@sollu.app';

/**
 * Validate that VAPID keys are configured
 */
export function validateVapidKeys(): { valid: boolean; error?: string } {
  if (!VAPID_PUBLIC_KEY) {
    return { valid: false, error: 'VAPID_PUBLIC_KEY is not configured' };
  }

  if (!VAPID_PRIVATE_KEY) {
    return { valid: false, error: 'VAPID_PRIVATE_KEY is not configured' };
  }

  if (!VAPID_SUBJECT) {
    return { valid: false, error: 'VAPID_SUBJECT is not configured' };
  }

  return { valid: true };
}

/**
 * Get VAPID configuration for server-side use
 * Only use this on the server side!
 */
export function getVapidConfig() {
  return {
    publicKey: VAPID_PUBLIC_KEY,
    privateKey: VAPID_PRIVATE_KEY,
    subject: VAPID_SUBJECT,
  };
}

/**
 * Get public VAPID key for client-side use
 * This is safe to expose to the client
 */
export function getPublicVapidKey() {
  return VAPID_PUBLIC_KEY;
}
