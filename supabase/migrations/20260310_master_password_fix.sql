-- Script para alterar a senha do usuário masterworkly@workly.com para D3v7.d4v1@28041999

DO $$ 
BEGIN
  -- Atualiza o password do administrator
  UPDATE auth.users
  SET encrypted_password = crypt('D3v7.d4v1@28041999', gen_salt('bf'))
  WHERE email = 'masterworkly@workly.com';
  
  -- Para garantir que foi atualizado
  IF FOUND THEN
      RAISE NOTICE 'Senha do masterworkly@workly.com atualizada com sucesso.';
  ELSE
      RAISE NOTICE 'Usuário masterworkly@workly.com não encontrado na auth.users.';
  END IF;
END $$;
