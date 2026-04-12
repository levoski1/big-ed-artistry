-- Run this in your Supabase SQL editor to create the reviews table

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  user_name   text not null,
  message     text not null,
  rating      smallint not null check (rating between 1 and 5),
  created_at  timestamptz not null default now()
);

-- Allow anyone to read reviews
alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select using (true);

create policy "Authenticated users can insert their own review"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own review"
  on public.reviews for update
  using (auth.uid() = user_id);
