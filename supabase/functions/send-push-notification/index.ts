/**
 * Supabase Edge Function: Send Push Notification
 *
 * This function sends push notifications to specific users.
 * It accepts a notification payload and user ID(s), retrieves their subscriptions,
 * and sends the push notifications.
 *
 * Deploy: supabase functions deploy send-push-notification
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface NotificationPayload {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  tag?: string;
  requireInteraction?: boolean;
  conversationId?: string;
  notificationType?: 'action_triggered' | 'scheduled';
}

interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  enabled: boolean;
}

// VAPID configuration
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@sollu.app';

// Supabase configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Parse request body
    const payload: NotificationPayload = await req.json();

    // Validate payload
    if (!payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title and body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate user IDs
    const userIds = payload.userId ? [payload.userId] : payload.userIds || [];
    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or userIds' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch subscriptions for users
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)
      .eq('enabled', true);

    if (subscriptionError) {
      console.error('Error fetching subscriptions:', subscriptionError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No subscriptions found',
          sentCount: 0,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare notification payload
    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      data: payload.data || {},
      tag: payload.tag || 'default',
      requireInteraction: payload.requireInteraction || false,
    };

    // Send push notifications
    let sentCount = 0;
    let failedCount = 0;
    const expiredEndpoints: string[] = [];

    for (const subscription of subscriptions as PushSubscription[]) {
      try {
        const result = await sendWebPush(subscription, notificationPayload);

        if (result.success) {
          sentCount++;
        } else {
          failedCount++;
          if (result.expired) {
            expiredEndpoints.push(subscription.endpoint);
          }
        }
      } catch (error) {
        console.error('Error sending push to subscription:', error);
        failedCount++;
      }
    }

    // Remove expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
    }

    // Log notifications
    for (const userId of userIds) {
      await supabase.from('notification_log').insert({
        user_id: userId,
        notification_type: payload.notificationType || 'action_triggered',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        conversation_id: payload.conversationId || null,
        delivered: sentCount > 0,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        failedCount,
        totalSubscriptions: subscriptions.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Send web push notification using Web Push Protocol
 */
async function sendWebPush(
  subscription: PushSubscription,
  payload: unknown
): Promise<{ success: boolean; expired?: boolean }> {
  try {
    // In a real implementation, you would use the Web Push Protocol
    // For Deno, you might need to use a library or implement the protocol manually
    // This is a simplified version that demonstrates the structure

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    // Note: You'll need to implement the actual Web Push Protocol here
    // or use a Deno-compatible Web Push library
    // For now, this is a placeholder that logs the action

    console.log('Sending push to:', subscription.endpoint);
    console.log('Payload:', payload);

    // TODO: Implement actual Web Push Protocol
    // This would involve:
    // 1. Generating JWT with VAPID keys
    // 2. Encrypting the payload
    // 3. Sending POST request to the endpoint
    // 4. Handling response codes (201 = success, 404/410 = expired)

    return { success: true };
  } catch (error) {
    console.error('Error in sendWebPush:', error);

    // Check if subscription is expired (HTTP 404 or 410)
    if (error.status === 404 || error.status === 410) {
      return { success: false, expired: true };
    }

    return { success: false };
  }
}
