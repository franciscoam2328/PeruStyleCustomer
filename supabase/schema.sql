-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CLEANUP (Run this to reset the DB if you have errors)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.orders;
drop table if exists public.designs;
drop table if exists public.profiles;
drop table if exists public.messages;

-- PROFILES TABLE (Extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text check (role in ('client', 'maker', 'admin')) default 'client',
  plan text check (plan in ('free', 'basic', 'premium', 'pro')) default 'free',
  avatar_url text,
  bio text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- DESIGNS TABLE
create table public.designs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  config jsonb not null, -- Stores 3D configuration (colors, textures, etc)
  preview_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on designs
alter table public.designs enable row level security;

create policy "Designs are viewable by owner and makers."
  on designs for select
  using ( auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role = 'maker') );

create policy "Users can insert their own designs."
  on designs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own designs."
  on designs for update
  using ( auth.uid() = user_id );

-- ORDERS TABLE
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.profiles(id) not null,
  maker_id uuid references public.profiles(id), -- Nullable initially if open to any maker
  design_id uuid references public.designs(id) not null,
  status text check (status in ('pending', 'accepted', 'in_progress', 'shipped', 'completed', 'cancelled')) default 'pending',
  price decimal(10, 2),
  currency text default 'USD',
  payment_status text check (payment_status in ('unpaid', 'paid', 'refunded')) default 'unpaid',
  paypal_order_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on orders
alter table public.orders enable row level security;

create policy "Users can view their own orders (client or maker)."
  on orders for select
  using ( auth.uid() = client_id or auth.uid() = maker_id );

create policy "Clients can create orders."
  on orders for insert
  with check ( auth.uid() = client_id );

create policy "Makers can update orders assigned to them."
  on orders for update
  using ( auth.uid() = maker_id );

create policy "Clients can update their own orders"
  on orders for update
  using ( auth.uid() = client_id );

-- MESSAGES TABLE
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) not null,

  receiver_id uuid references public.profiles(id) not null,
  content text not null,

  image_url text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on messages
alter table public.messages enable row level security;

create policy "Users can view their own messages."
  on messages for select
  using ( auth.uid() = sender_id or auth.uid() = receiver_id );

create policy "Users can send messages."
  on messages for insert
  with check ( auth.uid() = sender_id );

-- TRIGGER FOR NEW USER PROFILE
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'client'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE CONFIGURATION
-- STORAGE (Buckets)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('designs', 'designs', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('chat-images', 'chat-images', true) on conflict (id) do nothing;

-- Drop existing policies to avoid conflicts
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "Anyone can upload an avatar." on storage.objects;
drop policy if exists "Users can update their own avatar." on storage.objects;
drop policy if exists "Design images are publicly accessible." on storage.objects;
drop policy if exists "Anyone can upload a design preview." on storage.objects;
drop policy if exists "Chat images are accessible by authenticated users." on storage.objects;
drop policy if exists "Authenticated users can upload chat images." on storage.objects;

create policy "Avatar images are publicly accessible." on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Anyone can upload an avatar." on storage.objects for insert with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );
create policy "Users can update their own avatar." on storage.objects for update using ( bucket_id = 'avatars' and auth.uid() = owner );

create policy "Design images are publicly accessible." on storage.objects for select using ( bucket_id = 'designs' );
create policy "Anyone can upload a design preview." on storage.objects for insert with check ( bucket_id = 'designs' and auth.role() = 'authenticated' );

create policy "Chat images are accessible by authenticated users." on storage.objects for select using ( bucket_id = 'chat-images' and auth.role() = 'authenticated' );
create policy "Authenticated users can upload chat images." on storage.objects for insert with check ( bucket_id = 'chat-images' and auth.role() = 'authenticated' );

-- RATINGS TABLE
create table public.ratings (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) not null,
  maker_id uuid references public.profiles(id) not null,
  client_id uuid references public.profiles(id) not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on ratings
alter table public.ratings enable row level security;

create policy "Ratings are viewable by everyone."
  on ratings for select
  using ( true );

create policy "Clients can insert ratings for their orders."
  on ratings for insert
  with check ( auth.uid() = client_id );
