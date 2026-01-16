/**
 * API Route: Send Push Notification
 *
 * This route sends push notifications to specific users or admins.
 * It uses the server-side notification service to handle the actual sending.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  sendNotificationToUser,
  sendNotificationToUsers,
  sendNotificationToAdmins,
} from '@/lib/notifications/service';
import type { NotificationTemplate } from '@/lib/notifications/templates';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      userId,
      userIds,
      sendToAdmins,
      title,
      body: notificationBody,
      icon,
      badge,
      data,
      tag,
      requireInteraction,
      notificationType = 'action_triggered',
      conversationId,
    } = body;

    // Validate payload
    if (!title || !notificationBody) {
      return NextResponse.json(
        { error: 'Missing required fields: title and body' },
        { status: 400 }
      );
    }

    // Create notification template
    const template: NotificationTemplate = {
      title,
      body: notificationBody,
      icon,
      badge,
      data: data || {},
      tag: tag || 'default',
      requireInteraction: requireInteraction || false,
    };

    let result;

    if (sendToAdmins) {
      // Send to all admins
      result = await sendNotificationToAdmins(template, conversationId);
    } else if (userId) {
      // Send to a single user
      result = await sendNotificationToUser(
        userId,
        template,
        notificationType,
        conversationId
      );
    } else if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      // Send to multiple users
      const multiResult = await sendNotificationToUsers(
        userIds,
        template,
        notificationType,
        conversationId
      );
      result = {
        success: multiResult.success,
        sentCount: multiResult.totalSent,
        failedCount: multiResult.totalFailed,
      };
    } else {
      return NextResponse.json(
        { error: 'Must specify userId, userIds, or sendToAdmins' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: result.success,
      sentCount: result.sentCount,
      failedCount: result.failedCount,
    });
  } catch (error) {
    console.error('Error in send notification API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
