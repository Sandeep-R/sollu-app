import SignUpForm from '@/components/SignUpForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Begin your Tamil learning journey today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <SignUpForm />
            </Suspense>

            <p className="text-center mt-6 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/signin" className="text-primary font-medium hover:text-primary/80 transition-colors">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
