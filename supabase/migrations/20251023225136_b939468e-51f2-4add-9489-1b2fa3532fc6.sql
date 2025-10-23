-- Allow NULL values for id_lang in simulation table
ALTER TABLE public.simulation 
ALTER COLUMN id_lang DROP NOT NULL;