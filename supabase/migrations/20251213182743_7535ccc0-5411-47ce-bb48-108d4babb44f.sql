-- Update all existing variables in simulation_configs_variables to have rollup = true
UPDATE public.simulation_configs_variables SET rollup = true WHERE rollup IS NULL OR rollup = false;

-- Update all existing variables in simulation to have rollup = true
UPDATE public.simulation SET rollup = true WHERE rollup IS NULL OR rollup = false;

-- Change default value to true for future records
ALTER TABLE public.simulation_configs_variables ALTER COLUMN rollup SET DEFAULT true;
ALTER TABLE public.simulation ALTER COLUMN rollup SET DEFAULT true;