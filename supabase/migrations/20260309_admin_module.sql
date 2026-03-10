-- Tabela de Auditoria e Ajustes na Tabela Profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='document') THEN
        ALTER TABLE public.profiles ADD COLUMN document text;
    END IF;
END $$;

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

-- Costs (O costs usa exists via services)
drop policy if exists "Users can view their service costs" on service_costs;
create policy "Users can view their service costs or admin"
    on service_costs for select
    using (
      is_master_admin() or 
      exists (
        select 1 from public.services s
        where s.id = service_costs.service_id
        and s.user_id = auth.uid()
      )
    );

-- Catalog
drop policy if exists "Users can view own catalog items" on service_catalog;
drop policy if exists "Users can view own catalog" on service_catalog;
create policy "Users can view own catalog items or admin"
    on service_catalog for select using (auth.uid() = user_id or is_master_admin());

-- Preferences (Cuidado caso a tabela não exista, usa DO BLOCK seguro)
DO $$
BEGIN
   IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dashboard_preferences') THEN
      drop policy if exists "Users can view own dashboard prefs" on dashboard_preferences;
      drop policy if exists "Users can view own preferences" on dashboard_preferences;
      create policy "Users can view own dashboard prefs or admin"
          on dashboard_preferences for select using (auth.uid() = user_id or is_master_admin());
   END IF;
END
$$;