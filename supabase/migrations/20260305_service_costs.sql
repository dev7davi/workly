-- Create service_costs table
create table if not exists public.service_costs (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  name text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  total_price numeric generated always as (quantity * unit_price) stored,
  paid_by text check (paid_by in ('client', 'provider')) default 'provider',
  category text default 'material',
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.service_costs enable row level security;

-- Policy: users can only access costs linked to their own services
create policy "Users can view their service costs"
  on public.service_costs for select
  using (
    exists (
      select 1 from public.services s
      where s.id = service_costs.service_id
      and s.user_id = auth.uid()
    )
  );

create policy "Users can insert their service costs"
  on public.service_costs for insert
  with check (
    exists (
      select 1 from public.services s
      where s.id = service_costs.service_id
      and s.user_id = auth.uid()
    )
  );

create policy "Users can update their service costs"
  on public.service_costs for update
  using (
    exists (
      select 1 from public.services s
      where s.id = service_costs.service_id
      and s.user_id = auth.uid()
    )
  );

create policy "Users can delete their service costs"
  on public.service_costs for delete
  using (
    exists (
      select 1 from public.services s
      where s.id = service_costs.service_id
      and s.user_id = auth.uid()
    )
  );

-- Index for performance
create index if not exists service_costs_service_id_idx on public.service_costs(service_id);
