-- =====================================================
-- Add driver_id and vehicle_id columns to bookingtable
-- =====================================================
-- This script adds driver_id and vehicle_id columns to
-- the bookingtable to enable driver and vehicle assignments
-- 
-- Created: January 2026
-- Branch: backend
-- =====================================================

-- Add driver_id column (UUID, nullable, references drivers table)
ALTER TABLE public.bookingtable 
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL;

-- Add vehicle_id column (UUID, nullable, references vehicles table)
ALTER TABLE public.bookingtable 
ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookingtable_driver_id ON public.bookingtable(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookingtable_vehicle_id ON public.bookingtable(vehicle_id);

-- Add comments for documentation
COMMENT ON COLUMN public.bookingtable.driver_id IS 'Reference to assigned driver (UUID from drivers table)';
COMMENT ON COLUMN public.bookingtable.vehicle_id IS 'Reference to assigned vehicle (UUID from vehicles table)';

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================

