-- Remove the incorrect foreign key constraint
ALTER TABLE public.simulation DROP CONSTRAINT IF EXISTS simulation_id_sim_ver_fkey;

-- Add the correct foreign key constraint on version_id column
ALTER TABLE public.simulation 
ADD CONSTRAINT simulation_version_id_fkey 
FOREIGN KEY (version_id) 
REFERENCES public.simulation_versions(id_sim_ver);