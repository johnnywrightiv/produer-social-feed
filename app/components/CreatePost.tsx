'use client'
import { useState } from 'react'
import { createClient } from '@/app/lib/supabase'
import { Button } from "@/app/components/ui/button"
import { Textarea } from "@/app/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Upload, Loader2 } from "lucide-react"

export default function CreatePost({ userId }: { userId: string }) {
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) return

    setLoading(true)
    let publicUrl: string | null = null

    try {
      // 1. Upload File (if exists)
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${userId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('audio-snippets')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('audio-snippets')
          .getPublicUrl(filePath)
        
        publicUrl = data.publicUrl
      }

      // 2. Create Post in DB via Supabase (REST)
      const { error: insertError } = await supabase.from('posts').insert({
        content,
        audio_url: publicUrl,
        user_id: userId,
      })

      if (insertError) throw insertError

      // Reset Form
      setContent('')
      setFile(null)
      // alert('Post created!') 
      // We could use a toast here, but for now we'll just clear it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert('Error creating post: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Drop a beat / thought</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            className="min-h-[100px]"
            placeholder="What are you working on?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Input
                id="audio-upload"
                type="file"
                accept="audio/*"
                className="text-sm text-muted-foreground file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || !content}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Post
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
