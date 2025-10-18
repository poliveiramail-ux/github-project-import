-- Drop existing policies for lob table
DROP POLICY IF EXISTS "Authenticated users can insert programs" ON public.lob;
DROP POLICY IF EXISTS "Authenticated users can update programs" ON public.lob;
DROP POLICY IF EXISTS "Authenticated users can delete programs" ON public.lob;

-- Create new policies allowing anyone to insert, update, and delete
CREATE POLICY "Anyone can insert programs" 
ON public.lob 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update programs" 
ON public.lob 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete programs" 
ON public.lob 
FOR DELETE 
USING (true);