-- =====================================================
-- Contacts Table Database Schema
-- =====================================================
-- This script creates the contacts table for storing
-- contact form submissions in ZingCab
-- 
-- Created: December 2024
-- Branch: backend
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: contacts
-- =====================================================
-- Purpose: Store contact form submissions from website
-- Fields: name, email, phone, message, subject, timestamps

CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.contacts IS 'Stores contact form submissions from website';
COMMENT ON COLUMN public.contacts.name IS 'Contact person name';
COMMENT ON COLUMN public.contacts.email IS 'Contact email address';
COMMENT ON COLUMN public.contacts.phone IS 'Contact phone number (optional)';
COMMENT ON COLUMN public.contacts.message IS 'Contact message/query';
COMMENT ON COLUMN public.contacts.subject IS 'Subject of contact (default: general)';
COMMENT ON COLUMN public.contacts.created_at IS 'Timestamp when contact was submitted';
COMMENT ON COLUMN public.contacts.updated_at IS 'Timestamp when contact was last updated';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_subject ON public.contacts(subject);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contacts_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow public insert access (for contact form submissions)
CREATE POLICY "Allow public insert access to contacts" ON public.contacts
    FOR INSERT
    WITH CHECK (true);

-- Allow service role full access (for admin panel)
CREATE POLICY "Allow service role full access to contacts" ON public.contacts
    FOR ALL
    USING (auth.role() = 'service_role');

-- Allow authenticated users to read their own contacts (if needed in future)
-- For now, only service role can read contacts
CREATE POLICY "Allow authenticated users read access" ON public.contacts
    FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to anon and authenticated roles
GRANT INSERT ON TABLE public.contacts TO anon;
GRANT INSERT ON TABLE public.contacts TO authenticated;
GRANT SELECT ON TABLE public.contacts TO authenticated;
GRANT ALL ON TABLE public.contacts TO service_role;

-- =====================================================
-- VERIFICATION QUERY (Optional - for testing)
-- =====================================================

-- Check contacts table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'contacts'
-- ORDER BY ordinal_position;

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================

