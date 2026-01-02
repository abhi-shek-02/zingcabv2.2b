-- =====================================================
-- Fix payment_status CHECK constraint on bookingtable
-- =====================================================
-- This script updates the payment_status constraint to allow
-- the correct values: 'pending', 'partial', 'paid', 'refunded'
-- 
-- Created: January 2026
-- Branch: backend
-- =====================================================

-- Drop the existing constraint if it exists
ALTER TABLE public.bookingtable 
DROP CONSTRAINT IF EXISTS bookingtable_payment_status_check;

-- Add the correct constraint with proper values
ALTER TABLE public.bookingtable 
ADD CONSTRAINT bookingtable_payment_status_check 
CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded'));

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================

