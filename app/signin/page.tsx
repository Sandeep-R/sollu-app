import SignInForm from '@/components/SignInForm'
import { Suspense } from 'react'

export default function SignInPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '2.5rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          color: '#333',
          textAlign: 'center'
        }}>
          Sign In
        </h1>
        <p style={{
          color: '#666',
          marginBottom: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          Welcome back! Sign in to continue learning
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <SignInForm />
        </Suspense>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            Sign Up
          </a>
        </p>
      </div>
    </main>
  )
}
