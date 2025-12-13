-- Update all existing records in simulation to have rollup = false
UPDATE public.simulation SET rollup = false;

-- Change default value to false for future records in simulation table
ALTER TABLE public.simulation ALTER COLUMN rollup SET DEFAULT false;