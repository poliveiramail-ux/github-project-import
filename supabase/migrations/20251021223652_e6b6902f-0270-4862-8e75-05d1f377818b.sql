-- Adicionar campos para hierarquia de contas (parent-child)
ALTER TABLE public.simulation_configs_variables 
ADD COLUMN parent_account_id uuid REFERENCES public.simulation_configs_variables(id_sim_cfg_var) ON DELETE CASCADE,
ADD COLUMN level integer NOT NULL DEFAULT 0;

-- Criar índice para melhorar performance das queries de hierarquia
CREATE INDEX idx_simulation_configs_variables_parent 
ON public.simulation_configs_variables(parent_account_id);

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.simulation_configs_variables.parent_account_id IS 'ID da conta pai na hierarquia (NULL = conta de nível raiz)';
COMMENT ON COLUMN public.simulation_configs_variables.level IS 'Nível na hierarquia (0 = raiz, 1 = filho, 2 = neto, etc.)';