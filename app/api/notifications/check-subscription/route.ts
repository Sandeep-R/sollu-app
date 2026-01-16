import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Check if current user has push subscriptions saved
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

    // Also check browser subscription
    const browserSubscription = {
      hasPermission: typeof window !== 'undefined' ? Notification.permission : null,
      message: 'Run this in browser console: navigator.serviceWorker.getRegistration().then(r => r?.pushManager.getSubscription())',
    };

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      subscriptions: subscriptions || [],
      subscriptionCount: subscriptions?.length || 0,
      hasSubscriptions: (subscriptions?.length || 0) > 0,
      browserSubscription,
      message: subscriptions && subscriptions.length > 0
        ? '✅ You have subscriptions saved!'
        : '⚠️ No subscriptions found. Please enable notifications at /settings/notifications',
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
