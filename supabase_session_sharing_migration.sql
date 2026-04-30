-- ============================================================================
-- Supabase Database Migration for Session Sharing Feature
-- ============================================================================
-- This script adds the necessary columns to enable teacher session sharing
-- with students in the Silent Classrooms application.
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard (https://app.supabase.com)
-- 2. Select your project
-- 3. Click on "SQL Editor" in the left sidebar
-- 4. Click "New Query"
-- 5. Copy and paste this entire script
-- 6. Click "Run" button
-- 7. Verify success message
-- ============================================================================

-- Add session sharing columns to Lessons table
-- These columns track who created the session and whether it's public

ALTER TABLE "Lessons" 
ADD COLUMN IF NOT EXISTS created_by TEXT,
ADD COLUMN IF NOT EXISTS created_by_role TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add comments to document the columns
COMMENT ON COLUMN "Lessons".created_by IS 'Firebase user ID of the session creator';
COMMENT ON COLUMN "Lessons".created_by_role IS 'Role of creator: teacher or student';
COMMENT ON COLUMN "Lessons".is_public IS 'If true, session is visible to all students';

-- Create index for faster queries when loading public teacher sessions
-- This significantly improves performance when students load their dashboard
CREATE INDEX IF NOT EXISTS idx_lessons_public 
ON "Lessons" (is_public, created_at DESC);

-- Create index for filtering by creator role
CREATE INDEX IF NOT EXISTS idx_lessons_creator_role 
ON "Lessons" (created_by_role, created_at DESC);

-- Optional: Update existing lessons to be public if they were created by teachers
-- Uncomment the line below if you want all existing lessons to be visible to students
-- UPDATE "Lessons" SET is_public = true WHERE created_by_role = 'teacher';

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Lessons' 
AND column_name IN ('created_by', 'created_by_role', 'is_public')
ORDER BY column_name;

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- You should see 3 rows in the result:
-- - created_by (text, nullable)
-- - created_by_role (text, nullable)  
-- - is_public (boolean, default: false)
--
-- If you see these columns, the migration was successful! ✅
-- ============================================================================
