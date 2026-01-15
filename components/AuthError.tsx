'use client'

import { useSearchParams } from 'next/navigation'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  if (!error) return null

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      color: '#c33',
      fontSize: '0.9rem'
    }}>
      {error}
    </div>
  )
}
