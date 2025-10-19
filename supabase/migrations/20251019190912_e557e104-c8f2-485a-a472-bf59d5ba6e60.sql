-- Add RLS policies for simulation table
-- Allow users to view all simulations
CREATE POLICY "Users can view simulations"
ON public.simulation
FOR SELECT
USING (true);

-- Allow users to insert simulations
CREATE POLICY "Users can insert simulations"
ON public.simulation
FOR INSERT
WITH CHECK (true);

-- Allow users to update simulations
CREATE POLICY "Users can update simulations"
ON public.simulation
FOR UPDATE
USING (true);

-- Allow users to delete simulations
CREATE POLICY "Users can delete simulations"
ON public.simulation
FOR DELETE
USING (true);