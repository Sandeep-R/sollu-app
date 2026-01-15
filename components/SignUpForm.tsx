'use client'

import { signUp } from '@/app/actions/auth'
import AuthError from '@/components/AuthError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUpForm() {
  return (
    <>
      <AuthError />
      <form action={signUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            required
            minLength={6}
          />
          <p className="text-sm text-muted-foreground">
            Must be at least 6 characters
          </p>
        </div>

        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </form>
    </>
  )
}
