-- Add rollup field to simulation_configs_variables table
ALTER TABLE public.simulation_configs_variables 
ADD COLUMN IF NOT EXISTS rollup boolean DEFAULT false;

-- Add rollup field to simulation table
ALTER TABLE public.simulation 
ADD COLUMN IF NOT EXISTS rollup boolean DEFAULT false;