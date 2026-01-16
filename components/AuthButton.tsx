import { signOut } from '@/app/actions/auth'
import { getUser, getUserRole } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AuthButton() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="absolute top-4 right-4 md:top-6 md:right-8 flex gap-3 md:gap-4 z-10">
        <Button variant="outline" asChild size="sm" className="elevation-sm">
          <Link href="/signin">Sign In</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    )
  }

  const role = await getUserRole()

  return (
    <div className="absolute top-4 right-4 md:top-6 md:right-8 flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4 z-10">
      <span className="text-foreground text-xs md:text-sm truncate max-w-[120px] md:max-w-none hidden md:block">
        {user.email}
      </span>
      <div className="flex gap-2 md:gap-3">
        {role === 'admin' && (
          <Button asChild size="sm" variant="outline" className="elevation-sm">
            <Link href="/admin">Admin</Link>
          </Button>
        )}
        <Button asChild size="sm" variant="outline" className="elevation-sm">
          <Link href="/settings/notifications">Settings</Link>
        </Button>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm" className="elevation-sm">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}
