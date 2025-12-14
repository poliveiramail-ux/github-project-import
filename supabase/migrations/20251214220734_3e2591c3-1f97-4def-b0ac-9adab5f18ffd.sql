-- Create dashboards table
CREATE TABLE public.dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dashboards
CREATE POLICY "Anyone can view dashboards" ON public.dashboards FOR SELECT USING (true);
CREATE POLICY "Anyone can insert dashboards" ON public.dashboards FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update dashboards" ON public.dashboards FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete dashboards" ON public.dashboards FOR DELETE USING (true);

-- Create junction table for variable-dashboard associations
CREATE TABLE public.variable_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variable_id uuid NOT NULL REFERENCES public.simulation_configs_variables(id_sim_cfg_var) ON DELETE CASCADE,
  dashboard_id uuid NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(variable_id, dashboard_id)
);

-- Enable RLS
ALTER TABLE public.variable_dashboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for variable_dashboards
CREATE POLICY "Anyone can view variable_dashboards" ON public.variable_dashboards FOR SELECT USING (true);
CREATE POLICY "Anyone can insert variable_dashboards" ON public.variable_dashboards FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update variable_dashboards" ON public.variable_dashboards FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete variable_dashboards" ON public.variable_dashboards FOR DELETE USING (true);