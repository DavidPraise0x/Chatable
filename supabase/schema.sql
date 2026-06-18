-- CHATABLE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  role text check (role in ('client', 'freelancer', 'admin')) default 'client',
  profile_image text,
  bio text,
  is_suspended boolean default false,
  reputation_score integer default 95,
  metrics jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- 2. Create Projects Table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  client_id uuid references public.profiles(id),
  freelancer_id uuid references public.profiles(id),
  status text check (status in ('planning', 'in-progress', 'review', 'completed')) default 'planning',
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for projects
alter table public.projects enable row level security;

-- Projects Policies
create policy "Users can view projects they belong to." on public.projects
  for select using (
    auth.uid() = client_id or auth.uid() = freelancer_id or 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients or Admins can insert projects." on public.projects
  for insert with check (
    auth.uid() = client_id or 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Members or Admins can update projects." on public.projects
  for update using (
    auth.uid() = client_id or auth.uid() = freelancer_id or 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 3. Create Chats (messages) Table
create table public.chats (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  message text not null,
  type text check (type in ('text', 'file', 'audio')) default 'text',
  file_url text,
  file_name text,
  file_size text,
  is_enhanced boolean default false,
  original_message text,
  is_flagged boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for chats
alter table public.chats enable row level security;

-- Chats Policies
create policy "Users can select messages inside their projects." on public.chats
  for select using (
    exists (
      select 1 from public.projects 
      where id = project_id and (client_id = auth.uid() or freelancer_id = auth.uid())
    ) or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can send messages inside their projects." on public.chats
  for insert with check (
    auth.uid() = sender_id and 
    exists (
      select 1 from public.projects 
      where id = project_id and (client_id = auth.uid() or freelancer_id = auth.uid())
    )
  );

create policy "Moderators/senders can update chats." on public.chats
  for update using (
    auth.uid() = sender_id or 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete chats." on public.chats
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 4. Create Tasks Table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text check (status in ('todo', 'inprogress', 'review', 'completed')) default 'todo',
  deadline date,
  assignee_id uuid references public.profiles(id),
  comments jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for tasks
alter table public.tasks enable row level security;

-- Tasks Policies
create policy "Users can select tasks for their projects." on public.tasks
  for select using (
    exists (
      select 1 from public.projects 
      where id = project_id and (client_id = auth.uid() or freelancer_id = auth.uid())
    ) or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Project members can insert tasks." on public.tasks
  for insert with check (
    exists (
      select 1 from public.projects 
      where id = project_id and (client_id = auth.uid() or freelancer_id = auth.uid())
    )
  );

create policy "Project members can update tasks." on public.tasks
  for update using (
    exists (
      select 1 from public.projects 
      where id = project_id and (client_id = auth.uid() or freelancer_id = auth.uid())
    )
  );

-- 5. Create Invoices Table
create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  amount numeric(10,2) not null,
  status text check (status in ('pending', 'paid')) default 'pending',
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for invoices
alter table public.invoices enable row level security;

-- Invoices Policies
create policy "Project members can select invoices." on public.invoices
  for select using (
    exists (
      select 1 from public.projects 
      where id = project_id and (client_id = auth.uid() or freelancer_id = auth.uid())
    ) or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Freelancers can insert invoices." on public.invoices
  for insert with check (
    exists (
      select 1 from public.projects 
      where id = project_id and freelancer_id = auth.uid()
    )
  );

create policy "Project members can update invoices." on public.invoices
  for update using (
    exists (
      select 1 from public.projects 
      where id = project_id and (client_id = auth.uid() or freelancer_id = auth.uid())
    )
  );

-- 6. Create Files Table
create table public.files (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) not null,
  url text not null,
  name text not null,
  type text,
  size text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for files
alter table public.files enable row level security;

-- Files Policies
create policy "Project members can view project files." on public.files
  for select using (
    exists (
      select 1 from public.projects 
      where id = project_id and (client_id = auth.uid() or freelancer_id = auth.uid())
    ) or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Project members can insert project files." on public.files
  for insert with check (
    auth.uid() = uploaded_by and
    exists (
      select 1 from public.projects 
      where id = project_id and (client_id = auth.uid() or freelancer_id = auth.uid())
    )
  );

-- 7. Create Briefs Table
create table public.briefs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  original_prompt text not null,
  objective text,
  style_keywords text[],
  colors text[],
  typography text,
  target_audience text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for briefs
alter table public.briefs enable row level security;

-- Briefs Policies
create policy "Project members can view briefs." on public.briefs
  for select using (
    exists (
      select 1 from public.projects 
      where id = project_id and (client_id = auth.uid() or freelancer_id = auth.uid())
    ) or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Project members can create briefs." on public.briefs
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.projects 
      where id = project_id and (client_id = auth.uid() or freelancer_id = auth.uid())
    )
  );

-- 8. Trigger to auto-create profile row when auth.user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, profile_image, bio, reputation_score)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    coalesce(new.raw_user_meta_data->>'profile_image', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
    coalesce(new.raw_user_meta_data->>'bio', 'Welcome to Chatable!'),
    95
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
