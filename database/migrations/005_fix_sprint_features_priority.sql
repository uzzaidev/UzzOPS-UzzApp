-- Migration 005: Fix Sprint Features Priority (Defensiva)
-- Motivo: Erro "Could not find the 'priority' column" indica que a migração 003 pode ter pulado a criação da coluna em bases onde a tabela já existia.

DO $$
BEGIN
    -- Verificar se a coluna 'priority' existe na tabela 'sprint_features'
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sprint_features' 
        AND column_name = 'priority'
    ) THEN
        -- Se não existir, adicionar a coluna
        ALTER TABLE sprint_features 
        ADD COLUMN priority INT DEFAULT 0;
        
        RAISE NOTICE 'Coluna priority adicionada com sucesso a sprint_features';
    ELSE
        RAISE NOTICE 'Coluna priority já existe em sprint_features';
    END IF;
END $$;

-- Recarregar cache de configurações para garantir que a API veja a mudança
NOTIFY pgrst, 'reload config';
