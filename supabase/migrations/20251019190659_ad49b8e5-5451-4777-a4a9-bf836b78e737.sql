-- Add id_prj and id_lang columns to simulation_versions table
ALTER TABLE public.simulation_versions
ADD COLUMN id_prj text,
ADD COLUMN id_lang text;

-- Add indexes for better query performance
CREATE INDEX idx_simulation_versions_id_prj ON public.simulation_versions(id_prj);
CREATE INDEX idx_simulation_versions_id_lang ON public.simulation_versions(id_lang);
CREATE INDEX idx_simulation_versions_id_prj_id_lang ON public.simulation_versions(id_prj, id_lang);