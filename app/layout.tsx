import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Sollu - Language Learning App',
  description: 'Learn Tamil with interactive flashcards',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sollu',
  },
  icons: {
    apple: '/icon-192.png',
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sollu" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#667eea" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('🔵 [Layout Script] Page loaded, checking service worker support...');
              if ('serviceWorker' in navigator) {
                console.log('✅ [Layout Script] Service workers are supported');
                navigator.serviceWorker.getRegistration('/').then(reg => {
                  if (reg) {
                    console.log('✅ [Layout Script] Service worker already registered:', reg.scope);
                  } else {
                    console.log('⚠️ [Layout Script] No service worker registered yet');
                  }
                }).catch(err => {
                  console.error('❌ [Layout Script] Error checking registration:', err);
                });
              } else {
                console.error('❌ [Layout Script] Service workers NOT supported');
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}
