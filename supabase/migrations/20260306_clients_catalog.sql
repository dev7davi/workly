-- clients table
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text check (type in ('pf', 'pj')) default 'pf',
  document text,
  email text,
  phone text,
  phone_secondary text,
  street text,
  neighborhood text,
  city text,
  state text,
  zip text,
  birthday date,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.clients enable row level security;

create policy "Users can view own clients" on public.clients for select using (auth.uid() = user_id);
create policy "Users can insert own clients" on public.clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients" on public.clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients" on public.clients for delete using (auth.uid() = user_id);

create index if not exists clients_user_id_idx on public.clients(user_id);

-- service_catalog table
create table if not exists public.service_catalog (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  default_price numeric default 0,
  default_cost numeric default 0,
  category text,
  unit text default 'un',
  created_at timestamp with time zone default now()
);

alter table public.service_catalog enable row level security;

create policy "Users can view own catalog" on public.service_catalog for select using (auth.uid() = user_id);
create policy "Users can insert own catalog" on public.service_catalog for insert with check (auth.uid() = user_id);
create policy "Users can update own catalog" on public.service_catalog for update using (auth.uid() = user_id);
create policy "Users can delete own catalog" on public.service_catalog for delete using (auth.uid() = user_id);

create index if not exists service_catalog_user_id_idx on public.service_catalog(user_id);

-- Add client_id foreign key to services (optional, nullable - backwards compatible)
alter table public.services add column if not exists client_id uuid references public.clients(id) on delete set null;
