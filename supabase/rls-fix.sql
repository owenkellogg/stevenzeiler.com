-- Fix for the RLS policy on yoga_scheduled_classes
-- Run this in the Supabase SQL Editor to allow anonymous users to schedule classes

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can create scheduled classes" ON yoga_scheduled_classes;

-- Create new policy to allow anyone to insert into yoga_scheduled_classes
CREATE POLICY "Anyone can create scheduled classes" ON yoga_scheduled_classes
    FOR INSERT
    WITH CHECK (TRUE);

-- Verify RLS policies on the yoga_scheduled_classes table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'yoga_scheduled_classes'; 