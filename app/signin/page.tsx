import SignInForm from '@/components/SignInForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'

export default function SignInPage() {
  return (
    <main className="gradient-bg min-h-screen flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-[400px] shadow-xl">
        <CardHeader className="text-center p-4 md:p-6">
          <CardTitle className="text-xl md:text-2xl">Sign In</CardTitle>
          <CardDescription className="text-sm">
            Welcome back! Sign in to continue learning
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <Suspense fallback={<div>Loading...</div>}>
            <SignInForm />
          </Suspense>

          <p className="text-center mt-4 md:mt-6 text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
