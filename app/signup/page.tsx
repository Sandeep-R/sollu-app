import SignUpForm from '@/components/SignUpForm'
import { Suspense } from 'react'

export default function SignUpPage() {
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
          Sign Up
        </h1>
        <p style={{
          color: '#666',
          marginBottom: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          Create an account to start learning Tamil
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <SignUpForm />
        </Suspense>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          Already have an account?{' '}
          <a href="/signin" style={{
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            Sign In
          </a>
        </p>
      </div>
    </main>
  )
}
