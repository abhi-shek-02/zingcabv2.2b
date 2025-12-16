-- =====================================================
-- Zone-Based Pricing Database Schema
-- =====================================================
-- This script creates the zones and zone_pricing tables
-- for implementing zone-based pricing in ZingCab
-- 
-- Created: December 2024
-- Branch: backend
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: zones
-- =====================================================
-- Purpose: Store zone definitions (city centers with coordinates)
-- Each zone represents a 20km radius around a city center

CREATE TABLE IF NOT EXISTS public.zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_name TEXT NOT NULL UNIQUE,
    center_lat NUMERIC(10,7) NOT NULL,
    center_lng NUMERIC(10,7) NOT NULL,
    radius_km NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.zones IS 'Stores zone definitions (city centers with 20km radius)';
COMMENT ON COLUMN public.zones.zone_name IS 'Zone name (e.g., "Kolkata", "Kharagpur")';
COMMENT ON COLUMN public.zones.center_lat IS 'Latitude of zone center';
COMMENT ON COLUMN public.zones.center_lng IS 'Longitude of zone center';
COMMENT ON COLUMN public.zones.radius_km IS 'Radius in kilometers (default 20km)';
COMMENT ON COLUMN public.zones.is_active IS 'Whether zone is currently active';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_zones_zone_name ON public.zones(zone_name);
CREATE INDEX IF NOT EXISTS idx_zones_is_active ON public.zones(is_active);
CREATE INDEX IF NOT EXISTS idx_zones_location ON public.zones(center_lat, center_lng);

-- =====================================================
-- TABLE 2: zone_pricing
-- =====================================================
-- Purpose: Store fixed prices for zone-to-zone routes
-- Supports bidirectional pricing (A→B = B→A)

CREATE TABLE IF NOT EXISTS public.zone_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
    to_zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
    car_type TEXT NOT NULL,
    fixed_price NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_zone_pricing UNIQUE (from_zone_id, to_zone_id, car_type)
);

-- Add comments for documentation
COMMENT ON TABLE public.zone_pricing IS 'Stores fixed prices for zone-to-zone routes';
COMMENT ON COLUMN public.zone_pricing.from_zone_id IS 'Source zone (FK to zones.id)';
COMMENT ON COLUMN public.zone_pricing.to_zone_id IS 'Destination zone (FK to zones.id)';
COMMENT ON COLUMN public.zone_pricing.car_type IS 'Car type (sedan, suv, hatchback, crysta, scorpio)';
COMMENT ON COLUMN public.zone_pricing.fixed_price IS 'Fixed price in INR';
COMMENT ON COLUMN public.zone_pricing.is_active IS 'Whether pricing is currently active';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_zone_pricing_from_zone ON public.zone_pricing(from_zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_pricing_to_zone ON public.zone_pricing(to_zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_pricing_car_type ON public.zone_pricing(car_type);
CREATE INDEX IF NOT EXISTS idx_zone_pricing_is_active ON public.zone_pricing(is_active);
-- Composite index for fast bidirectional lookups
CREATE INDEX IF NOT EXISTS idx_zone_pricing_lookup ON public.zone_pricing(from_zone_id, to_zone_id, car_type, is_active);
CREATE INDEX IF NOT EXISTS idx_zone_pricing_reverse_lookup ON public.zone_pricing(to_zone_id, from_zone_id, car_type, is_active);

-- =====================================================
-- TRIGGER: Auto-update updated_at for zones
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_zones_updated_at
    BEFORE UPDATE ON public.zones
    FOR EACH ROW
    EXECUTE FUNCTION public.update_zones_updated_at();

-- =====================================================
-- TRIGGER: Auto-update updated_at for zone_pricing
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_zone_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_zone_pricing_updated_at
    BEFORE UPDATE ON public.zone_pricing
    FOR EACH ROW
    EXECUTE FUNCTION public.update_zone_pricing_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on zones table
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active zones (for API)
CREATE POLICY "Allow public read access to active zones" ON public.zones
    FOR SELECT
    USING (is_active = true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to zones" ON public.zones
    FOR ALL
    USING (auth.role() = 'service_role');

-- Enable RLS on zone_pricing table
ALTER TABLE public.zone_pricing ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active pricing (for API)
CREATE POLICY "Allow public read access to active zone pricing" ON public.zone_pricing
    FOR SELECT
    USING (is_active = true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to zone pricing" ON public.zone_pricing
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON TABLE public.zones TO anon;
GRANT SELECT ON TABLE public.zones TO authenticated;
GRANT ALL ON TABLE public.zones TO service_role;

GRANT SELECT ON TABLE public.zone_pricing TO anon;
GRANT SELECT ON TABLE public.zone_pricing TO authenticated;
GRANT ALL ON TABLE public.zone_pricing TO service_role;

-- =====================================================
-- INITIAL DATA: Insert Zones
-- =====================================================
-- Zone coordinates for West Bengal cities
-- Radius: 20km (default)

INSERT INTO public.zones (zone_name, center_lat, center_lng, radius_km, is_active) VALUES
    ('Kolkata', 22.5726, 88.3639, 20.00, true),
    ('Kharagpur', 22.3460, 87.2320, 20.00, true),
    ('Digha', 21.6269, 87.5090, 20.00, true),
    ('Durgapur', 23.5204, 87.3119, 20.00, true),
    ('Asansol', 23.6739, 86.9524, 20.00, true),
    ('Haldia', 22.0257, 88.0583, 20.00, true),
    ('Contai', 21.7797, 87.7486, 20.00, true),
    ('Mandarmani', 21.6800, 87.6500, 20.00, true),
    ('Tarapith', 23.9833, 87.6833, 20.00, true),
    ('Mayapur', 23.4250, 88.3917, 20.00, true),
    ('Shantiniketan', 23.6800, 87.6800, 20.00, true),
    ('Gangasagar', 21.6500, 88.0833, 20.00, true),
    ('Bakkhali', 21.5667, 88.2500, 20.00, true),
    ('Kakdwip', 21.8833, 88.1833, 20.00, true),
    ('Kolaghat', 22.4333, 87.8667, 20.00, true)
ON CONFLICT (zone_name) DO NOTHING;

-- =====================================================
-- INITIAL DATA: Insert Zone Pricing
-- =====================================================
-- Pricing data from Pricing.tsx routes
-- Note: We'll insert both directions (A→B and B→A) for bidirectional support

-- Helper function to get zone ID by name
DO $$
DECLARE
    kolkata_id UUID;
    kharagpur_id UUID;
    digha_id UUID;
    durgapur_id UUID;
    asansol_id UUID;
    haldia_id UUID;
    contai_id UUID;
    mandarmani_id UUID;
    tarapith_id UUID;
    mayapur_id UUID;
    shantiniketan_id UUID;
    gangasagar_id UUID;
    bakkhali_id UUID;
    kakdwip_id UUID;
    kolaghat_id UUID;
BEGIN
    -- Get zone IDs
    SELECT id INTO kolkata_id FROM public.zones WHERE zone_name = 'Kolkata';
    SELECT id INTO kharagpur_id FROM public.zones WHERE zone_name = 'Kharagpur';
    SELECT id INTO digha_id FROM public.zones WHERE zone_name = 'Digha';
    SELECT id INTO durgapur_id FROM public.zones WHERE zone_name = 'Durgapur';
    SELECT id INTO asansol_id FROM public.zones WHERE zone_name = 'Asansol';
    SELECT id INTO haldia_id FROM public.zones WHERE zone_name = 'Haldia';
    SELECT id INTO contai_id FROM public.zones WHERE zone_name = 'Contai';
    SELECT id INTO mandarmani_id FROM public.zones WHERE zone_name = 'Mandarmani';
    SELECT id INTO tarapith_id FROM public.zones WHERE zone_name = 'Tarapith';
    SELECT id INTO mayapur_id FROM public.zones WHERE zone_name = 'Mayapur';
    SELECT id INTO shantiniketan_id FROM public.zones WHERE zone_name = 'Shantiniketan';
    SELECT id INTO gangasagar_id FROM public.zones WHERE zone_name = 'Gangasagar';
    SELECT id INTO bakkhali_id FROM public.zones WHERE zone_name = 'Bakkhali';
    SELECT id INTO kakdwip_id FROM public.zones WHERE zone_name = 'Kakdwip';
    SELECT id INTO kolaghat_id FROM public.zones WHERE zone_name = 'Kolaghat';

    -- Kolkata → Digha (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, digha_id, 'sedan', 3699.00, true),
        (kolkata_id, digha_id, 'suv', 4499.00, true),
        (digha_id, kolkata_id, 'sedan', 3699.00, true),
        (digha_id, kolkata_id, 'suv', 4499.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Mandarmani (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, mandarmani_id, 'sedan', 3699.00, true),
        (kolkata_id, mandarmani_id, 'suv', 4499.00, true),
        (mandarmani_id, kolkata_id, 'sedan', 3699.00, true),
        (mandarmani_id, kolkata_id, 'suv', 4499.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Contai (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, contai_id, 'sedan', 2399.00, true),
        (kolkata_id, contai_id, 'suv', 3499.00, true),
        (contai_id, kolkata_id, 'sedan', 2399.00, true),
        (contai_id, kolkata_id, 'suv', 3499.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Kharagpur (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, kharagpur_id, 'sedan', 2399.00, true),
        (kolkata_id, kharagpur_id, 'suv', 3499.00, true),
        (kharagpur_id, kolkata_id, 'sedan', 2399.00, true),
        (kharagpur_id, kolkata_id, 'suv', 3499.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Asansol (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, asansol_id, 'sedan', 3699.00, true),
        (kolkata_id, asansol_id, 'suv', 4899.00, true),
        (asansol_id, kolkata_id, 'sedan', 3699.00, true),
        (asansol_id, kolkata_id, 'suv', 4899.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Durgapur (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, durgapur_id, 'sedan', 3399.00, true),
        (kolkata_id, durgapur_id, 'suv', 4499.00, true),
        (durgapur_id, kolkata_id, 'sedan', 3399.00, true),
        (durgapur_id, kolkata_id, 'suv', 4499.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Tarapith (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, tarapith_id, 'sedan', 4699.00, true),
        (kolkata_id, tarapith_id, 'suv', 5699.00, true),
        (tarapith_id, kolkata_id, 'sedan', 4699.00, true),
        (tarapith_id, kolkata_id, 'suv', 5699.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Mayapur (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, mayapur_id, 'sedan', 3499.00, true),
        (kolkata_id, mayapur_id, 'suv', 4499.00, true),
        (mayapur_id, kolkata_id, 'sedan', 3499.00, true),
        (mayapur_id, kolkata_id, 'suv', 4499.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Haldia (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, haldia_id, 'sedan', 2999.00, true),
        (kolkata_id, haldia_id, 'suv', 3699.00, true),
        (haldia_id, kolkata_id, 'sedan', 2999.00, true),
        (haldia_id, kolkata_id, 'suv', 3699.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Shantiniketan (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, shantiniketan_id, 'sedan', 3699.00, true),
        (kolkata_id, shantiniketan_id, 'suv', 4999.00, true),
        (shantiniketan_id, kolkata_id, 'sedan', 3699.00, true),
        (shantiniketan_id, kolkata_id, 'suv', 4999.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Gangasagar (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, gangasagar_id, 'sedan', 2999.00, true),
        (kolkata_id, gangasagar_id, 'suv', 3999.00, true),
        (gangasagar_id, kolkata_id, 'sedan', 2999.00, true),
        (gangasagar_id, kolkata_id, 'suv', 3999.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Bakkhali (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, bakkhali_id, 'sedan', 2999.00, true),
        (kolkata_id, bakkhali_id, 'suv', 3999.00, true),
        (bakkhali_id, kolkata_id, 'sedan', 2999.00, true),
        (bakkhali_id, kolkata_id, 'suv', 3999.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Kakdwip (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, kakdwip_id, 'sedan', 2999.00, true),
        (kolkata_id, kakdwip_id, 'suv', 3999.00, true),
        (kakdwip_id, kolkata_id, 'sedan', 2999.00, true),
        (kakdwip_id, kolkata_id, 'suv', 3999.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;

    -- Kolkata → Kolaghat (both directions)
    INSERT INTO public.zone_pricing (from_zone_id, to_zone_id, car_type, fixed_price, is_active) VALUES
        (kolkata_id, kolaghat_id, 'sedan', 1999.00, true),
        (kolkata_id, kolaghat_id, 'suv', 2499.00, true),
        (kolaghat_id, kolkata_id, 'sedan', 1999.00, true),
        (kolaghat_id, kolkata_id, 'suv', 2499.00, true)
    ON CONFLICT (from_zone_id, to_zone_id, car_type) DO NOTHING;
END $$;

-- =====================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- =====================================================

-- Check zones created
-- SELECT zone_name, center_lat, center_lng, radius_km, is_active FROM public.zones ORDER BY zone_name;

-- Check zone pricing created
-- SELECT 
--     z1.zone_name as from_zone,
--     z2.zone_name as to_zone,
--     zp.car_type,
--     zp.fixed_price
-- FROM public.zone_pricing zp
-- JOIN public.zones z1 ON zp.from_zone_id = z1.id
-- JOIN public.zones z2 ON zp.to_zone_id = z2.id
-- WHERE zp.is_active = true
-- ORDER BY z1.zone_name, z2.zone_name, zp.car_type;

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================

