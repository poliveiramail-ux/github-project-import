-- Enable RLS on simulation_configs_variables (already enabled, but making sure)
ALTER TABLE simulation_configs_variables ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view config variables" ON simulation_configs_variables;
DROP POLICY IF EXISTS "Users can insert config variables" ON simulation_configs_variables;
DROP POLICY IF EXISTS "Users can update config variables" ON simulation_configs_variables;
DROP POLICY IF EXISTS "Users can delete config variables" ON simulation_configs_variables;

-- Create policy for SELECT (view variables if they own the parent config or if config has no owner)
CREATE POLICY "Users can view config variables"
ON simulation_configs_variables
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM simulation_configs
    WHERE simulation_configs.id_sim_cfg = simulation_configs_variables.id_sim_cfg
    AND (simulation_configs.user_id = auth.uid()::text OR simulation_configs.user_id IS NULL)
  )
);

-- Create policy for INSERT (insert variables if they own the parent config or if config has no owner)
CREATE POLICY "Users can insert config variables"
ON simulation_configs_variables
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM simulation_configs
    WHERE simulation_configs.id_sim_cfg = simulation_configs_variables.id_sim_cfg
    AND (simulation_configs.user_id = auth.uid()::text OR (simulation_configs.user_id IS NULL AND auth.uid() IS NULL))
  )
);

-- Create policy for UPDATE (update variables if they own the parent config or if config has no owner)
CREATE POLICY "Users can update config variables"
ON simulation_configs_variables
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM simulation_configs
    WHERE simulation_configs.id_sim_cfg = simulation_configs_variables.id_sim_cfg
    AND (simulation_configs.user_id = auth.uid()::text OR (simulation_configs.user_id IS NULL AND auth.uid() IS NULL))
  )
);

-- Create policy for DELETE (delete variables if they own the parent config or if config has no owner)
CREATE POLICY "Users can delete config variables"
ON simulation_configs_variables
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM simulation_configs
    WHERE simulation_configs.id_sim_cfg = simulation_configs_variables.id_sim_cfg
    AND (simulation_configs.user_id = auth.uid()::text OR (simulation_configs.user_id IS NULL AND auth.uid() IS NULL))
  )
);