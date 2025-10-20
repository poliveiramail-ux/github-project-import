-- Drop the existing foreign key constraint
ALTER TABLE public.simulation DROP CONSTRAINT IF EXISTS simulation_version_id_fkey;

-- Add the constraint with ON DELETE CASCADE
ALTER TABLE public.simulation 
ADD CONSTRAINT simulation_version_id_fkey 
FOREIGN KEY (version_id) 
REFERENCES public.simulation_versions(id_sim_ver)
ON DELETE CASCADE;