-- Atualização consolidada do motor de Master Admin e RLS
-- Adiciona suporte a múltiplos administradores e garante acesso universal ao RLS

-- 1. Atualizar o motor central de verificação
create or replace function is_master_admin()
returns boolean as $$
begin
  return (
    auth.jwt()->>'email' = 'masterworkly@workly.com' OR 
    auth.jwt()->>'email' = 'service_master@workly.com' OR
    auth.jwt()->>'email' = 'dev7.davi@gmail.com'
  );
end;
$$ language plpgsql security definer;

-- 2. Garantir que todas as tabelas principais tenham políticas RLS para o Admin
-- Repetimos aqui para garantir que qualquer tabela nova ou antiga esteja coberta

-- Profiles
drop policy if exists "Users can view own profile or admins can view all" on public.profiles;
create policy "Users can view own profile or admins can view all"
    on public.profiles for select
    using (auth.uid() = user_id or is_master_admin());

-- Services
drop policy if exists "Users can view own services or admin" on public.services;
create policy "Users can view own services or admin"
    on public.services for select
    using (auth.uid() = user_id or is_master_admin());

-- Clients
drop policy if exists "Users can view own clients or admin" on public.clients;
create policy "Users can view own clients or admin"
    on public.clients for select
    using (auth.uid() = user_id or is_master_admin());

-- Calendar
drop policy if exists "Users can view own events or admin" on public.calendar_events;
create policy "Users can view own events or admin"
    on public.calendar_events for select
    using (auth.uid() = user_id or is_master_admin());

-- Service Costs
drop policy if exists "Users can view their service costs or admin" on public.service_costs;
create policy "Users can view their service costs or admin"
    on public.service_costs for select
    using (
      is_master_admin() or 
      exists (
        select 1 from public.services s
        where s.id = public.service_costs.service_id
        and s.user_id = auth.uid()
      )
    );

-- Service Catalog
drop policy if exists "Users can view own catalog items or admin" on public.service_catalog;
create policy "Users can view own catalog items or admin"
    on public.service_catalog for select
    using (auth.uid() = user_id or is_master_admin());

-- Dashboard Preferences
DO $$
BEGIN
   IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dashboard_preferences') THEN
      drop policy if exists "Users can view own dashboard prefs or admin" on public.dashboard_preferences;
      create policy "Users can view own dashboard prefs or admin"
          on public.dashboard_preferences for select using (auth.uid() = user_id or is_master_admin());
   END IF;
END $$;

-- 3. Função aprimorada para listar usuários com mais detalhes pro Admin
drop function if exists admin_list_users();
create or replace function admin_list_users()
returns table (
  id uuid, 
  email text, 
  name text, 
  created_at timestamptz, 
  phone text, 
  document text,
  plan public.user_plan
) as $$
begin
  if not is_master_admin() then
    raise exception 'Acesso negado: Somente administradores master.';
  end if;
  
  return query
    select p.user_id as id, p.email, p.name, p.created_at, p.phone, p.document, p.plan
    from public.profiles p 
    order by p.created_at desc;
end;
$$ language plpgsql security definer;
