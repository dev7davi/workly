-- 1. Excluir o usuário incorreto (masterworkly@workly.com) das tabelas auth e public.profiles, caso exista
DO $$ 
DECLARE
  v_old_user_id uuid;
BEGIN
  SELECT id INTO v_old_user_id FROM auth.users WHERE email = 'masterworkly@workly.com';
  
  IF v_old_user_id IS NOT NULL THEN
    -- Deleta primeiro de perfis / dependencias (assumindo cascade setup, mas p/ segurança:)
    DELETE FROM public.profiles WHERE id = v_old_user_id;
    DELETE FROM auth.users WHERE id = v_old_user_id;
    RAISE NOTICE 'Usuário antigo masterworkly@workly.com deletado.';
  END IF;
END $$;

-- 2. Criar o novo User admin: service_master@workly.com com a senha informada
DO $$ 
DECLARE
    v_new_user_id uuid := gen_random_uuid();
    v_password text := 'D3v7.d4v1@28041999';
    v_email text := 'service_master@workly.com';
    v_already_exists uuid;
BEGIN
    SELECT id INTO v_already_exists FROM auth.users WHERE email = v_email;

    IF v_already_exists IS NULL THEN
        -- Insert new user into auth.users
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role
        ) VALUES (
            v_new_user_id,
            v_email,
            crypt(v_password, gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Service Master"}',
            now(),
            now(),
            'authenticated'
        );

        -- Garantir que ele seja admin no profiles
        INSERT INTO public.profiles (
            id,
            name,
            role,
            created_at
        ) VALUES (
            v_new_user_id,
            'Service Master Dashboard',
            'admin',
            now()
        ) ON CONFLICT (id) DO UPDATE SET role = 'admin';
        
        RAISE NOTICE 'Usuário service_master criado com SUCESSO e perfil admin gerado.';
    ELSE
        -- Update password instead if already exists
        UPDATE auth.users 
        SET encrypted_password = crypt(v_password, gen_salt('bf'))
        WHERE id = v_already_exists;

        UPDATE public.profiles 
        SET role = 'admin' 
        WHERE id = v_already_exists;

        RAISE NOTICE 'Usuário service_master já existe. Senha e permissões de admin resetadas.';
    END IF;
END $$;
