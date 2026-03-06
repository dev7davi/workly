-- Appointments table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  title text not null,
  description text,
  date date not null,
  time text,
  location text,
  status text check (status in ('scheduled', 'done', 'cancelled')) default 'scheduled',
  reminder_sent boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.appointments enable row level security;

create policy "Users can view own appointments" on public.appointments for select using (auth.uid() = user_id);
create policy "Users can insert own appointments" on public.appointments for insert with check (auth.uid() = user_id);
create policy "Users can update own appointments" on public.appointments for update using (auth.uid() = user_id);
create policy "Users can delete own appointments" on public.appointments for delete using (auth.uid() = user_id);

create index if not exists appointments_user_id_idx on public.appointments(user_id);
create index if not exists appointments_date_idx on public.appointments(date);

-- Material catalog table
create table if not exists public.material_catalog (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  unit text default 'un',
  default_cost numeric default 0,
  default_price numeric default 0,
  category text,
  created_at timestamp with time zone default now()
);

alter table public.material_catalog enable row level security;

create policy "Users can view own materials" on public.material_catalog for select using (auth.uid() = user_id);
create policy "Users can insert own materials" on public.material_catalog for insert with check (auth.uid() = user_id);
create policy "Users can update own materials" on public.material_catalog for update using (auth.uid() = user_id);
create policy "Users can delete own materials" on public.material_catalog for delete using (auth.uid() = user_id);

create index if not exists material_catalog_user_id_idx on public.material_catalog(user_id);

-- Add extra fields to profiles (if not already exist)
alter table public.profiles add column if not exists company_name text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists state text;
alter table public.profiles add column if not exists description text;
