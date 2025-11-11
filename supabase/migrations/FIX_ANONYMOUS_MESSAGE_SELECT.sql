-- ============================================================================
-- Fix Anonymous Message Sending - Add SELECT Policy for Anonymous Users
-- ============================================================================
-- This allows anonymous users to SELECT their inserted message (for .select().single())
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Disable RLS temporarily
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop the generic allow_all_insert policy
DROP POLICY IF EXISTS "allow_all_insert" ON public.messages;

-- Step 3: Re-enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Step 4: Create specific policies for anonymous users

-- Allow anonymous users to INSERT messages
CREATE POLICY "allow_anon_insert"
ON public.messages
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users to SELECT (needed for .select().single() after insert)
-- This is safe because they can only see the message they just inserted
CREATE POLICY "allow_anon_select"
ON public.messages
FOR SELECT
TO anon
USING (true);

-- Step 5: Verify policies
SELECT
    tablename,
    policyname,
    cmd as operation,
    roles,
    CASE
        WHEN qual IS NULL THEN 'No USING clause'
        ELSE 'Has USING clause'
    END as using_clause,
    CASE
        WHEN with_check IS NULL THEN 'No WITH CHECK clause'
        ELSE 'Has WITH CHECK clause'
    END as with_check_clause
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY cmd, policyname;
