import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Debug endpoint for push notifications
 * Helps diagnose issues with service worker and push notification setup
 */
export async function GET() {
  try {
    const swPath = join(process.cwd(), 'public', 'sw.js');
    const swExists = require('fs').existsSync(swPath);
    const swContent = swExists ? readFileSync(swPath, 'utf-8') : null;

    // Check environment variables
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY ? '***SET***' : 'NOT SET';
    const vapidSubject = process.env.VAPID_SUBJECT;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      serviceWorker: {
        fileExists: swExists,
        filePath: '/public/sw.js',
        fileSize: swContent ? swContent.length : 0,
        accessibleAt: '/sw.js',
      },
      vapid: {
        publicKey: vapidPublicKey ? `${vapidPublicKey.substring(0, 20)}...` : 'NOT SET',
        privateKey: vapidPrivateKey,
        subject: vapidSubject || 'NOT SET',
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL ? 'true' : 'false',
      },
      instructions: [
        '1. Check browser console for service worker registration logs',
        '2. Visit /sw.js directly to verify it loads',
        '3. Check Application tab > Service Workers in DevTools',
        '4. Verify VAPID keys are set in environment variables',
        '5. Check Network tab for failed requests',
      ],
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
