-- Migração para adicionar ciclo de cobrança ao perfil do usuário
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(10) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));

-- Comentário para documentação
COMMENT ON COLUMN profiles.billing_cycle IS 'Ciclo de faturamento do plano do usuário (mensal ou anual)';
