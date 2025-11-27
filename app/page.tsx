/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase'
import CreatePost from './components/CreatePost'
import Feed from './components/Feed'
import Auth from './components/Auth'
import { Button } from "@/app/components/ui/button"
import { ThemeToggle } from "@/app/components/theme-toggle"
import { Loader2, LogOut } from "lucide-react"

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, setSession, setIsLoading])

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
  
  if (!session) {
    return (
      <>
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Auth />
      </>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Producer Social Feed
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => supabase.auth.signOut()}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto p-4 pt-6">
        <CreatePost userId={session.user.id} />
        <Feed userId={session.user.id} />
      </div>
    </main>
  )
}
