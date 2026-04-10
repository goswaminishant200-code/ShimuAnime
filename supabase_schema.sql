-- ═══════════════════════════════════════════════════════
--  ShimuAnime — Supabase SQL Schema
--  Isko poora copy karo aur Supabase SQL Editor mein paste karo
--  Phir RUN button dabao
-- ═══════════════════════════════════════════════════════

-- 1. PROFILES TABLE
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  role         text default 'free',
  banned       boolean default false,
  mal_link     text default '',
  anilist_link text default '',
  created_at   timestamptz default now()
);

-- 2. WATCHLIST TABLE
create table if not exists watchlist (
  id         bigserial primary key,
  user_id    uuid references profiles(id) on delete cascade,
  anime_id   text not null,
  title      text,
  image      text,
  score      text,
  episodes   text,
  created_at timestamptz default now(),
  unique(user_id, anime_id)
);

-- 3. RATINGS TABLE
create table if not exists ratings (
  id         bigserial primary key,
  user_id    uuid references profiles(id) on delete cascade,
  anime_id   text not null,
  rating     int check (rating >= 1 and rating <= 10),
  created_at timestamptz default now(),
  unique(user_id, anime_id)
);

-- 4. COMMENTS TABLE
create table if not exists comments (
  id           bigserial primary key,
  user_id      uuid references profiles(id) on delete cascade,
  anime_id     text not null,
  text         text not null,
  display_name text,
  created_at   timestamptz default now()
);

-- 5. DOWNLOADS TABLE
create table if not exists downloads (
  id         bigserial primary key,
  user_id    uuid references profiles(id) on delete cascade,
  anime_id   text not null,
  title      text,
  image      text,
  created_at timestamptz default now(),
  unique(user_id, anime_id)
);

-- 6. ANNOUNCEMENTS TABLE
create table if not exists announcements (
  id         bigserial primary key,
  title      text not null,
  message    text not null,
  admin_name text,
  active     boolean default true,
  created_at timestamptz default now()
);

-- 7. NEWS TABLE
create table if not exists news (
  id         bigserial primary key,
  title      text not null,
  content    text not null,
  image_url  text default '',
  category   text default 'General',
  author     text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════
--  ROW LEVEL SECURITY — BAHUT ZAROORI
-- ═══════════════════════════════════════════════════════

alter table profiles      enable row level security;
alter table watchlist     enable row level security;
alter table ratings       enable row level security;
alter table comments      enable row level security;
alter table downloads     enable row level security;
alter table announcements enable row level security;
alter table news          enable row level security;

-- PROFILES policies
create policy "Own profile read"    on profiles for select using (auth.uid() = id);
create policy "Own profile update"  on profiles for update using (auth.uid() = id);
create policy "Own profile insert"  on profiles for insert with check (auth.uid() = id);
create policy "Admin read all"      on profiles for select using ((select role from profiles where id = auth.uid()) = 'admin');
create policy "Admin update all"    on profiles for update using ((select role from profiles where id = auth.uid()) = 'admin');

-- WATCHLIST policies
create policy "Own watchlist" on watchlist for all using (auth.uid() = user_id);

-- RATINGS policies
create policy "Anyone reads ratings" on ratings for select using (true);
create policy "Own ratings write"    on ratings for insert with check (auth.uid() = user_id);
create policy "Own ratings update"   on ratings for update using (auth.uid() = user_id);

-- COMMENTS policies
create policy "Anyone reads comments" on comments for select using (true);
create policy "Auth users comment"    on comments for insert with check (auth.uid() = user_id);
create policy "Own comment delete"    on comments for delete using (auth.uid() = user_id);

-- DOWNLOADS policies
create policy "Own downloads" on downloads for all using (auth.uid() = user_id);

-- ANNOUNCEMENTS policies
create policy "Anyone reads anns"   on announcements for select using (true);
create policy "Admin writes anns"   on announcements for all using ((select role from profiles where id = auth.uid()) = 'admin');

-- NEWS policies
create policy "Anyone reads news" on news for select using (true);
create policy "Admin writes news" on news for all using ((select role from profiles where id = auth.uid()) = 'admin');

-- ═══════════════════════════════════════════════════════
--  AUTO-CREATE PROFILE ON REGISTER
-- ═══════════════════════════════════════════════════════

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, role, banned)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    'free',
    false
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ═══════════════════════════════════════════════════════
--  KHUD KO ADMIN BANANA HAI? YEH RUN KARO:
--  UPDATE profiles SET role = 'admin' WHERE email = 'tumhara@email.com';
-- ═══════════════════════════════════════════════════════
