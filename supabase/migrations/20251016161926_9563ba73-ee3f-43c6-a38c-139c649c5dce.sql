-- Temporary development-friendly RLS policies that work without authentication
-- These allow access to records with NULL user_id when not authenticated

-- Update simulation_configs policies
DROP POLICY IF EXISTS "Users can view their own configs" ON public.simulation_configs;
DROP POLICY IF EXISTS "Users can insert their own configs" ON public.simulation_configs;
DROP POLICY IF EXISTS "Users can update their own configs" ON public.simulation_configs;
DROP POLICY IF EXISTS "Users can delete their own configs" ON public.simulation_configs;

CREATE POLICY "Users can view configs"
ON public.simulation_configs FOR SELECT
USING (
  user_id = (SELECT auth.uid()::text) 
  OR user_id IS NULL
);

CREATE POLICY "Users can insert configs"
ON public.simulation_configs FOR INSERT
WITH CHECK (
  user_id = (SELECT auth.uid()::text)
  OR (user_id IS NULL AND auth.uid() IS NULL)
);

CREATE POLICY "Users can update configs"
ON public.simulation_configs FOR UPDATE
USING (
  user_id = (SELECT auth.uid()::text)
  OR (user_id IS NULL AND auth.uid() IS NULL)
);

CREATE POLICY "Users can delete configs"
ON public.simulation_configs FOR DELETE
USING (
  user_id = (SELECT auth.uid()::text)
  OR (user_id IS NULL AND auth.uid() IS NULL)
);

-- Update simulation_versions policies
DROP POLICY IF EXISTS "Users can view their own versions" ON public.simulation_versions;
DROP POLICY IF EXISTS "Users can insert their own versions" ON public.simulation_versions;
DROP POLICY IF EXISTS "Users can update their own versions" ON public.simulation_versions;
DROP POLICY IF EXISTS "Users can delete their own versions" ON public.simulation_versions;

CREATE POLICY "Users can view versions"
ON public.simulation_versions FOR SELECT
USING (
  user_id = (SELECT auth.uid()::text)
  OR user_id IS NULL
);

CREATE POLICY "Users can insert versions"
ON public.simulation_versions FOR INSERT
WITH CHECK (
  user_id = (SELECT auth.uid()::text)
  OR (user_id IS NULL AND auth.uid() IS NULL)
);

CREATE POLICY "Users can update versions"
ON public.simulation_versions FOR UPDATE
USING (
  user_id = (SELECT auth.uid()::text)
  OR (user_id IS NULL AND auth.uid() IS NULL)
);

CREATE POLICY "Users can delete versions"
ON public.simulation_versions FOR DELETE
USING (
  user_id = (SELECT auth.uid()::text)
  OR (user_id IS NULL AND auth.uid() IS NULL)
);

-- Update helper functions to work with NULL user_id
CREATE OR REPLACE FUNCTION public.user_owns_config(config_id uuid, user_id_check text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.simulation_configs
    WHERE id = config_id
      AND (user_id = user_id_check OR (user_id IS NULL AND user_id_check IS NULL))
  );
$$;

CREATE OR REPLACE FUNCTION public.user_owns_version(version_id uuid, user_id_check text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.simulation_versions
    WHERE id = version_id
      AND (user_id = user_id_check OR (user_id IS NULL AND user_id_check IS NULL))
  );
$$;