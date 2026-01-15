import { signOut } from '@/app/actions/auth'
import { getUser, getUserRole } from '@/lib/auth'
import Link from 'next/link'
import './AuthButton.css'

export default async function AuthButton() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="auth-container">
        <Link href="/signin" className="auth-link signin-link">
          Sign In
        </Link>
        <Link href="/signup" className="auth-link signup-link">
          Sign Up
        </Link>
      </div>
    )
  }

  const role = await getUserRole()

  return (
    <div className="auth-container auth-container-logged-in">
      <span className="user-email">
        {user.email}
      </span>
      {role === 'admin' && (
        <Link href="/admin" className="auth-link admin-link">
          Admin
        </Link>
      )}
      <form action={signOut}>
        <button type="submit" className="auth-link signin-link">
          Sign Out
        </button>
      </form>
    </div>
  )
}
