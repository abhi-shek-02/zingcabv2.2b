-- =====================================================
-- Drivers Table Database Schema
-- =====================================================
-- This script creates the drivers table for storing
-- driver information and assignments in ZingCab
-- 
-- Created: December 2024
-- Branch: backend
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: drivers
-- =====================================================
-- Purpose: Store driver information and their assignments
-- Fields: name, phone, license_number, status, vehicle_assignment, etc.

CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'on_trip', 'off_duty', 'unavailable')),
    assigned_vehicle TEXT,
    total_trips INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.drivers IS 'Stores driver information and their assignments';
COMMENT ON COLUMN public.drivers.name IS 'Driver full name';
COMMENT ON COLUMN public.drivers.phone IS 'Driver contact phone number';
COMMENT ON COLUMN public.drivers.license_number IS 'Driver license number (unique)';
COMMENT ON COLUMN public.drivers.status IS 'Driver status: available, on_trip, off_duty, unavailable';
COMMENT ON COLUMN public.drivers.assigned_vehicle IS 'Currently assigned vehicle registration number';
COMMENT ON COLUMN public.drivers.total_trips IS 'Total number of trips completed by driver';
COMMENT ON COLUMN public.drivers.rating IS 'Driver rating (0.00 to 5.00)';
COMMENT ON COLUMN public.drivers.joined_date IS 'Date when driver joined';
COMMENT ON COLUMN public.drivers.created_at IS 'Timestamp when driver record was created';
COMMENT ON COLUMN public.drivers.updated_at IS 'Timestamp when driver record was last updated';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_drivers_phone ON public.drivers(phone);
CREATE INDEX IF NOT EXISTS idx_drivers_license_number ON public.drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_assigned_vehicle ON public.drivers(assigned_vehicle);
CREATE INDEX IF NOT EXISTS idx_drivers_created_at ON public.drivers(created_at DESC);

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_drivers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON public.drivers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_drivers_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on drivers table
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for admin panel)
CREATE POLICY "Allow public read access to drivers" ON public.drivers
    FOR SELECT
    USING (true);

-- Allow service role full access (for backend operations)
CREATE POLICY "Allow service role full access to drivers" ON public.drivers
    FOR ALL
    USING (auth.role() = 'service_role');

-- Allow authenticated users full access (for admin operations)
CREATE POLICY "Allow authenticated users full access to drivers" ON public.drivers
    FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON TABLE public.drivers TO anon;
GRANT SELECT ON TABLE public.drivers TO authenticated;
GRANT ALL ON TABLE public.drivers TO service_role;

-- =====================================================
-- VERIFICATION QUERY (Optional - for testing)
-- =====================================================

-- Check drivers table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'drivers'
-- ORDER BY ordinal_position;

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================

