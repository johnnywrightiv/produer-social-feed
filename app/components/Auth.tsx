'use client'
import { useState } from 'react'
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

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName }
        }
      })
      if (error) {
        alert(error.message)
      } else {
        alert('Check your email for the confirmation link!')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) {
        alert(error.message)
      }
    }
    setLoading(false)
  }

  const handleResetPassword = async () => {
    if (!email) {
      alert('Enter your email above first')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) {
        alert(error.message)
      } else {
        alert('Check your email for a password reset link.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-2">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? 'Join the Feed' : 'Login'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? 'Create a new account to get started' : 'Welcome back! Please login to continue.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="ghost"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full"
          >
            {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
          </Button>

          {!isSignUp && (
            <Button
              variant="link"
              onClick={handleResetPassword}
              className="text-sm text-muted-foreground"
            >
              Forgot password?
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
