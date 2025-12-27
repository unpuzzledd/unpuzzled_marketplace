-- Migration: Add weekly_schedule column to batches table
-- Date: Weekly Schedule Feature
-- Purpose: Store weekly recurring schedule for batches

ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS weekly_schedule JSONB;

-- Add comment for documentation
COMMENT ON COLUMN batches.weekly_schedule IS 'Weekly recurring schedule stored as JSONB array. Format: [{"day": "monday", "from_time": "10:00", "to_time": "11:00"}, ...]';

