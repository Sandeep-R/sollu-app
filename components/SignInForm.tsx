'use client'

import { signIn } from '@/app/actions/auth'
import AuthError from '@/components/AuthError'
import './AuthForm.css'

export default function SignInForm() {
  return (
    <>
      <AuthError />
      <form action={signIn} className="auth-form">
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
            className="auth-input"
          />
        </div>

        <button type="submit" className="auth-button">
          Sign In
        </button>
      </form>
    </>
  )
}
