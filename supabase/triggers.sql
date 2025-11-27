-- 1. Function to handle new user creation
-- This function runs with "security definer" meaning it has admin privileges.
-- It inserts a row into public.profiles whenever a user is created in auth.users.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'display_name', 'New Producer'),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://placehold.co/150')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. The Trigger
-- Fires after a row is inserted into auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

