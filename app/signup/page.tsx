import SignUpForm from '@/components/SignUpForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'

export default function SignUpPage() {
  return (
    <main className="gradient-bg min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-[400px] shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create an account to start learning Tamil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <SignUpForm />
          </Suspense>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/signin" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
