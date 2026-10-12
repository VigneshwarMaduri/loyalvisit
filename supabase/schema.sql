-- ==============================================================================
-- NextVisit — Master Supabase Database Schema (Idempotent Production Migration)
-- Handles existing tables, adds missing columns, sets up RLS & Realtime sync
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. BUSINESSES TABLE
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text default 'Specialty Cafe & Bakery',
  phone text,
  instagram_handle text,
  google_review_link text,
  created_at timestamptz default now()
);

-- Ensure all columns exist even if table was created in an earlier migration
alter table public.businesses add column if not exists name text;
alter table public.businesses add column if not exists category text default 'Specialty Cafe & Bakery';
alter table public.businesses add column if not exists phone text;
alter table public.businesses add column if not exists instagram_handle text;
alter table public.businesses add column if not exists google_review_link text;
alter table public.businesses add column if not exists created_at timestamptz default now();

-- 2. REWARD RULES TABLE
create table if not exists public.reward_rules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  target_stamps int default 5 not null,
  reward_description text not null default 'Free Signature Artisanal Beverage & Truffle Croissant',
  created_at timestamptz default now()
);

-- Ensure columns exist
alter table public.reward_rules add column if not exists business_id uuid references public.businesses(id) on delete cascade;
alter table public.reward_rules add column if not exists target_stamps int default 5;
alter table public.reward_rules add column if not exists reward_description text default 'Free Signature Artisanal Beverage & Truffle Croissant';
alter table public.reward_rules add column if not exists created_at timestamptz default now();

-- 3. CUSTOMERS TABLE
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null unique,
  created_at timestamptz default now()
);

-- Ensure columns exist
alter table public.customers add column if not exists phone_number text;
alter table public.customers add column if not exists created_at timestamptz default now();

-- 4. LOYALTY CARDS TABLE
create table if not exists public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  current_stamps int default 0 not null check (current_stamps >= 0),
  total_rewards int default 0 not null check (total_rewards >= 0),
  updated_at timestamptz default now(),
  constraint unique_customer_business unique (business_id, customer_id)
);

-- Ensure columns exist
alter table public.loyalty_cards add column if not exists business_id uuid references public.businesses(id) on delete cascade;
alter table public.loyalty_cards add column if not exists customer_id uuid references public.customers(id) on delete cascade;
alter table public.loyalty_cards add column if not exists current_stamps int default 0;
alter table public.loyalty_cards add column if not exists total_rewards int default 0;
alter table public.loyalty_cards add column if not exists updated_at timestamptz default now();

-- Ensure unique constraint exists
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'unique_customer_business'
  ) then
    alter table public.loyalty_cards add constraint unique_customer_business unique (business_id, customer_id);
  end if;
exception when others then
  null;
end $$;

-- Enable Row Level Security (RLS)
alter table public.businesses enable row level security;
alter table public.reward_rules enable row level security;
alter table public.customers enable row level security;
alter table public.loyalty_cards enable row level security;

-- DROP OLD POLICIES TO PREVENT "POLICY ALREADY EXISTS" ERRORS
drop policy if exists "Allow public read access to businesses" on public.businesses;
drop policy if exists "Allow authenticated users to insert/update businesses" on public.businesses;
drop policy if exists "Allow public read access to reward_rules" on public.reward_rules;
drop policy if exists "Allow insert/update reward_rules" on public.reward_rules;
drop policy if exists "Allow public read/write to customers" on public.customers;
drop policy if exists "Allow public read/write to loyalty_cards" on public.loyalty_cards;

-- CREATE RLS POLICIES
create policy "Allow public read access to businesses"
  on public.businesses for select
  using (true);

create policy "Allow authenticated users to insert/update businesses"
  on public.businesses for all
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

create policy "Allow public read access to reward_rules"
  on public.reward_rules for select
  using (true);

create policy "Allow insert/update reward_rules"
  on public.reward_rules for all
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

create policy "Allow public read/write to customers"
  on public.customers for all
  using (true);

create policy "Allow public read/write to loyalty_cards"
  on public.loyalty_cards for all
  using (true);

-- REALTIME REPLICATION SETUP (Idempotent check)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'loyalty_cards' and schemaname = 'public'
  ) then
    alter publication supabase_realtime add table public.loyalty_cards;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'businesses' and schemaname = 'public'
  ) then
    alter publication supabase_realtime add table public.businesses;
  end if;
exception when others then
  null;
end $$;

-- ==============================================================================
-- SAMPLE SEED DATA
-- ==============================================================================

-- 1. Seed Business
insert into public.businesses (id, name, category, phone, instagram_handle, google_review_link)
values (
  '11111111-1111-4111-a111-111111111111',
  'Saffron Artisanal Cafe',
  'Specialty Coffee & Bakery',
  '+91 98765 43210',
  'saffron_cafe_hyd',
  'https://g.page/r/saffron-cafe-hyd/review'
) on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  phone = excluded.phone,
  instagram_handle = excluded.instagram_handle,
  google_review_link = excluded.google_review_link;

-- 2. Seed Reward Rule
insert into public.reward_rules (id, business_id, target_stamps, reward_description)
values (
  '44444444-4444-4444-a444-444444444444',
  '11111111-1111-4111-a111-111111111111',
  5,
  'Free Signature Artisanal Beverage & Truffle Croissant'
) on conflict (id) do update set
  target_stamps = excluded.target_stamps,
  reward_description = excluded.reward_description;

-- 3. Seed Customer
insert into public.customers (id, phone_number)
values (
  '22222222-2222-4222-a222-222222222222',
  '+91 98765 43210'
) on conflict (phone_number) do update set
  id = excluded.id;

-- 4. Seed Loyalty Card (3/5 Keys Unlocked)
insert into public.loyalty_cards (id, business_id, customer_id, current_stamps, total_rewards)
values (
  '33333333-3333-4333-a333-333333333333',
  '11111111-1111-4111-a111-111111111111',
  '22222222-2222-4222-a222-222222222222',
  3,
  1
) on conflict (business_id, customer_id) do update set
  current_stamps = excluded.current_stamps,
  total_rewards = excluded.total_rewards;
