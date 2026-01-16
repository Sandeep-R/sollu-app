import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
    const { endpoint, keys, userAgent, platform } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Missing required subscription data' },
        { status: 400 }
      );
    }

    // Insert or update subscription
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: userAgent || null,
          platform: platform || 'web',
          enabled: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,endpoint',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[Subscribe API] Error saving push subscription:', error);
      return NextResponse.json(
        { 
          error: 'Failed to save push subscription',
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log('[Subscribe API] Successfully saved subscription for user:', user.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[Subscribe API] Error in subscribe API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
