-- 1. Promover o seu email pessoal (dev7.davi@gmail.com) a Admin Mestre
create or replace function is_master_admin()
returns boolean as $$
begin
  return (
    auth.jwt()->>'email' = 'service_master@workly.com' OR 
    auth.jwt()->>'email' = 'dev7.davi@gmail.com'
  );
end;
$$ language plpgsql security definer;

-- 2. Garantir que o seu perfil tenha privilégios de admin e enviar aviso (dentro de um bloco DO para evitar erro de sintaxe)
DO $$
BEGIN
    UPDATE public.profiles 
    SET name = 'Davi (Workly Admin)'
    WHERE email = 'dev7.davi@gmail.com';

    RAISE NOTICE 'O usuário dev7.davi@gmail.com agora tem PODER TOTAL no sistema (is_master_admin).';
END $$;

-- 3. Injetar o service_master novamente mas SEM DELETAR NADA ANTES, apenas garantindo os valores
DO $$ 
DECLARE
    v_new_user_id uuid := gen_random_uuid();
    v_password text := 'D3v7.d4v1@28041999';
    v_email text := 'service_master@workly.com';
    v_id uuid;
BEGIN
    SELECT id INTO v_id FROM auth.users WHERE email = v_email;

    IF v_id IS NULL THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, is_sso_user)
        VALUES (v_new_user_id, '00000000-0000-0000-0000-000000000000', v_email, crypt(v_password, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Service Master"}', now(), now(), 'authenticated', 'authenticated', false);
        v_id := v_new_user_id;
    ELSE
        UPDATE auth.users SET encrypted_password = crypt(v_password, gen_salt('bf')), updated_at = now() WHERE id = v_id;
    END IF;

    INSERT INTO public.profiles (user_id, name, email, created_at, updated_at)
    VALUES (v_id, 'Service Master Dashboard', v_email, now(), now())
    ON CONFLICT (user_id) DO UPDATE SET updated_at = now();
END $$;
