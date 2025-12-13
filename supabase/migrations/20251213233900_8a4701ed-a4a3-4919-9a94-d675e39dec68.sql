-- Change rollup column from boolean to text in simulation_configs_variables
ALTER TABLE public.simulation_configs_variables 
  ALTER COLUMN rollup TYPE text USING 
    CASE 
      WHEN rollup = true THEN 'true'
      WHEN rollup = false THEN 'false'
      ELSE 'true'
    END;

-- Change rollup column from boolean to text in simulation table
ALTER TABLE public.simulation 
  ALTER COLUMN rollup TYPE text USING 
    CASE 
      WHEN rollup = true THEN 'true'
      WHEN rollup = false THEN 'false'
      ELSE 'true'
    END;

-- Set default value for rollup column
ALTER TABLE public.simulation_configs_variables 
  ALTER COLUMN rollup SET DEFAULT 'true';

ALTER TABLE public.simulation 
  ALTER COLUMN rollup SET DEFAULT 'true';