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

-- 2. Atualizar a função que verifica se o usuário é o master admin (para o novo e-mail)
create or replace function is_master_admin()
returns boolean as $$
begin
  return (auth.jwt()->>'email' = 'service_master@workly.com');
end;
$$ language plpgsql security definer;

-- 3. Criar o novo User admin: service_master@workly.com com a senha informada
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

        -- Garantir que ele exista na profiles
        INSERT INTO public.profiles (
            id,
            name,
            created_at
        ) VALUES (
            v_new_user_id,
            'Service Master Dashboard',
            now()
        ) ON CONFLICT (id) DO UPDATE SET name = 'Service Master Dashboard';
        
        RAISE NOTICE 'Usuário service_master criado com SUCESSO.';
    ELSE
        -- Update password instead if already exists
        UPDATE auth.users 
        SET encrypted_password = crypt(v_password, gen_salt('bf'))
        WHERE id = v_already_exists;

        UPDATE public.profiles 
        SET name = 'Service Master Dashboard' 
        WHERE id = v_already_exists;

        RAISE NOTICE 'Usuário service_master já existe. Senha resetada.';
    END IF;
END $$;
