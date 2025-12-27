-- Migration: Create schedule_exceptions table
-- Date: Schedule Exceptions Feature
-- Purpose: Store exceptions/modifications to weekly schedule for specific dates

CREATE TABLE IF NOT EXISTS schedule_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  original_day TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('cancelled', 'time_changed', 'moved')),
  from_time TEXT,
  to_time TEXT,
  new_day TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_batch_date UNIQUE (batch_id, exception_date)
);

-- Add indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_batch_id ON schedule_exceptions(batch_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_date ON schedule_exceptions(exception_date);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_batch_date ON schedule_exceptions(batch_id, exception_date);

-- Add comment for documentation
COMMENT ON TABLE schedule_exceptions IS 'Exceptions/modifications to weekly schedule for specific dates. Allows cancelling, changing time, or moving classes.';
COMMENT ON COLUMN schedule_exceptions.action IS 'Type of exception: cancelled (no class), time_changed (same day, different time), moved (different day)';
COMMENT ON COLUMN schedule_exceptions.original_day IS 'Day of week from weekly schedule (e.g., "monday")';
COMMENT ON COLUMN schedule_exceptions.new_day IS 'New day if action is "moved"';

