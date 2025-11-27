-- Enable RLS on all tables
alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table reactions enable row level security;

-- PROFILES POLICIES
-- Anyone can view profiles
create policy "Public profiles are viewable by everyone"
on profiles for select
to public
using ( true );

-- Users can insert their own profile
create policy "Users can insert their own profile"
on profiles for insert
to authenticated
with check ( auth.uid() = id );

-- Users can update own profile
create policy "Users can update own profile"
on profiles for update
to authenticated
using ( auth.uid() = id );

-- POSTS POLICIES
-- Everyone can read posts
create policy "Posts are viewable by everyone"
on posts for select
to public
using ( true );

-- Authenticated users can create posts
create policy "Authenticated users can create posts"
on posts for insert
to authenticated
with check ( auth.uid() = user_id );

-- Users can update/delete their own posts
create policy "Users can update own posts"
on posts for update
to authenticated
using ( auth.uid() = user_id );

create policy "Users can delete own posts"
on posts for delete
to authenticated
using ( auth.uid() = user_id );

-- COMMENTS POLICIES
-- Everyone can read comments
create policy "Comments are viewable by everyone"
on comments for select
to public
using ( true );

-- Authenticated users can create comments
create policy "Authenticated users can create comments"
on comments for insert
to authenticated
with check ( auth.uid() = user_id );

-- USERS can delete their own comments
create policy "Users can delete own comments"
on comments for delete
to authenticated
using ( auth.uid() = user_id );

-- REACTIONS POLICIES
-- Everyone can read reactions
create policy "Reactions are viewable by everyone"
on reactions for select
to public
using ( true );

-- Authenticated users can react
create policy "Authenticated users can react"
on reactions for insert
to authenticated
with check ( auth.uid() = user_id );

-- Users can remove their own reaction
create policy "Users can delete own reaction"
on reactions for delete
to authenticated
using ( auth.uid() = user_id );


