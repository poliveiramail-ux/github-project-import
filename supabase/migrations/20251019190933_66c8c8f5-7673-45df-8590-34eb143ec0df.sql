-- Add RLS policies for detail_indicators table
CREATE POLICY "Anyone can view detail_indicators"
ON public.detail_indicators
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert detail_indicators"
ON public.detail_indicators
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update detail_indicators"
ON public.detail_indicators
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete detail_indicators"
ON public.detail_indicators
FOR DELETE
USING (true);

-- Add RLS policies for simulation_intake table
CREATE POLICY "Anyone can view simulation_intake"
ON public.simulation_intake
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert simulation_intake"
ON public.simulation_intake
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update simulation_intake"
ON public.simulation_intake
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete simulation_intake"
ON public.simulation_intake
FOR DELETE
USING (true);