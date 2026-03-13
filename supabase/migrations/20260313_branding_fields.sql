-- Migration to support Branding (White Label)
-- Adds fields for company name and logo to the profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
ADD COLUMN IF NOT EXISTS company_primary_color TEXT DEFAULT '#10b981';

-- Comment explaining the flags
COMMENT ON COLUMN public.profiles.company_logo_url IS 'URL for the company logo used in PDFs and exports (Pro Plan).';
COMMENT ON COLUMN public.profiles.company_primary_color IS 'Primary brand color for PDF and reports customization.';
