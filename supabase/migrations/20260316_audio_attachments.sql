-- Migração para suporte a Anexos de Áudio nos Serviços

-- 1. Criar a tabela de anexos de áudio
CREATE TABLE IF NOT EXISTS public.service_audio_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    filename TEXT NOT NULL,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID DEFAULT auth.uid()
);

-- 2. Habilitar RLS
ALTER TABLE public.service_audio_attachments ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança
CREATE POLICY "Usuários podem ver seus próprios áudios"
    ON public.service_audio_attachments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios áudios"
    ON public.service_audio_attachments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios áudios"
    ON public.service_audio_attachments FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Instruções para o Bucket (Manual via Dashboard Supabase ou via API se disponível)
-- O bucket 'service_audio' deve ser criado como PRIVADO via dashboard.
-- Configuração sugerida para o bucket:
-- - Public: false
-- - Allowed MIME types: audio/*
-- - Size limit: 5MB
