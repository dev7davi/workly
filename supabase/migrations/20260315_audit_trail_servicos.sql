-- Adição de colunas de controle na tabela principal de Serviços
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS versao_atual INTEGER DEFAULT 1;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS criado_por UUID REFERENCES auth.users(id);

-- Tabela de Audit Log para Serviços
CREATE TABLE IF NOT EXISTS public.services_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES auth.users(id),
    acao VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_origem INET,
    campos_afetados JSONB NOT NULL DEFAULT '[]'::jsonb,
    snapshot_anterior JSONB,
    snapshot_posterior JSONB,
    motivo TEXT,
    versao INTEGER NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_services_audit_service_id ON public.services_audit(service_id);
CREATE INDEX IF NOT EXISTS idx_services_audit_timestamp ON public.services_audit(timestamp DESC);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.services_audit ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para services_audit
CREATE POLICY "Users can view their own service audit logs"
    ON public.services_audit
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.services 
            WHERE services.id = services_audit.service_id 
            AND services.user_id = auth.uid()
        )
    );

-- Função para calcular o diff entre dois JSONB
CREATE OR REPLACE FUNCTION jsonb_diff(l JSONB, r JSONB) RETURNS JSONB AS $$
    SELECT jsonb_agg(
        jsonb_build_object(
            'campo', key,
            'valor_anterior', l -> key,
            'valor_novo', r -> key
        )
    )
    FROM jsonb_each(l) AS l_fields(key, val)
    JOIN jsonb_each(r) AS r_fields(r_key, r_val) ON l_fields.key = r_fields.r_key
    WHERE l_fields.val IS DISTINCT FROM r_fields.r_val;
$$ LANGUAGE sql;

-- Função principal de Auditoria
CREATE OR REPLACE FUNCTION log_service_alteracao()
RETURNS TRIGGER AS $$
DECLARE
    affected_fields JSONB := '[]'::jsonb;
    current_user_id UUID;
BEGIN
    -- Captura o ID do usuário (auth.uid() no Supabase)
    current_user_id := auth.uid();

    IF TG_OP = 'INSERT' THEN
        -- Log da criação inicial
        INSERT INTO public.services_audit (
            service_id, 
            usuario_id, 
            acao, 
            campos_afetados, 
            snapshot_posterior, 
            versao
        )
        VALUES (
            NEW.id, 
            current_user_id, 
            'criado', 
            '[]'::jsonb, 
            to_jsonb(NEW), 
            1
        );
        
        -- Atualiza campos de criação na tabela principal
        NEW.criado_por := current_user_id;
        NEW.data_criacao := NOW();
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Calcula os campos que mudaram
        affected_fields := jsonb_diff(to_jsonb(OLD), to_jsonb(NEW));

        -- Só registra log se houver mudanças reais (ignorando updated_at)
        IF affected_fields IS NOT NULL AND jsonb_array_length(affected_fields) > 0 THEN
            INSERT INTO public.services_audit (
                service_id, 
                usuario_id, 
                acao, 
                campos_afetados, 
                snapshot_anterior, 
                snapshot_posterior, 
                versao
            )
            VALUES (
                NEW.id, 
                current_user_id, 
                'atualizado', 
                affected_fields, 
                to_jsonb(OLD), 
                to_jsonb(NEW), 
                OLD.versao_atual + 1
            );

            -- Incrementa a versão na tabela principal
            NEW.versao_atual := OLD.versao_atual + 1;
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para automatizar os logs
DROP TRIGGER IF EXISTS trigger_services_audit ON public.services;
CREATE TRIGGER trigger_services_audit
BEFORE INSERT OR UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION log_service_alteracao();
