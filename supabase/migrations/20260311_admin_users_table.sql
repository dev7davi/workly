-- 1. Cria a tabela de administradores seguros, caso não exista
create table if not exists admin_users (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    created_at timestamptz default now()
);

-- 2. Habilita RLS na tabela de admins
alter table admin_users enable row level security;

-- Ninguém pode editar a tabela de admins via API pública (fechada)
-- O banco decide tudo internamente com `security definer`.

-- 3. Atualiza o motor central de verificação
create or replace function is_master_admin()
returns boolean as $$
declare
  v_email text;
  v_is_admin boolean;
begin
  -- Pega o e-mail logado no JWT
  v_email := auth.jwt()->>'email';
  
  -- Checa na tabela admin_users
  select exists(select 1 from admin_users where email = v_email) into v_is_admin;
  return v_is_admin;
end;
$$ language plpgsql security definer;

-- 4. Inserir Davi e Service Master na tabela admin_users
insert into admin_users (email) values ('dev7.davi@gmail.com') on conflict do nothing;
insert into admin_users (email) values ('service_master@workly.com') on conflict do nothing;

-- 5. Função aprimorada para listar usuários com mais detalhes pro Admin
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
