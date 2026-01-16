/**
 * Server-side Notification Service
 *
 * Handles sending push notifications to users via Web Push API
 */

import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import { getVapidConfig } from './vapid';
import type { NotificationTemplate } from './templates';

// Initialize Supabase client with service role for server-side operations
function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
  }

  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY environment variable is not set. ' +
      'Please add it to your Vercel project settings → Environment Variables. ' +
      'You can find it in your Supabase project settings → API → service_role key (secret)'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Configure web-push with VAPID keys
function configureWebPush() {
  const { publicKey, privateKey, subject } = getVapidConfig();

  if (!publicKey || !privateKey || !subject) {
    throw new Error('VAPID keys are not configured');
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

/**
 * Get all push subscriptions for a user
 */
export async function getUserSubscriptions(userId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('enabled', true);

  if (error) {
    console.error('Error fetching user subscriptions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get notification preferences for a user
 */
export async function getUserNotificationPreferences(userId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching notification preferences:', error);
    return null;
  }

  return data;
}

/**
 * Check if user has enabled specific notification type
 */
export async function isNotificationTypeEnabled(
  userId: string,
  type: 'action' | 'scheduled'
): Promise<boolean> {
  const preferences = await getUserNotificationPreferences(userId);

  if (!preferences) {
    return true; // Default to enabled if no preferences found
  }

  if (type === 'action') {
    return preferences.action_notifications_enabled;
  } else {
    return preferences.scheduled_notifications_enabled;
  }
}

/**
 * Send push notification to a specific subscription
 */
async function sendPushToSubscription(
  subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
  },
  payload: NotificationTemplate
): Promise<{ success: boolean; error?: string }> {
  try {
    configureWebPush();

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload),
      {
        TTL: 3600, // Time to live: 1 hour
      }
    );

    return { success: true };
  } catch (error: unknown) {
    console.error('Error sending push notification:', error);

    // Check if subscription is expired or invalid
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        // Subscription is no longer valid, should be removed
        return {
          success: false,
          error: 'subscription_expired',
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Log notification to database
 */
async function logNotification(
  userId: string,
  notificationType: 'action_triggered' | 'scheduled',
  template: NotificationTemplate,
  delivered: boolean,
  conversationId?: string
) {
  const supabase = getSupabaseServiceClient();

  const { error } = await supabase.from('notification_log').insert({
    user_id: userId,
    notification_type: notificationType,
    title: template.title,
    body: template.body,
    data: template.data || {},
    conversation_id: conversationId || null,
    delivered,
    clicked: false,
  });

  if (error) {
    console.error('Error logging notification:', error);
  }
}

/**
 * Remove expired subscription from database
 */
async function removeSubscription(endpoint: string) {
  const supabase = getSupabaseServiceClient();

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);

  if (error) {
    console.error('Error removing expired subscription:', error);
  }
}

/**
 * Send notification to a specific user
 */
export async function sendNotificationToUser(
  userId: string,
  template: NotificationTemplate,
  notificationType: 'action_triggered' | 'scheduled' = 'action_triggered',
  conversationId?: string
): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
  try {
    console.log(`📤 [SERVICE] sendNotificationToUser called for user: ${userId}, type: ${notificationType}`);

    // Check if user has enabled this notification type
    const isEnabled = await isNotificationTypeEnabled(
      userId,
      notificationType === 'action_triggered' ? 'action' : 'scheduled'
    );

    console.log(`📤 [SERVICE] Notification type enabled: ${isEnabled}`);

    if (!isEnabled) {
      console.log(`⚠️ [SERVICE] Notifications of type ${notificationType} disabled for user ${userId}`);
      return { success: true, sentCount: 0, failedCount: 0 };
    }

    // Get user's subscriptions
    const subscriptions = await getUserSubscriptions(userId);

    console.log(`📤 [SERVICE] Found ${subscriptions.length} subscriptions for user ${userId}`);

    if (subscriptions.length === 0) {
      console.log(`⚠️ [SERVICE] No subscriptions found for user ${userId}`);
      return { success: true, sentCount: 0, failedCount: 0 };
    }

    let sentCount = 0;
    let failedCount = 0;

    // Send to all user's devices
    for (const subscription of subscriptions) {
      console.log(`📤 [SERVICE] Sending to subscription endpoint: ${subscription.endpoint.substring(0, 50)}...`);
      const result = await sendPushToSubscription(subscription, template);

      if (result.success) {
        console.log(`✅ [SERVICE] Successfully sent to subscription`);
        sentCount++;
      } else {
        console.log(`❌ [SERVICE] Failed to send to subscription:`, result.error);
        failedCount++;

        // Remove expired subscriptions
        if (result.error === 'subscription_expired') {
          await removeSubscription(subscription.endpoint);
        }
      }
    }

    console.log(`📤 [SERVICE] Final result: sent=${sentCount}, failed=${failedCount}`);

    // Log notification
    await logNotification(
      userId,
      notificationType,
      template,
      sentCount > 0,
      conversationId
    );

    return {
      success: sentCount > 0,
      sentCount,
      failedCount,
    };
  } catch (error) {
    console.error('Error sending notification to user:', error);
    throw error;
  }
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToUsers(
  userIds: string[],
  template: NotificationTemplate,
  notificationType: 'action_triggered' | 'scheduled' = 'action_triggered',
  conversationId?: string
): Promise<{
  success: boolean;
  totalSent: number;
  totalFailed: number;
  userResults: Array<{ userId: string; sent: number; failed: number }>;
}> {
  const results = await Promise.all(
    userIds.map(async (userId) => {
      const result = await sendNotificationToUser(
        userId,
        template,
        notificationType,
        conversationId
      );
      return {
        userId,
        sent: result.sentCount,
        failed: result.failedCount,
      };
    })
  );

  const totalSent = results.reduce((sum, r) => sum + r.sent, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

  return {
    success: totalSent > 0,
    totalSent,
    totalFailed,
    userResults: results,
  };
}

/**
 * Send notification to all admins
 */
export async function sendNotificationToAdmins(
  template: NotificationTemplate,
  conversationId?: string
): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
  console.log(`👥 [SERVICE] sendNotificationToAdmins called`);
  const supabase = getSupabaseServiceClient();

  // Get all admin user IDs
  const { data: admins, error } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');

  if (error || !admins || admins.length === 0) {
    console.error('❌ [SERVICE] Error fetching admins:', error);
    return { success: false, sentCount: 0, failedCount: 0 };
  }

  console.log(`👥 [SERVICE] Found ${admins.length} admins:`, admins.map(a => a.user_id));

  const adminIds = admins.map((admin) => admin.user_id);

  const results = await sendNotificationToUsers(
    adminIds,
    template,
    'action_triggered',
    conversationId
  );

  console.log(`👥 [SERVICE] Admin notification results:`, results);

  return {
    success: results.success,
    sentCount: results.totalSent,
    failedCount: results.totalFailed,
  };
}

/**
 * Get all learners who haven't completed words today and have scheduled notifications enabled
 */
export async function getLearnersForDailyReminder() {
  const supabase = getSupabaseServiceClient();

  // Get learners with scheduled notifications enabled
  const { data: preferences, error: preferencesError } = await supabase
    .from('notification_preferences')
    .select('user_id')
    .eq('scheduled_notifications_enabled', true);

  if (preferencesError || !preferences) {
    console.error('Error fetching notification preferences:', preferencesError);
    return [];
  }

  const userIds = preferences.map((p) => p.user_id);

  if (userIds.length === 0) {
    return [];
  }

  // Check which users haven't completed words today
  // This is a simplified version - you may want to add more sophisticated logic
  const today = new Date().toISOString().split('T')[0];

  const { data: progress, error: progressError } = await supabase
    .from('user_word_progress')
    .select('user_id')
    .in('user_id', userIds)
    .gte('updated_at', today);

  if (progressError) {
    console.error('Error fetching user progress:', progressError);
    return userIds; // Send to all if we can't determine progress
  }

  // Get users who have made progress today
  const usersWithProgressToday = new Set(progress?.map((p) => p.user_id) || []);

  // Return users who haven't made progress today
  return userIds.filter((userId) => !usersWithProgressToday.has(userId));
}
