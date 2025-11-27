# Producer Feed: Technical Learning Roadmap

This project was built to bridge the gap between Mongo/REST development and the world of **SQL, Supabase, and GraphQL**.

While the original goal was "Pure GraphQL," we pivoted to a **Hybrid Approach** to demonstrate practical trade-offs. We use GraphQL for complex data fetching (reading) and standard REST SDKs for simple writes and realtime updates.

## Part 1: The Foundation (Database & Auth)
*   **Concept**: Relational Schema Design.
    *   Moving from NoSQL documents to Tables (`posts`, `comments`, `reactions`).
    *   Foreign Keys: Linking `user_id` to `auth.users`.
*   **Concept**: Automated User Management.
    *   **The Trigger**: How we automatically create a public `profile` row whenever a new user signs up via Supabase Auth.
    *   *Why?* Supabase manages `auth.users` (secure, hidden), but our app needs `public.profiles` (display names, avatars).
*   **Concept**: Row Level Security (RLS).
    *   "Security at the Source": Writing SQL policies that act like API middleware.
    *   Example: `auth.uid() = user_id` allows users to only delete their own posts.

## Part 2: The Hybrid Client (GraphQL vs. REST)
We use two different clients in this app. Here is why:

### 1. GraphQL for Reads (`urql`)
*   **The Problem**: The "N+1 Problem".
    *   *Scenario*: Fetching a feed of posts, where each post needs the author's profile, a count of likes, and a list of recent comments.
    *   *REST way*: Fetch posts -> Loop through posts -> Fetch profiles -> Fetch comments (dozens of requests).
    *   *GraphQL way*: One single request:
      ```graphql
      query {
        postsCollection {
          content
          profiles { display_name } 
          commentsCollection { content }
        }
      }
      ```
*   **Implementation**: Using `pg_graphql` (Supabase's auto-generated GraphQL layer).

### 2. REST for Writes (`supabase-js`)
*   **The Pivot**: Why not GraphQL Mutations?
    *   Supabase's auto-generated GraphQL mutations are verbose and strict.
    *   For simple actions like "Insert a comment" or "Upload a file," the Supabase JS client (`supabase.from('posts').insert(...)`) is significantly faster to write and easier to debug than constructing complex GraphQL mutation strings.
    *   **Lesson**: Use the right tool for the job. GraphQL dominates for fetching connected data; REST/SDKs dominate for simple commands.

## Part 3: Realtime & Subscriptions
*   **Concept**: WebSocket Channels.
    *   Instead of GraphQL Subscriptions (which can be heavy to set up), we use Supabase's native Realtime channels.
    *   **Flow**:
        1.  Listen for `postgres_changes` on the `posts` table.
        2.  When a change happens, trigger a **refetch** of the GraphQL query.
        3.  This keeps the feed live without page refreshes.

## Part 4: Storage & Media
*   **Concept**: Object Storage linked to Database Records.
    *   The Transaction Flow:
        1.  Upload Audio File -> Bucket (get the URL).
        2.  Save Post (with URL) -> Database.
    *   This separates heavy media storage (Filesystem/S3-compatible) from structured data (Postgres).

## Summary of Tech Stack
*   **Database**: PostgreSQL (Supabase)
*   **Auth**: Supabase Auth (GoTrue)
*   **Fetching (Reads)**: GraphQL (`urql`)
*   **Mutations (Writes)**: REST (`supabase-js`)
*   **Realtime**: Postgres Changes (`supabase-js`)

