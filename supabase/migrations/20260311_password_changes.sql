-- Adiciona a coluna de controle de trocas de senha limitadas (Prevenção de Abusos)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS password_changes_count INT DEFAULT 0 NOT NULL;
