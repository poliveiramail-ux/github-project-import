-- Add status column to simulation_versions table
ALTER TABLE public.simulation_versions 
ADD COLUMN status text DEFAULT 'draft';