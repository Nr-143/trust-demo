-- ==============================================================================
-- MANNIN MAINDHAN GRAMA ARAKKATTALAI - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Phase 1: Contact Enquiries, Volunteer Applications, and Career Applications
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CONTACT ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'archived')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. VOLUNTEER APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_opportunity TEXT NOT NULL,
    area TEXT DEFAULT 'General Grassroots Village Assistance',
    skills TEXT NOT NULL,
    availability TEXT NOT NULL DEFAULT 'Weekend / Flexible',
    message TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Reviewed', 'Contacted', 'Accepted', 'Rejected', 'pending', 'approved', 'archived')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CAREER / JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_id TEXT NOT NULL,
    career_title TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    experience TEXT DEFAULT '',
    skills TEXT DEFAULT '',
    message TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Reviewed', 'Contacted', 'Shortlisted', 'Rejected')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. AUTHORIZED ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.authorized_admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. HELPER FUNCTION: Check if caller is authenticated admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.role() = 'authenticated' AND (
      EXISTS (SELECT 1 FROM public.authorized_admins WHERE id = auth.uid()) OR
      NOT EXISTS (SELECT 1 FROM public.authorized_admins) -- Allow initial admin user on setup
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_admins ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 8. RLS POLICIES FOR CONTACT ENQUIRIES
-- ==============================================================================
-- Public users can only INSERT valid enquiries; they CANNOT read, update, or delete
DROP POLICY IF EXISTS "Public can submit contact enquiries" ON public.contact_enquiries;
CREATE POLICY "Public can submit contact enquiries"
    ON public.contact_enquiries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        length(trim(name)) >= 2 AND
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
        length(trim(subject)) >= 3 AND
        length(trim(message)) >= 10
    );

-- Only authenticated admins can view contact enquiries
DROP POLICY IF EXISTS "Admins can view contact enquiries" ON public.contact_enquiries;
CREATE POLICY "Admins can view contact enquiries"
    ON public.contact_enquiries
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Only authenticated admins can update enquiry status
DROP POLICY IF EXISTS "Admins can update contact enquiries" ON public.contact_enquiries;
CREATE POLICY "Admins can update contact enquiries"
    ON public.contact_enquiries
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only authenticated admins can delete enquiry records
DROP POLICY IF EXISTS "Admins can delete contact enquiries" ON public.contact_enquiries;
CREATE POLICY "Admins can delete contact enquiries"
    ON public.contact_enquiries
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 9. RLS POLICIES FOR VOLUNTEER APPLICATIONS
-- ==============================================================================
-- Public users can only INSERT valid applications; they CANNOT read other submissions
DROP POLICY IF EXISTS "Public can submit volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Public can submit volunteer applications"
    ON public.volunteer_applications
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        length(trim(name)) >= 2 AND
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
        length(trim(phone)) >= 10 AND
        length(trim(skills)) >= 2
    );

-- Only authenticated admins can view volunteer applications
DROP POLICY IF EXISTS "Admins can view volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Admins can view volunteer applications"
    ON public.volunteer_applications
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Only authenticated admins can update application status
DROP POLICY IF EXISTS "Admins can update volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Admins can update volunteer applications"
    ON public.volunteer_applications
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only authenticated admins can delete volunteer applications
DROP POLICY IF EXISTS "Admins can delete volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Admins can delete volunteer applications"
    ON public.volunteer_applications
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 10. RLS POLICIES FOR JOB APPLICATIONS
-- ==============================================================================
-- Public users can only INSERT valid job applications
DROP POLICY IF EXISTS "Public can submit job applications" ON public.job_applications;
CREATE POLICY "Public can submit job applications"
    ON public.job_applications
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        length(trim(name)) >= 2 AND
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
        length(trim(phone)) >= 10 AND
        length(trim(career_id)) >= 1
    );

-- Only authenticated admins can view job applications
DROP POLICY IF EXISTS "Admins can view job applications" ON public.job_applications;
CREATE POLICY "Admins can view job applications"
    ON public.job_applications
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Only authenticated admins can update job applications
DROP POLICY IF EXISTS "Admins can update job applications" ON public.job_applications;
CREATE POLICY "Admins can update job applications"
    ON public.job_applications
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only authenticated admins can delete job applications
DROP POLICY IF EXISTS "Admins can delete job applications" ON public.job_applications;
CREATE POLICY "Admins can delete job applications"
    ON public.job_applications
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 11. RLS POLICIES FOR AUTHORIZED ADMINS TABLE
-- ==============================================================================
DROP POLICY IF EXISTS "Admins can read authorized admins" ON public.authorized_admins;
CREATE POLICY "Admins can read authorized admins"
    ON public.authorized_admins
    FOR SELECT
    TO authenticated
    USING (true);

-- ==============================================================================
-- 12. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_submitted ON public.contact_enquiries(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_status ON public.contact_enquiries(status);

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_submitted ON public.volunteer_applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON public.volunteer_applications(status);

CREATE INDEX IF NOT EXISTS idx_job_applications_submitted ON public.job_applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_career ON public.job_applications(career_id);

