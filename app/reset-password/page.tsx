'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Loader2 } from "lucide-react"

function ResetPasswordForm() {
  const supabase = createClient()
  const router = useRouter()
  // We don't strictly need useSearchParams if we aren't reading tokens from URL, 
  // but supabase.auth.updateUser handles the session if the user clicked the email link.
  // However, the error was about useSearchParams usage, which was imported but not really used in the previous code.
  // Let's keep it clean. If we don't use it, we don't strictly need Suspense for *that* reason, 
  // but typically reset password flows might read a `code` param.
  // In this specific Supabase flow, the user is redirected here *after* the magic link sets the session.
  // So strictly speaking, `useSearchParams` might not be needed if we trust Supabase auth state.
  // BUT, let's keep the Suspense pattern as it's good practice for pages that might read params.

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      alert('Password updated. You can now log in with your new password.')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm bg-destructive/10 text-destructive rounded-md text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  )
}
