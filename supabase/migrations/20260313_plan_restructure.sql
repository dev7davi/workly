-- Add values to user_plan enum
-- Note: PostgreSQL doesn't support IF NOT EXISTS for ADD VALUE directly in some versions, 
-- but we can use a DO block to make it idempotent.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_plan' AND e.enumlabel = 'start') THEN
        ALTER TYPE public.user_plan ADD VALUE 'start';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_plan' AND e.enumlabel = 'pro_plus') THEN
        ALTER TYPE public.user_plan ADD VALUE 'pro_plus';
    END IF;
END $$;

-- Add columns to profiles for plan tracking and limits
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS clients_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS services_created_this_month INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Function to update clients count
CREATE OR REPLACE FUNCTION public.update_clients_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET clients_count = clients_count + 1 
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET clients_count = clients_count - 1 
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for clients count
DROP TRIGGER IF EXISTS update_profile_clients_count ON public.clients;
CREATE TRIGGER update_profile_clients_count
  AFTER INSERT OR DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_clients_count();

-- Updated function for services counts (includes monthly limit anti-burla)
CREATE OR REPLACE FUNCTION public.update_services_count()
RETURNS TRIGGER AS $$
DECLARE
    v_last_reset TIMESTAMP WITH TIME ZONE;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get last reset date
    SELECT last_reset_date INTO v_last_reset FROM public.profiles WHERE user_id = NEW.user_id;
    
    -- Check if we need to reset (new month)
    IF v_last_reset IS NULL OR date_trunc('month', v_last_reset) < date_trunc('month', now()) THEN
        UPDATE public.profiles 
        SET 
            services_count = services_count + 1,
            services_created_this_month = 1,
            last_reset_date = now()
        WHERE user_id = NEW.user_id;
    ELSE
        UPDATE public.profiles 
        SET 
            services_count = services_count + 1,
            services_created_this_month = services_created_this_month + 1 
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Note: We DON'T decrement services_created_this_month on delete (per requirements)
    UPDATE public.profiles 
    SET services_count = services_count - 1 
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure trigger is correctly bound (it might already exist from migration 1)
DROP TRIGGER IF EXISTS update_profile_services_count ON public.services;
CREATE TRIGGER update_profile_services_count
  AFTER INSERT OR DELETE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_services_count();

-- Initial sync: Re-calculate current counts for all existing users
UPDATE public.profiles p
SET 
  clients_count = (SELECT count(*) FROM public.clients c WHERE c.user_id = p.user_id),
  services_count = (SELECT count(*) FROM public.services s WHERE s.user_id = p.user_id),
  services_created_this_month = (
    SELECT count(*) FROM public.services s 
    WHERE s.user_id = p.user_id 
    AND s.created_at >= date_trunc('month', now())
  );
