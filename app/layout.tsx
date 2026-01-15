import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sollu - Language Learning App',
  description: 'Learn Tamil with interactive flashcards',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
