-- Modificar a constraint para permitir value_type = 'text'
ALTER TABLE simulation_configs_variables 
DROP CONSTRAINT IF EXISTS simulation_configs_variables_value_type_check;

ALTER TABLE simulation_configs_variables 
ADD CONSTRAINT simulation_configs_variables_value_type_check 
CHECK (value_type = ANY (ARRAY['number'::text, 'percentage'::text, 'text'::text]));