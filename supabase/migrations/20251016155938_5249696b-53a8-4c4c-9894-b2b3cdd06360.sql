-- Fix function search_path issue using CREATE OR REPLACE (no need to drop)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create security definer functions to check ownership without RLS recursion
CREATE OR REPLACE FUNCTION public.user_owns_config(config_id uuid, user_id_check text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.simulation_configs
    WHERE id = config_id
      AND user_id = user_id_check
  );
$$;

CREATE OR REPLACE FUNCTION public.user_owns_version(version_id uuid, user_id_check text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.simulation_versions
    WHERE id = version_id
      AND user_id = user_id_check
  );
$$;

-- Enable RLS on tables that don't have it
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_configs_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variables_backup ENABLE ROW LEVEL SECURITY;

-- Drop all existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on indicators" ON public.detail_indicators;
DROP POLICY IF EXISTS "Allow all operations on configs" ON public.simulation_configs;
DROP POLICY IF EXISTS "Allow all operations on versions" ON public.simulation_versions;
DROP POLICY IF EXISTS "Allow all operations on variables" ON public.variables;

-- Create proper user-scoped policies for simulation_configs
CREATE POLICY "Users can view their own configs"
ON public.simulation_configs
FOR SELECT
USING (user_id = (SELECT auth.uid()::text));

CREATE POLICY "Users can insert their own configs"
ON public.simulation_configs
FOR INSERT
WITH CHECK (user_id = (SELECT auth.uid()::text));

CREATE POLICY "Users can update their own configs"
ON public.simulation_configs
FOR UPDATE
USING (user_id = (SELECT auth.uid()::text));

CREATE POLICY "Users can delete their own configs"
ON public.simulation_configs
FOR DELETE
USING (user_id = (SELECT auth.uid()::text));

-- Create proper user-scoped policies for simulation_versions
CREATE POLICY "Users can view their own versions"
ON public.simulation_versions
FOR SELECT
USING (user_id = (SELECT auth.uid()::text));

CREATE POLICY "Users can insert their own versions"
ON public.simulation_versions
FOR INSERT
WITH CHECK (user_id = (SELECT auth.uid()::text));

CREATE POLICY "Users can update their own versions"
ON public.simulation_versions
FOR UPDATE
USING (user_id = (SELECT auth.uid()::text));

CREATE POLICY "Users can delete their own versions"
ON public.simulation_versions
FOR DELETE
USING (user_id = (SELECT auth.uid()::text));

-- Create policies for simulation_configs_variables (owned through config_id)
CREATE POLICY "Users can view variables for their configs"
ON public.simulation_configs_variables
FOR SELECT
USING (public.user_owns_config(config_id, (SELECT auth.uid()::text)));

CREATE POLICY "Users can insert variables for their configs"
ON public.simulation_configs_variables
FOR INSERT
WITH CHECK (public.user_owns_config(config_id, (SELECT auth.uid()::text)));

CREATE POLICY "Users can update variables for their configs"
ON public.simulation_configs_variables
FOR UPDATE
USING (public.user_owns_config(config_id, (SELECT auth.uid()::text)));

CREATE POLICY "Users can delete variables for their configs"
ON public.simulation_configs_variables
FOR DELETE
USING (public.user_owns_config(config_id, (SELECT auth.uid()::text)));

-- Create policies for variables (owned through config_id and version_id)
CREATE POLICY "Users can view their variables"
ON public.variables
FOR SELECT
USING (
  public.user_owns_config(config_id, (SELECT auth.uid()::text))
  OR (version_id IS NOT NULL AND public.user_owns_version(version_id, (SELECT auth.uid()::text)))
);

CREATE POLICY "Users can insert their variables"
ON public.variables
FOR INSERT
WITH CHECK (
  public.user_owns_config(config_id, (SELECT auth.uid()::text))
  OR (version_id IS NOT NULL AND public.user_owns_version(version_id, (SELECT auth.uid()::text)))
);

CREATE POLICY "Users can update their variables"
ON public.variables
FOR UPDATE
USING (
  public.user_owns_config(config_id, (SELECT auth.uid()::text))
  OR (version_id IS NOT NULL AND public.user_owns_version(version_id, (SELECT auth.uid()::text)))
);

CREATE POLICY "Users can delete their variables"
ON public.variables
FOR DELETE
USING (
  public.user_owns_config(config_id, (SELECT auth.uid()::text))
  OR (version_id IS NOT NULL AND public.user_owns_version(version_id, (SELECT auth.uid()::text)))
);

-- Create policies for detail_indicators (owned through variable relationship)
CREATE POLICY "Users can view detail indicators for their variables"
ON public.detail_indicators
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.variables v
    WHERE v.id = detail_indicators.variable_id
      AND (
        public.user_owns_config(v.config_id, (SELECT auth.uid()::text))
        OR (v.version_id IS NOT NULL AND public.user_owns_version(v.version_id, (SELECT auth.uid()::text)))
      )
  )
);

CREATE POLICY "Users can insert detail indicators for their variables"
ON public.detail_indicators
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.variables v
    WHERE v.id = detail_indicators.variable_id
      AND (
        public.user_owns_config(v.config_id, (SELECT auth.uid()::text))
        OR (v.version_id IS NOT NULL AND public.user_owns_version(v.version_id, (SELECT auth.uid()::text)))
      )
  )
);

CREATE POLICY "Users can update detail indicators for their variables"
ON public.detail_indicators
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.variables v
    WHERE v.id = detail_indicators.variable_id
      AND (
        public.user_owns_config(v.config_id, (SELECT auth.uid()::text))
        OR (v.version_id IS NOT NULL AND public.user_owns_version(v.version_id, (SELECT auth.uid()::text)))
      )
  )
);

CREATE POLICY "Users can delete detail indicators for their variables"
ON public.detail_indicators
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.variables v
    WHERE v.id = detail_indicators.variable_id
      AND (
        public.user_owns_config(v.config_id, (SELECT auth.uid()::text))
        OR (v.version_id IS NOT NULL AND public.user_owns_version(v.version_id, (SELECT auth.uid()::text)))
      )
  )
);

-- Create policies for programs (public read, authenticated users can manage)
CREATE POLICY "Anyone can view programs"
ON public.programs
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert programs"
ON public.programs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update programs"
ON public.programs
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete programs"
ON public.programs
FOR DELETE
TO authenticated
USING (true);

-- Create policies for variables_backup (accessible to authenticated users)
CREATE POLICY "Authenticated users can view backup variables"
ON public.variables_backup
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage backup variables"
ON public.variables_backup
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);