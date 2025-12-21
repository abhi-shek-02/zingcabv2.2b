-- =====================================================
-- Add UPDATE Policies for ANON Role
-- =====================================================
-- This script adds UPDATE policies for drivers and vehicles
-- tables to allow anon role to update records
-- 
-- Created: December 2024
-- =====================================================

-- =====================================================
-- DRIVERS TABLE - UPDATE Policy
-- =====================================================

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
-- WHERE tablename IN ('drivers', 'vehicles')
-- ORDER BY tablename, policyname;

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================

