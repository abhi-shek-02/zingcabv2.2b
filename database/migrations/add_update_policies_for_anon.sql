-- =====================================================
-- Add UPDATE Policies for ANON Role
-- =====================================================
-- This script adds UPDATE policies for drivers, vehicles,
-- and bookingtable to allow anon role to update records
-- 
-- Created: December 2024
-- =====================================================

-- =====================================================
-- BOOKINGTABLE - UPDATE Policy
-- =====================================================

-- Drop policy if it exists (to avoid errors on re-run)
DROP POLICY IF EXISTS "Allow public update access to bookingtable" ON public.bookingtable;

-- Allow public (anon) UPDATE access to bookingtable
-- Explicitly specify roles to ensure anon role has access
CREATE POLICY "Allow public update access to bookingtable" ON public.bookingtable
    FOR UPDATE
    TO public, anon
    USING (true)
    WITH CHECK (true);

-- Grant UPDATE permission to anon role (explicit grant)
GRANT UPDATE ON TABLE public.bookingtable TO anon;
GRANT UPDATE ON TABLE public.bookingtable TO public;

-- =====================================================
-- DRIVERS TABLE - UPDATE Policy
-- =====================================================

-- Drop policy if it exists (to avoid errors on re-run)
DROP POLICY IF EXISTS "Allow public update access to drivers" ON public.drivers;

-- Allow public (anon) UPDATE access to drivers
CREATE POLICY "Allow public update access to drivers" ON public.drivers
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Grant UPDATE permission to anon role
GRANT UPDATE ON TABLE public.drivers TO anon;

-- =====================================================
-- VEHICLES TABLE - UPDATE Policy
-- =====================================================

-- Drop policy if it exists (to avoid errors on re-run)
DROP POLICY IF EXISTS "Allow public update access to vehicles" ON public.vehicles;

-- Allow public (anon) UPDATE access to vehicles
CREATE POLICY "Allow public update access to vehicles" ON public.vehicles
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Grant UPDATE permission to anon role
GRANT UPDATE ON TABLE public.vehicles TO anon;

-- =====================================================
-- VERIFICATION (Optional)
-- =====================================================

-- Check policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('bookingtable', 'drivers', 'vehicles')
-- ORDER BY tablename, policyname;

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================

