-- =====================================================
-- Add driver_name, driver_mobile, and vehicle_number columns to bookingtable
-- =====================================================
-- This script adds driver_name, driver_mobile, and vehicle_number columns to
-- the bookingtable to store driver and vehicle details directly in bookings
-- 
-- Created: January 2026
-- Branch: backend
-- =====================================================

-- Add driver_name column (TEXT, nullable)
ALTER TABLE public.bookingtable 
ADD COLUMN IF NOT EXISTS driver_name TEXT;

-- Add driver_mobile column (TEXT, nullable)
ALTER TABLE public.bookingtable 
ADD COLUMN IF NOT EXISTS driver_mobile TEXT;

-- Add vehicle_number column (TEXT, nullable)
ALTER TABLE public.bookingtable 
ADD COLUMN IF NOT EXISTS vehicle_number TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.bookingtable.driver_name IS 'Driver name (populated from drivers table when driver_id is assigned)';
COMMENT ON COLUMN public.bookingtable.driver_mobile IS 'Driver mobile number (populated from drivers table when driver_id is assigned)';
COMMENT ON COLUMN public.bookingtable.vehicle_number IS 'Vehicle registration number (populated from vehicles table when vehicle_id is assigned)';

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================

