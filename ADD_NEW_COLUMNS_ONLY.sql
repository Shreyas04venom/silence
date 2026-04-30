-- ============================================================================
-- SAFE Migration - Only Add New Columns (No Data Loss)
-- ============================================================================
-- This script ONLY adds new columns to existing Lessons table
-- All existing data will remain untouched and safe
-- ============================================================================

-- Add 3 new columns for session sharing feature
-- Using "IF NOT EXISTS" means it's safe to run multiple times

ALTER TABLE "Lessons" 
ADD COLUMN IF NOT EXISTS created_by TEXT,
ADD COLUMN IF NOT EXISTS created_by_role TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create indexes for better performance (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_lessons_public 
ON "Lessons" (is_public, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lessons_creator_role 
ON "Lessons" (created_by_role, created_at DESC);

-- ============================================================================
-- That's it! Your existing data is completely safe.
-- New columns will be NULL for old records, which is fine.
-- New sessions will automatically populate these columns.
-- ============================================================================
