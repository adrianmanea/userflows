-- Create sources table
create table if not exists sources (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  icon_url text, -- nullable, generic icon used if null
  url text,      -- nullable link to original app
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add source_id to components
alter table components
add column if not exists source_id uuid references sources(id) on delete set null;

-- Enable RLS on sources
alter table sources enable row level security;

-- Policies for sources (matching existing relaxed patterns)
create policy "Sources are viewable by everyone" 
  on sources for select 
  using (true);

create policy "Sources are insertable by authenticated users" 
  on sources for insert 
  with check (auth.role() = 'authenticated');

create policy "Sources are updatable by authenticated users" 
  on sources for update 
  using (auth.role() = 'authenticated');

create policy "Sources are deletable by authenticated users" 
  on sources for delete 
  using (auth.role() = 'authenticated');
