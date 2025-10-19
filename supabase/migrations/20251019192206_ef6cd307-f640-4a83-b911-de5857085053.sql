
-- Remove the unique constraint on version_id and row_index
-- This allows the same row_index to be used for different months within the same version
ALTER TABLE public.simulation
DROP CONSTRAINT IF EXISTS unique_version_row_index;

-- Create a new unique constraint that includes month and year to ensure uniqueness per month
ALTER TABLE public.simulation
ADD CONSTRAINT unique_version_row_month UNIQUE (version_id, row_index, month, year);
