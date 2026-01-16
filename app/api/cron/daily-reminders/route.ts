/**
 * API Route: Daily Reminders Cron Job
 *
 * This route is triggered by a cron job to send daily reminders to learners
 * who haven't completed their words for the day.
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-reminders",
 *     "schedule": "0 3 * * *"  // 9 AM IST = 3:30 AM UTC
 *   }]
 * }
 */

import { NextResponse } from 'next/server';
import { getLearnersForDailyReminder, sendNotificationToUsers } from '@/lib/notifications/service';
import { dailyReminderNotification } from '@/lib/notifications/templates';

// Secret key to protect the cron endpoint
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  try {
    // Verify cron secret (if configured)
    if (CRON_SECRET) {
      const authHeader = request.headers.get('authorization');
      const secret = authHeader?.replace('Bearer ', '');

      if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('[Daily Reminders] Starting cron job...');

    // Get learners who need reminders
    const learnerIds = await getLearnersForDailyReminder();

    if (learnerIds.length === 0) {
      console.log('[Daily Reminders] No learners to remind');
      return NextResponse.json({
        success: true,
        message: 'No learners to remind',
        reminded: 0,
      });
    }

    console.log(`[Daily Reminders] Found ${learnerIds.length} learners to remind`);

    // Create notification template
    const template = dailyReminderNotification();

    // Send notifications
    const result = await sendNotificationToUsers(
      learnerIds,
      template,
      'scheduled'
    );

    console.log(
      `[Daily Reminders] Sent ${result.totalSent} notifications, ${result.totalFailed} failed`
    );

    return NextResponse.json({
      success: true,
      reminded: learnerIds.length,
      sent: result.totalSent,
      failed: result.totalFailed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Daily Reminders] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST method for manual testing
export async function POST(request: Request) {
  return GET(request);
}
