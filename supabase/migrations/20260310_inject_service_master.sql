-- 1. Limpeza total de segurança para evitar duplicidade
DO $$ 
BEGIN
  -- Remove da public.profiles primeiro (pelo email ou pelo ID vinculado na auth)
  DELETE FROM public.profiles WHERE email IN ('masterworkly@workly.com', 'service_master@workly.com');
  DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('masterworkly@workly.com', 'service_master@workly.com'));
  
  -- Remove do auth.users
  DELETE FROM auth.users WHERE email IN ('masterworkly@workly.com', 'service_master@workly.com');
  
  RAISE NOTICE 'Limpeza de admins antigos concluída.';
END $$;

-- 2. Função de validação de Master Admin
create or replace function is_master_admin()
returns boolean as $$
begin
  return (auth.jwt()->>'email' = 'service_master@workly.com');
end;
$$ language plpgsql security definer;

-- 3. Injeção do Service Master
DO $$ 
DECLARE
    v_new_user_id uuid := gen_random_uuid();
    v_password text := 'D3v7.d4v1@28041999';
    v_email text := 'service_master@workly.com';
BEGIN
    -- Inserir na tabela de autenticação
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
        is_sso_user
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
        false
    );

    -- Inserir na tabela pública usando ON CONFLICT 
    -- (Isso evita erro caso o Supabase tenha um Trigger automático que já criou o perfil)
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
    ) ON CONFLICT (user_id) DO UPDATE 
    SET name = EXCLUDED.name, 
        email = EXCLUDED.email, 
        updated_at = now();
    
    RAISE NOTICE 'Usuário service_master injetado com sucesso.';
END $$;
