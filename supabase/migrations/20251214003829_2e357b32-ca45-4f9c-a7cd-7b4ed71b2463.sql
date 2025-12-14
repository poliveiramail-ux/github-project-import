-- Update default value for status column
ALTER TABLE public.simulation_versions 
ALTER COLUMN status SET DEFAULT 'Open';