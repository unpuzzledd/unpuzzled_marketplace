-- Add status_notes column to academies table
-- This column stores admin notes about status changes that are visible to academy owners

ALTER TABLE public.academies
ADD COLUMN IF NOT EXISTS status_notes TEXT;

-- Add comment to the column
COMMENT ON COLUMN public.academies.status_notes IS 'Admin notes about status changes, visible to academy owners';

