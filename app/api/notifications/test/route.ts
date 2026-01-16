import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Test endpoint to verify push notification setup
 * Visit: http://localhost:3000/api/notifications/test
 */
export async function GET() {
  const checks = {
    environment: {
      vapidPublicKey: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      vapidPrivateKey: !!process.env.VAPID_PRIVATE_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    database: {
      pushSubscriptionsTable: false,
      notificationPreferencesTable: false,
      notificationLogTable: false,
    },
    errors: [] as string[],
  };

  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      checks.errors.push('Not authenticated. Please sign in first.');
    }

    // Test push_subscriptions table
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .select('id')
        .limit(1);

      checks.database.pushSubscriptionsTable = !error;
      if (error) {
        checks.errors.push(`push_subscriptions table error: ${error.message}`);
      }
    } catch (error) {
      checks.errors.push(`push_subscriptions table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test notification_preferences table
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .select('id')
        .limit(1);

      checks.database.notificationPreferencesTable = !error;
      if (error) {
        checks.errors.push(`notification_preferences table error: ${error.message}`);
      }
    } catch (error) {
      checks.errors.push(`notification_preferences table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test notification_log table
    try {
      const { error } = await supabase
        .from('notification_log')
        .select('id')
        .limit(1);

      checks.database.notificationLogTable = !error;
      if (error) {
        checks.errors.push(`notification_log table error: ${error.message}`);
      }
    } catch (error) {
      checks.errors.push(`notification_log table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Overall status
    const allTablesExist =
      checks.database.pushSubscriptionsTable &&
      checks.database.notificationPreferencesTable &&
      checks.database.notificationLogTable;

    const allEnvVarsSet =
      checks.environment.vapidPublicKey &&
      checks.environment.vapidPrivateKey &&
      checks.environment.serviceRoleKey;

    return NextResponse.json({
      status: allTablesExist && allEnvVarsSet ? 'READY' : 'NOT_READY',
      checks,
      message: allTablesExist && allEnvVarsSet
        ? '✅ Push notifications are configured correctly!'
        : '⚠️ Some configuration is missing. See checks for details.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        checks,
      },
      { status: 500 }
    );
  }
}
