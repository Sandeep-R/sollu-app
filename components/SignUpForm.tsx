'use client'

import { signUp } from '@/app/actions/auth'
import AuthError from '@/components/AuthError'
import './AuthForm.css'

export default function SignUpForm() {
  return (
    <>
      <AuthError />
      <form action={signUp} className="auth-form">
        <div>
          <label htmlFor="email" className="auth-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="auth-input"
          />
        </div>

        <div>
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={6}
            className="auth-input"
          />
          <p className="auth-hint">
            Must be at least 6 characters
          </p>
        </div>

        <button type="submit" className="auth-button">
          Sign Up
        </button>
      </form>
    </>
  )
}
