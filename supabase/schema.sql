-- ==========================================================
-- DORAMASPLAY - SUPABASE DATABASE SCHEMA
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CATEGORIES TABLE
create table if not exists public.categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    slug text not null unique,
    sort_order integer default 0,
    is_active boolean default true,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. CONTENTS TABLE
create table if not exists public.contents (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    slug text not null unique,
    description text,
    category_id uuid references public.categories(id) on delete set null,
    cover_url text not null,
    banner_url text,
    bunny_video_id text,
    year integer,
    rating numeric(3, 1) default 0.0,
    duration integer, -- in minutes
    classification text default 'L', -- L, 10, 12, 14, 16, 18
    country text default 'Coreia do Sul',
    language text default 'Legendado',
    is_featured boolean default false,
    is_trending boolean default false,
    is_published boolean default true,
    legacy_id text,
    legacy_video_url text,
    legacy_created_at timestamptz,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. EPISODES TABLE
create table if not exists public.episodes (
    id uuid primary key default uuid_generate_v4(),
    content_id uuid not null references public.contents(id) on delete cascade,
    season_number integer default 1 not null,
    episode_number integer not null,
    title text not null,
    description text,
    thumbnail_url text,
    bunny_video_id text,
    duration integer, -- in minutes
    is_published boolean default true,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. PROFILES TABLE
create table if not exists public.profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    avatar_url text,
    is_kids boolean default false,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. FAVORITES TABLE (Minha Lista)
create table if not exists public.favorites (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    content_id uuid not null references public.contents(id) on delete cascade,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    unique(user_id, content_id)
);

-- 6. WATCH_HISTORY TABLE (Progresso e Continuar Assistindo)
create table if not exists public.watch_history (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    content_id uuid not null references public.contents(id) on delete cascade,
    episode_id uuid references public.episodes(id) on delete cascade,
    progress_seconds integer default 0 not null,
    duration_seconds integer default 0 not null,
    percentage numeric(5, 2) default 0.0 not null,
    completed boolean default false,
    last_watched_at timestamptz default timezone('utc'::text, now()) not null,
    unique(user_id, content_id, episode_id)
);

-- 7. PLANS TABLE
create table if not exists public.plans (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    price numeric(10, 2) not null,
    billing_period text not null check (billing_period in ('monthly', 'quarterly', 'yearly')),
    is_active boolean default true,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 8. SUBSCRIPTIONS TABLE
create table if not exists public.subscriptions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    plan_id uuid references public.plans(id) on delete set null,
    status text not null default 'active' check (status in ('active', 'canceled', 'expired', 'past_due', 'trialing')),
    started_at timestamptz default timezone('utc'::text, now()) not null,
    expires_at timestamptz,
    provider text default 'manual',
    external_subscription_id text,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 9. BANNERS TABLE (Carrossel principal da Home)
create table if not exists public.banners (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    image_url text not null,
    content_id uuid references public.contents(id) on delete cascade,
    sort_order integer default 0,
    is_active boolean default true,
    starts_at timestamptz default timezone('utc'::text, now()) not null,
    ends_at timestamptz,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 10. FEATURED_CONTENT TABLE
create table if not exists public.featured_content (
    id uuid primary key default uuid_generate_v4(),
    content_id uuid not null references public.contents(id) on delete cascade unique,
    sort_order integer default 0,
    active boolean default true,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ==========================================================
-- INDEXES FOR HIGH PERFORMANCE
-- ==========================================================
create index if not exists idx_contents_slug on public.contents(slug);
create index if not exists idx_contents_category on public.contents(category_id);
create index if not exists idx_contents_published on public.contents(is_published);
create index if not exists idx_contents_featured on public.contents(is_featured);
create index if not exists idx_contents_trending on public.contents(is_trending);
create index if not exists idx_contents_bunny on public.contents(bunny_video_id);
create index if not exists idx_contents_legacy_id on public.contents(legacy_id);
create index if not exists idx_contents_legacy_url on public.contents(legacy_video_url);

create index if not exists idx_episodes_content on public.episodes(content_id);
create index if not exists idx_episodes_season_ep on public.episodes(content_id, season_number, episode_number);

create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_watch_history_user on public.watch_history(user_id);
create index if not exists idx_watch_history_last on public.watch_history(user_id, last_watched_at desc);

-- ==========================================================
-- TRIGGERS: auto updated_at
-- ==========================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_contents_updated_at on public.contents;
create trigger set_contents_updated_at
before update on public.contents
for each row
execute function public.handle_updated_at();

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
alter table public.categories enable row level security;
alter table public.contents enable row level security;
alter table public.episodes enable row level security;
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.watch_history enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.banners enable row level security;
alter table public.featured_content enable row level security;

-- Public can read active categories, published contents, episodes, plans, banners, featured
create policy "Public categories are viewable by everyone" on public.categories for select using (is_active = true);
create policy "Published contents are viewable by everyone" on public.contents for select using (is_published = true);
create policy "Published episodes are viewable by everyone" on public.episodes for select using (is_published = true);
create policy "Active plans are viewable by everyone" on public.plans for select using (is_active = true);
create policy "Active banners are viewable by everyone" on public.banners for select using (is_active = true);
create policy "Active featured content is viewable by everyone" on public.featured_content for select using (active = true);

-- Profiles: users manage their own profiles
create policy "Users can view own profiles" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profiles" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profiles" on public.profiles for update using (auth.uid() = user_id);
create policy "Users can delete own profiles" on public.profiles for delete using (auth.uid() = user_id);

-- Favorites: users manage their own list
create policy "Users can view own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on public.favorites for delete using (auth.uid() = user_id);

-- Watch History: users manage their own history
create policy "Users can view own watch history" on public.watch_history for select using (auth.uid() = user_id);
create policy "Users can insert own watch history" on public.watch_history for insert with check (auth.uid() = user_id);
create policy "Users can update own watch history" on public.watch_history for update using (auth.uid() = user_id);
create policy "Users can delete own watch history" on public.watch_history for delete using (auth.uid() = user_id);

-- Subscriptions: users can view their own subscription
create policy "Users can view own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);

-- ==========================================================
-- INITIAL SEED DATA
-- ==========================================================

-- Seed Categories
insert into public.categories (name, slug, sort_order) values
('Doramas', 'doramas', 1),
('Filmes', 'filmes', 2),
('Séries', 'series', 3),
('Novelas', 'novelas', 4),
('Novelinhas', 'novelinhas', 5),
('+18', 'mais-18', 6)
on conflict (slug) do nothing;

-- Seed Plans
insert into public.plans (name, description, price, billing_period) values
('Mensal Premium', 'Acesso ilimitado em 2 telas simultâneas em Full HD', 19.90, 'monthly'),
('Trimestral VIP', 'Acesso ilimitado em 3 telas simultâneas em 4K Ultra HD', 49.90, 'quarterly'),
('Anual Diamond', 'Acesso ilimitado em 4 telas simultâneas em 4K + Downloads offline', 149.90, 'yearly')
on conflict do nothing;
