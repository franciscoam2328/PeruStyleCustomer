-- Create Notifications Table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  content text not null,
  type text check (type in ('info', 'success', 'warning', 'error')) default 'info',
  is_read boolean default false,
  link text, -- Optional link to redirect user
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notifications enable row level security;

create policy "Users can view their own notifications."
  on notifications for select
  using ( auth.uid() = user_id );

create policy "System can insert notifications."
  on notifications for insert
  with check ( true ); -- In a real app, you might restrict this to server-side only or specific triggers

-- Function to create a notification (optional helper)
create or replace function public.create_notification(
  p_user_id uuid,
  p_title text,
  p_content text,
  p_type text default 'info',
  p_link text default null
) returns void as $$
begin
  insert into public.notifications (user_id, title, content, type, link)
  values (p_user_id, p_title, p_content, p_type, p_link);
end;
$$ language plpgsql security definer;
