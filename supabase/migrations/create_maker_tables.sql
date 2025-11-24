-- REVIEWS TABLE
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) not null,
  client_id uuid references public.profiles(id) not null,
  maker_id uuid references public.profiles(id) not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on reviews
alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone."
  on reviews for select
  using ( true );

create policy "Clients can insert reviews for their orders."
  on reviews for insert
  with check ( auth.uid() = client_id );

-- PORTFOLIO TABLE
create table public.portfolio (
  id uuid default uuid_generate_v4() primary key,
  maker_id uuid references public.profiles(id) not null,
  image_url text not null,
  title text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on portfolio
alter table public.portfolio enable row level security;

create policy "Portfolio is viewable by everyone."
  on portfolio for select
  using ( true );

create policy "Makers can manage their own portfolio."
  on portfolio for all
  using ( auth.uid() = maker_id );
