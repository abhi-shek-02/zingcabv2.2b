-- =====================================================
-- Vehicles Table Database Schema
-- =====================================================
-- This script creates the vehicles table for storing
-- vehicle information and assignments in ZingCab
-- 
-- Created: December 2024
-- Branch: backend
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: vehicles
-- =====================================================
-- Purpose: Store vehicle information and their assignments
-- Fields: registration_number, car_type, model, status, assigned_driver, etc.

CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number TEXT NOT NULL UNIQUE,
    car_type TEXT NOT NULL CHECK (car_type IN ('Sedan', 'SUV', 'Hatchback', 'Innova Crysta', 'Scorpio')),
    model TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'unavailable')),
    assigned_driver TEXT,
    total_trips INTEGER NOT NULL DEFAULT 0,
    last_service_date DATE,
    next_service_date DATE,
    fuel_type TEXT NOT NULL DEFAULT 'Petrol' CHECK (fuel_type IN ('Petrol', 'Diesel', 'Electric', 'CNG')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.vehicles IS 'Stores vehicle information and their assignments';
COMMENT ON COLUMN public.vehicles.registration_number IS 'Vehicle registration number (unique)';
COMMENT ON COLUMN public.vehicles.car_type IS 'Car type: Sedan, SUV, Hatchback, Innova Crysta, Scorpio';
COMMENT ON COLUMN public.vehicles.model IS 'Vehicle model (e.g., Sedan 2020)';
COMMENT ON COLUMN public.vehicles.status IS 'Vehicle status: available, assigned, maintenance, unavailable';
COMMENT ON COLUMN public.vehicles.assigned_driver IS 'Currently assigned driver name or ID';
COMMENT ON COLUMN public.vehicles.total_trips IS 'Total number of trips completed by vehicle';
COMMENT ON COLUMN public.vehicles.last_service_date IS 'Date of last service';
COMMENT ON COLUMN public.vehicles.next_service_date IS 'Date of next scheduled service';
COMMENT ON COLUMN public.vehicles.fuel_type IS 'Fuel type: Petrol, Diesel, Electric, CNG';
COMMENT ON COLUMN public.vehicles.created_at IS 'Timestamp when vehicle record was created';
COMMENT ON COLUMN public.vehicles.updated_at IS 'Timestamp when vehicle record was last updated';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_registration_number ON public.vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_car_type ON public.vehicles(car_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_assigned_driver ON public.vehicles(assigned_driver);
CREATE INDEX IF NOT EXISTS idx_vehicles_next_service_date ON public.vehicles(next_service_date);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON public.vehicles(created_at DESC);

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_vehicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vehicles_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on vehicles table
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for admin panel)
CREATE POLICY "Allow public read access to vehicles" ON public.vehicles
    FOR SELECT
    USING (true);

-- Allow service role full access (for backend operations)
CREATE POLICY "Allow service role full access to vehicles" ON public.vehicles
    FOR ALL
    USING (auth.role() = 'service_role');

-- Allow authenticated users full access (for admin operations)
CREATE POLICY "Allow authenticated users full access to vehicles" ON public.vehicles
    FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON TABLE public.vehicles TO anon;
GRANT SELECT ON TABLE public.vehicles TO authenticated;
GRANT ALL ON TABLE public.vehicles TO service_role;

-- =====================================================
-- VERIFICATION QUERY (Optional - for testing)
-- =====================================================

-- Check vehicles table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'vehicles'
-- ORDER BY ordinal_position;

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================

