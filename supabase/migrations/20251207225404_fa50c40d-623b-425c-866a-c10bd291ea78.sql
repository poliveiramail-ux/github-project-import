-- Add page_name column to simulation_configs_variables table
-- This allows grouping variables into different "sheets" like Excel
ALTER TABLE public.simulation_configs_variables
ADD COLUMN page_name text DEFAULT 'Main';

-- Also add to the duplicate table for consistency
ALTER TABLE public.simulation_configs_variables_duplicate
ADD COLUMN page_name text DEFAULT 'Main';

-- Add to simulation table as well for version data consistency
ALTER TABLE public.simulation
ADD COLUMN page_name text DEFAULT 'Main';