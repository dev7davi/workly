-- Tabela de Auditoria
create table if not exists admin_audit_logs (
    id uuid primary key default gen_random_uuid(),
    admin_id uuid not null references auth.users(id),
    target_user_id uuid,
    action text not null,
    description text,
    ip_address text,
    created_at timestamptz default now()
);

alter table admin_audit_logs enable row level security;

create or replace function is_master_admin()
returns boolean as $$
begin
  return (auth.jwt()->>'email' = 'masterworkly@workly.com');
end;
$$ language plpgsql security definer;

create policy "Admins can view audit logs"
    on admin_audit_logs for select
    using (is_master_admin());

create policy "Admins can insert audit logs"
    on admin_audit_logs for insert
    with check (is_master_admin() and auth.uid() = admin_id);

-- Função para listar usuários
create or replace function admin_list_users()
returns table (id uuid, email text, name text, created_at timestamptz, phone text, document text) as $$
begin
  if not is_master_admin() then
    raise exception 'Unauthorized';
  end if;
  
  return query
    select p.id, p.email, p.name, p.created_at, p.phone, p.document
    from public.profiles p 
    order by p.created_at desc;
end;
$$ language plpgsql security definer;

-- Modificar RLS de Profiles para Admin poder ver todos
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile or admins can view all"
    on profiles for select
    using (auth.uid() = id or is_master_admin());

-- Modificar RLS nas tabelas principais para permitir acesso do Admin
-- Services
drop policy if exists "Users can view own services" on services;
create policy "Users can view own services or admin"
    on services for select using (auth.uid() = user_id or is_master_admin());

-- Clients
drop policy if exists "Users can view own clients" on clients;
create policy "Users can view own clients or admin"
    on clients for select using (auth.uid() = user_id or is_master_admin());

-- Calendar
drop policy if exists "Users can view own events" on calendar_events;
create policy "Users can view own events or admin"
    on calendar_events for select using (auth.uid() = user_id or is_master_admin());

-- Costs
drop policy if exists "Users can view own service costs" on service_costs;
create policy "Users can view own service costs or admin"
    on service_costs for select using (auth.uid() = user_id or is_master_admin());

-- Catalog
drop policy if exists "Users can view own catalog items" on catalog_items;
create policy "Users can view own catalog items or admin"
    on catalog_items for select using (auth.uid() = user_id or is_master_admin());

-- Preferences
drop policy if exists "Users can view own dashboard prefs" on dashboard_preferences;
create policy "Users can view own dashboard prefs or admin"
    on dashboard_preferences for select using (auth.uid() = user_id or is_master_admin());