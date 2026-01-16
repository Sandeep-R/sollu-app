import { NextResponse } from 'next/server';

/**
 * Check service worker status
 * This returns info about the service worker file
 */
export async function GET() {
  const fs = require('fs');
  const path = require('path');

  const swPath = path.join(process.cwd(), 'public', 'sw.js');

  try {
    const swExists = fs.existsSync(swPath);
    const swContent = swExists ? fs.readFileSync(swPath, 'utf-8') : null;

    return NextResponse.json({
      serviceWorkerExists: swExists,
      serviceWorkerPath: '/sw.js',
      fileSize: swContent ? swContent.length : 0,
      instructions: [
        '1. Open DevTools (F12)',
        '2. Go to Application tab',
        '3. Click Service Workers (left sidebar)',
        '4. Check if sw.js is registered',
        '5. If not registered, the issue is with registration',
      ],
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
