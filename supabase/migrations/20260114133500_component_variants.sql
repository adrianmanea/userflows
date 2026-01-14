create table if not exists public.component_variants (
  id uuid not null default gen_random_uuid(),
  component_id bigint not null references public.components(id) on delete cascade,
  name text not null,
  code_string text,
  preview_url text,
  is_default boolean default false,
  created_at timestamp with time zone not null default now(),
  constraint component_variants_pkey primary key (id)
);

alter table public.component_variants enable row level security;

create policy "Component variants are viewable by everyone"
  on public.component_variants for select
  using (true);

create policy "Component variants are insertable by authenticated users"
  on public.component_variants for insert
  with check (auth.role() = 'authenticated');

create policy "Component variants are updatable by authenticated users"
  on public.component_variants for update
  using (auth.role() = 'authenticated');

create policy "Component variants are deletable by authenticated users"
  on public.component_variants for delete
  using (auth.role() = 'authenticated');
