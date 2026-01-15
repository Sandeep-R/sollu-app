import { signOut } from '@/app/actions/auth'
import { getUser, getUserRole } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AuthButton() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-2 md:gap-4">
        <Button variant="outline" asChild className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white text-xs md:text-sm h-8 md:h-10 px-3 md:px-4">
          <Link href="/signin">Sign In</Link>
        </Button>
        <Button asChild className="bg-white text-primary hover:bg-white/90 text-xs md:text-sm h-8 md:h-10 px-3 md:px-4">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    )
  }

  const role = await getUserRole()

  return (
    <div className="absolute top-2 right-2 md:top-4 md:right-4 flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4">
      <span className="text-white text-xs md:text-sm opacity-90 truncate max-w-[120px] md:max-w-none hidden md:block">
        {user.email}
      </span>
      <div className="flex gap-2">
        {role === 'admin' && (
          <Button asChild className="bg-white text-gray-900 hover:bg-gray-100 text-xs md:text-sm h-8 md:h-10 px-3 md:px-4">
            <Link href="/admin">Admin</Link>
          </Button>
        )}
        <form action={signOut}>
          <Button type="submit" variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white text-xs md:text-sm h-8 md:h-10 px-3 md:px-4">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}
