import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sollu - Learn Tamil',
    short_name: 'Sollu',
    description: 'Learn Tamil with interactive flashcards and conversations',
    start_url: '/',
    display: 'standalone',
    background_color: '#667eea',
    theme_color: '#667eea',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
