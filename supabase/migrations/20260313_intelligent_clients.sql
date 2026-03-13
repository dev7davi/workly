-- Migration to support Intelligent Client Registration
-- Adds flags to identify clients created automatically from a service

ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS created_from_service BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS registration_origin TEXT DEFAULT 'manual';

-- Comment explaining the flags
COMMENT ON COLUMN public.clients.created_from_service IS 'True if the client was created automatically during a new service creation.';
COMMENT ON COLUMN public.clients.profile_completed IS 'False if the client record is missing essential details like email/phone.';
COMMENT ON COLUMN public.clients.registration_origin IS 'Origin of the registration: manual, service, or import.';
