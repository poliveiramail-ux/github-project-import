-- Add data_origin field to simulation_configs_variables
ALTER TABLE public.simulation_configs_variables
ADD COLUMN data_origin text;

-- Add data_origin field to simulation_configs_variables_duplicate
ALTER TABLE public.simulation_configs_variables_duplicate
ADD COLUMN data_origin text;

-- Add data_origin field to simulation table
ALTER TABLE public.simulation
ADD COLUMN data_origin text;