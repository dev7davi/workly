-- 1. Excluir usuários admin anteriores para evitar conflitos de cache ou index
DO $$ 
DECLARE
  v_old_user_id uuid;
BEGIN
  -- Tenta deletar ambos os emails que tentamos
  DELETE FROM public.profiles WHERE email IN ('masterworkly@workly.com', 'service_master@workly.com');
  DELETE FROM auth.users WHERE email IN ('masterworkly@workly.com', 'service_master@workly.com');
  RAISE NOTICE 'Limpando contas admin anteriores...';
END $$;

-- 2. Atualizar a função mestre (pointer) de admin
create or replace function is_master_admin()
returns boolean as $$
begin
  -- Definimos o service_master@workly.com como o ÚNICO admin mestre
  return (auth.jwt()->>'email' = 'service_master@workly.com');
end;
$$ language plpgsql security definer;

-- 3. Injetar o novo User admin com todos os campos obrigatórios do Supabase (aud, role, etc)
DO $$ 
DECLARE
    v_new_user_id uuid := gen_random_uuid();
    v_password text := 'D3v7.d4v1@28041999';
    v_email text := 'service_master@workly.com';
BEGIN
    -- Inserção completa na auth.users (garantindo aud='authenticated')
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud,
        is_sso_user,
        confirmed_at
    ) VALUES (
        v_new_user_id,
        '00000000-0000-0000-0000-000000000000',
        v_email,
        crypt(v_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Service Master"}',
        now(),
        now(),
        'authenticated',
        'authenticated',
        false,
        now()
    );

    -- Criar perfil na tabela pública
    INSERT INTO public.profiles (
        user_id,
        name,
        email,
        created_at,
        updated_at
    ) VALUES (
        v_new_user_id,
        'Service Master Dashboard',
        v_email,
        now(),
        now()
    );
    
    RAISE NOTICE 'Usuário service_master INJETADO com sucesso (aud: authenticated).';
END $$;
