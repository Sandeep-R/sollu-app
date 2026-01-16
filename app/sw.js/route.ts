import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Service Worker Route Handler
 * 
 * This ensures the service worker is served with correct headers
 * and is accessible without authentication
 */
export async function GET() {
  try {
    const swPath = join(process.cwd(), 'public', 'sw.js');
    const swContent = readFileSync(swPath, 'utf-8');

    return new NextResponse(swContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error serving service worker:', error);
    return new NextResponse(
      `// Service worker not found\nconsole.error('Service worker file not found');`,
      {
        status: 404,
        headers: {
          'Content-Type': 'application/javascript',
        },
      }
    );
  }
}
