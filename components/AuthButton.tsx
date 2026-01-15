import { signOut } from '@/app/actions/auth'
import { getUser, getUserRole } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AuthButton() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="absolute top-4 right-4 flex gap-4">
        <Button variant="outline" asChild className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white">
          <Link href="/signin">Sign In</Link>
        </Button>
        <Button asChild className="bg-white text-primary hover:bg-white/90">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    )
  }

  const role = await getUserRole()

  return (
    <div className="absolute top-4 right-4 flex items-center gap-4">
      <span className="text-white text-sm opacity-90">
        {user.email}
      </span>
      {role === 'admin' && (
        <Button asChild className="bg-white text-gray-900 hover:bg-gray-100">
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <form action={signOut}>
        <Button type="submit" variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white">
          Sign Out
        </Button>
      </form>
    </div>
  )
}
