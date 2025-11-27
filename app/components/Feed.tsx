/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useQuery } from 'urql'
import { useMemo, useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Heart, MessageCircle, Trash2, Send, Loader2 } from "lucide-react"

// GraphQL query for the fields the UI actually uses
const FEED_QUERY = `
  query GetFeed {
    postsCollection(orderBy: { created_at: DescNullsFirst }) {
      edges {
        node {
          id
          content
          audio_url
          created_at
          user_id
          profiles {
            display_name
            avatar_url
          }
        }
      }
    }
  }
`

function PostItem({ post, userId }: { post: any, userId: string }) {
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState('')
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<any[]>([])
  const [isLiked, setIsLiked] = useState(false) // Track if user liked it
  const supabase = createClient()

  const refreshMeta = async () => {
    const [{ count: likesCount, data: userLike }, { data: commentsData, error: commentsError }] =
      await Promise.all([
        supabase
          .from('reactions')
          .select('id', { count: 'exact', head: false }) // changed head:true to head:false to get data
          .eq('post_id', post.id)
          .eq('type', 'like'),
        supabase
          .from('comments')
          .select('id, content, created_at, user_id, profiles(display_name, avatar_url)')
          .eq('post_id', post.id)
          .order('created_at', { ascending: true }),
      ])

    if (commentsError) {
      console.error('Error loading comments', commentsError)
    }

    // Check if user liked
    const userHasLiked = await supabase
      .from('reactions')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', userId)
      .eq('type', 'like')
      .maybeSingle()
    
    setIsLiked(!!userHasLiked.data)
    setLikeCount(likesCount ?? 0)
    setComments(commentsData ?? [])
  }

  useEffect(() => {
    refreshMeta()
    // Re-run when post content changes (after GraphQL refetch from realtime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post])

  const handleLike = async () => {
    // Toggle like: if reaction exists, delete it; otherwise insert
    const { data: existing, error: fetchError } = await supabase
      .from('reactions')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', userId)
      .eq('type', 'like')
      .limit(1)

    if (fetchError) {
      console.error('Error checking existing reaction', fetchError)
      return
    }

    const existingReaction = existing?.[0]

    if (existingReaction) {
      const { error: deleteError } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id)

      if (deleteError) {
        console.error('Error removing like', deleteError)
      }
      setIsLiked(false)
      setLikeCount(prev => Math.max(0, prev - 1))
    } else {
      const { error: insertError } = await supabase.from('reactions').insert({
        post_id: post.id,
        user_id: userId,
        type: 'like',
      })

      if (insertError) {
        console.error('Error liking post', insertError)
      }
      setIsLiked(true)
      setLikeCount(prev => prev + 1)
    }
    // refreshMeta() // Optimistic update is better
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment) return

    const { error } = await supabase.from('comments').insert({
      post_id: post.id,
      user_id: userId,
      content: comment,
    })

    if (error) {
      console.error('Error adding comment', error)
      return
    }

    setComment('')
    // setShowComment(false) // Keep comment section open
    refreshMeta()
  }

  const handleDeletePost = async () => {
    if (!confirm('Delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) {
      console.error('Error deleting post', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) {
      console.error('Error deleting comment', error)
      return
    }
    refreshMeta()
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-start gap-4 space-y-0">
        <Avatar>
          <AvatarImage src={post.profiles?.avatar_url || `https://api.dicebear.com/9.x/thumbs/png?seed=${post.profiles?.display_name || 'Producer'}`} />
          <AvatarFallback>{post.profiles?.display_name?.[0] || 'P'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">{post.profiles?.display_name || 'Unknown Producer'}</h4>
              <p className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString(undefined, { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {post.user_id === userId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive/90"
                onClick={handleDeletePost}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <p className="whitespace-pre-wrap text-sm mb-4">{post.content}</p>

        {post.audio_url && (
          <div className="bg-muted/50 p-3 rounded-md">
            <audio controls className="w-full h-8">
              <source src={post.audio_url} type="audio/mpeg" />
            </audio>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col items-stretch gap-3">
        <div className="flex items-center gap-2 border-t pt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-2 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground"
            onClick={() => setShowComment(!showComment)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{comments.length}</span>
          </Button>
        </div>

        {showComment && (
          <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 fade-in-0">
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3 text-sm group">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={c.profiles?.avatar_url || `https://api.dicebear.com/9.x/thumbs/png?seed=${c.profiles?.display_name || 'User'}`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{c.profiles?.display_name || 'Unknown'}</span>
                      {c.user_id === userId && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:underline text-xs"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleComment} className="flex gap-2 items-center">
              <Input
                type="text"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="h-9 text-sm"
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!comment}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

export default function Feed({ userId }: { userId: string }) {
  const [result, reexecuteQuery] = useQuery({
    query: FEED_QUERY,
    requestPolicy: 'cache-and-network',
  })
  const { data, fetching, error } = result
  const supabase = createClient()

  // Realtime Subscription
  useEffect(() => {
    const channel = supabase.channel('realtime-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        reexecuteQuery({ requestPolicy: 'cache-and-network' })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        reexecuteQuery({ requestPolicy: 'cache-and-network' })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => {
        reexecuteQuery({ requestPolicy: 'cache-and-network' })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [reexecuteQuery, supabase])

  const posts = useMemo(() => {
    return data?.postsCollection?.edges.map((edge: any) => edge.node) || []
  }, [data])

  if (fetching && !data) return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
  
  if (error) return (
    <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive text-sm">
      Error loading feed: {error.message}
    </div>
  )

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto pb-20">
      {posts.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
          No posts yet. Be the first to drop a beat!
        </div>
      )}

      {posts.map((post: any) => (
        <PostItem key={post.id} post={post} userId={userId} />
      ))}
    </div>
  )
}
