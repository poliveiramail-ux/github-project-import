-- Enable RLS policies for project table
CREATE POLICY "Anyone can view projects" ON public.project
FOR SELECT USING (true);

CREATE POLICY "Anyone can insert projects" ON public.project
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update projects" ON public.project
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete projects" ON public.project
FOR DELETE USING (true);

-- Enable RLS policies for lang table
CREATE POLICY "Anyone can view languages" ON public.lang
FOR SELECT USING (true);

CREATE POLICY "Anyone can insert languages" ON public.lang
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update languages" ON public.lang
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete languages" ON public.lang
FOR DELETE USING (true);