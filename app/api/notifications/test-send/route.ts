import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendNotificationToUser } from '@/lib/notifications/service';
import { createNotification } from '@/lib/notifications/templates';

/**
 * Test endpoint to send a test notification to yourself
 * Visit: http://localhost:3000/api/notifications/test-send
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user has subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('enabled', true);

    if (subError) {
      return NextResponse.json(
        { error: 'Failed to check subscriptions', details: subError.message },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        error: 'No active subscriptions found',
        message: 'Please enable notifications first at /settings/notifications',
        userId: user.id,
        email: user.email,
      });
    }

    // Create test notification
    const template = createNotification(
      'Test Notification',
      'This is a test notification from Sollu! If you see this, push notifications are working! 🎉',
      {
        tag: 'test',
        data: { type: 'test', url: '/' },
      }
    );

    // Send notification
    const result = await sendNotificationToUser(
      user.id,
      template,
      'action_triggered'
    );

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? '✅ Test notification sent! Check your browser for the notification.'
        : '❌ Failed to send notification',
      details: {
        userId: user.id,
        email: user.email,
        subscriptions: subscriptions.length,
        sentCount: result.sentCount,
        failedCount: result.failedCount,
      },
    });
  } catch (error) {
    console.error('Error in test-send:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
