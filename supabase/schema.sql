-- ==============================================================================
-- MANNIN MAINDHAN GRAMA ARAKKATTALAI - COMPLETE SUPABASE DATABASE SCHEMA & RLS
-- Comprehensive Schema: Site Content, Programmes, Campaigns, Impact, Gallery,
-- Careers, Donation Pledges, Volunteer Applications, Enquiries & Storage.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. AUTHORIZED ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.authorized_admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. HELPER FUNCTION: Check if caller is authenticated admin
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

-- 4. SITE CONTENT TABLE (Global website info, hero, mission, vision, contact)
CREATE TABLE IF NOT EXISTS public.site_content (
    id TEXT PRIMARY KEY DEFAULT 'main',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. PROGRAMMES TABLE (6 core developmental verticals)
CREATE TABLE IF NOT EXISTS public.programmes (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    full_title TEXT,
    title_tamil TEXT,
    category TEXT NOT NULL,
    icon TEXT,
    image_url TEXT,
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    cloudinary_public_id TEXT,
    media_gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT,
    details TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.programmes
    ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image'
        CHECK (media_type IN ('image', 'video')),
    ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT,
    ADD COLUMN IF NOT EXISTS media_gallery JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 6. CAMPAIGNS TABLE (Grassroots funding campaigns)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    full_title TEXT,
    category TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    full_description TEXT,
    goal_amount NUMERIC NOT NULL DEFAULT 0,
    raised_amount NUMERIC NOT NULL DEFAULT 0,
    donors_count INT NOT NULL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    image_url TEXT,
    cloudinary_public_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'draft')),
    publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('published', 'draft', 'archived')),
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;

-- 7. IMPACT METRICS TABLE
CREATE TABLE IF NOT EXISTS public.impact_metrics (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. GALLERY ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Events',
    image_url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    cloudinary_public_id TEXT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.gallery_items
    ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;

-- 9. CAREERS / JOB POSTINGS TABLE
CREATE TABLE IF NOT EXISTS public.careers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Full-time',
    description TEXT NOT NULL,
    skills TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft', 'archived')),
    publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('published', 'draft', 'archived')),
    posted_date TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 10. DONATION PLEDGES TABLE (Verified donor pledges / inquiries)
CREATE TABLE IF NOT EXISTS public.donation_pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT,
    campaign_title TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    donor_phone TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pledged' CHECK (status IN ('pledged', 'contacted', 'fulfilled', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 11. CONTACT ENQUIRIES TABLE
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

-- 12. VOLUNTEER APPLICATIONS TABLE
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

-- 13. CAREER / JOB APPLICATIONS TABLE
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

-- ==============================================================================
-- 14. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.authorized_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 15. RLS POLICIES
-- ==============================================================================

-- A. Authorized Admins
DROP POLICY IF EXISTS "Admins can read authorized admins" ON public.authorized_admins;
CREATE POLICY "Admins can read authorized admins" ON public.authorized_admins FOR SELECT TO authenticated USING (true);

-- B. Site Content
DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
CREATE POLICY "Public can view site content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage site content" ON public.site_content;
CREATE POLICY "Admins can manage site content" ON public.site_content FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- C. Programmes
DROP POLICY IF EXISTS "Public can view published programmes" ON public.programmes;
CREATE POLICY "Public can view published programmes" ON public.programmes FOR SELECT TO anon, authenticated USING (status != 'archived');

DROP POLICY IF EXISTS "Admins can manage programmes" ON public.programmes;
CREATE POLICY "Admins can manage programmes" ON public.programmes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- D. Campaigns
DROP POLICY IF EXISTS "Public can view published campaigns" ON public.campaigns;
CREATE POLICY "Public can view published campaigns" ON public.campaigns FOR SELECT TO anon, authenticated USING (publication_status = 'published' OR status = 'active');

DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;
CREATE POLICY "Admins can manage campaigns" ON public.campaigns FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- E. Impact Metrics
DROP POLICY IF EXISTS "Public can view impact metrics" ON public.impact_metrics;
CREATE POLICY "Public can view impact metrics" ON public.impact_metrics FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage impact metrics" ON public.impact_metrics;
CREATE POLICY "Admins can manage impact metrics" ON public.impact_metrics FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- F. Gallery Items
DROP POLICY IF EXISTS "Public can view published gallery items" ON public.gallery_items;
CREATE POLICY "Public can view published gallery items" ON public.gallery_items FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage gallery items" ON public.gallery_items;
CREATE POLICY "Admins can manage gallery items" ON public.gallery_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- G. Careers
DROP POLICY IF EXISTS "Public can view open careers" ON public.careers;
CREATE POLICY "Public can view open careers" ON public.careers FOR SELECT TO anon, authenticated USING (status = 'open' AND publication_status = 'published');

DROP POLICY IF EXISTS "Admins can manage careers" ON public.careers;
CREATE POLICY "Admins can manage careers" ON public.careers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- H. Donation Pledges
DROP POLICY IF EXISTS "Public can submit donation pledges" ON public.donation_pledges;
CREATE POLICY "Public can submit donation pledges" ON public.donation_pledges FOR INSERT TO anon, authenticated WITH CHECK (
    amount > 0 AND
    length(trim(donor_name)) >= 2 AND
    donor_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

DROP POLICY IF EXISTS "Admins can manage donation pledges" ON public.donation_pledges;
CREATE POLICY "Admins can manage donation pledges" ON public.donation_pledges FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- I. Contact Enquiries
DROP POLICY IF EXISTS "Public can submit contact enquiries" ON public.contact_enquiries;
CREATE POLICY "Public can submit contact enquiries" ON public.contact_enquiries FOR INSERT TO anon, authenticated WITH CHECK (
    length(trim(name)) >= 2 AND
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    length(trim(subject)) >= 3 AND
    length(trim(message)) >= 10
);

DROP POLICY IF EXISTS "Admins can view contact enquiries" ON public.contact_enquiries;
CREATE POLICY "Admins can view contact enquiries" ON public.contact_enquiries FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update contact enquiries" ON public.contact_enquiries;
CREATE POLICY "Admins can update contact enquiries" ON public.contact_enquiries FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete contact enquiries" ON public.contact_enquiries;
CREATE POLICY "Admins can delete contact enquiries" ON public.contact_enquiries FOR DELETE TO authenticated USING (public.is_admin());

-- J. Volunteer Applications
DROP POLICY IF EXISTS "Public can submit volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Public can submit volunteer applications" ON public.volunteer_applications FOR INSERT TO anon, authenticated WITH CHECK (
    length(trim(name)) >= 2 AND
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    length(trim(phone)) >= 10 AND
    length(trim(skills)) >= 2
);

DROP POLICY IF EXISTS "Admins can view volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Admins can view volunteer applications" ON public.volunteer_applications FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Admins can update volunteer applications" ON public.volunteer_applications FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Admins can delete volunteer applications" ON public.volunteer_applications FOR DELETE TO authenticated USING (public.is_admin());

-- K. Job Applications
DROP POLICY IF EXISTS "Public can submit job applications" ON public.job_applications;
CREATE POLICY "Public can submit job applications" ON public.job_applications FOR INSERT TO anon, authenticated WITH CHECK (
    length(trim(name)) >= 2 AND
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    length(trim(phone)) >= 10 AND
    length(trim(career_id)) >= 1
);

DROP POLICY IF EXISTS "Admins can view job applications" ON public.job_applications;
CREATE POLICY "Admins can view job applications" ON public.job_applications FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update job applications" ON public.job_applications;
CREATE POLICY "Admins can update job applications" ON public.job_applications FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete job applications" ON public.job_applications;
CREATE POLICY "Admins can delete job applications" ON public.job_applications FOR DELETE TO authenticated USING (public.is_admin());

-- ==============================================================================
-- 16. STORAGE BUCKET & POLICIES (FOR GALLERY & MEDIA)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-media', 'gallery-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view gallery media" ON storage.objects;
CREATE POLICY "Public can view gallery media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery-media');

DROP POLICY IF EXISTS "Admins can manage gallery media" ON storage.objects;
CREATE POLICY "Admins can manage gallery media" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'gallery-media' AND public.is_admin()) WITH CHECK (bucket_id = 'gallery-media' AND public.is_admin());

-- ==============================================================================
-- 17. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_programmes_slug ON public.programmes(slug);
CREATE INDEX IF NOT EXISTS idx_programmes_status ON public.programmes(status);

CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON public.campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

CREATE INDEX IF NOT EXISTS idx_gallery_status ON public.gallery_items(status);
CREATE INDEX IF NOT EXISTS idx_careers_status ON public.careers(status);

CREATE INDEX IF NOT EXISTS idx_pledges_campaign ON public.donation_pledges(campaign_id);
CREATE INDEX IF NOT EXISTS idx_pledges_created ON public.donation_pledges(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_enquiries_submitted ON public.contact_enquiries(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_submitted ON public.volunteer_applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_submitted ON public.job_applications(submitted_at DESC);

-- ==============================================================================
-- 18. INITIAL VERIFIED SEED DATA (SAFE: ON CONFLICT DO NOTHING)
-- ==============================================================================

-- Site Content
INSERT INTO public.site_content (id, data)
VALUES ('main', '{"name":"Mannin Maindhan Grama Arakkattalai","nameTamil":"மண்ணின் மைந்தன் கிராம அறக்கட்டளை","shortName":"MMG Trust","tagline":"Building Stronger Villages. Creating Lasting Change.","taglineTamil":"கிராம சமூகங்களை மேம்படுத்துதல், வாழ்க்கையை வளப்படுத்துதல்","heroHeading":"Building Stronger Villages. Creating Lasting Change.","heroSubheading":"Working alongside rural communities to improve access to education, clean water, healthcare, livelihoods, and a sustainable future.","email":"sonofsoiltrust@gmail.com","phone":"+91 9994291195","phoneFormatted":"+91 99942 91195","phoneRaw":"+919994291195","whatsappNumber":"919994291195","whatsappUrl":"https://wa.me/919994291195?text=Hello%20Mannin%20Maindhan%20Grama%20Arakkattalai%2C%20I%20would%20like%20to%20connect%20with%20your%20team.","address":"2/119, Eruthukuttahalli village, Palacode taluk, Dharmapuri - 636808","locationShort":"Palacode, Dharmapuri - 636808","district":"Dharmapuri","state":"Tamil Nadu","pincode":"636808","founded":"2024","logoFull":"/images/originalLogo.jpeg","logoBadge":"/images/originalLogo.jpeg","heroImage":"/images/hero-village.jpg","missionStatement":"To empower rural communities across Dharmapuri and Tamil Nadu by providing sustainable access to quality education, safe drinking water, holistic healthcare, drug awareness, and eco-friendly livelihood solutions.","visionStatement":"A self-reliant, enlightened, and healthy rural society where every village community thrives in harmony with nature and enjoys equitable opportunities.","announcementBanner":"🌱 Monsoon Village Tree Plantation Drive - Join our weekend volunteers in Palacode!","announcementActive":true,"primaryCtaText":"Support Our Mission","secondaryCtaText":"Become a Volunteer","footerAboutText":"A community-rooted charitable trust dedicated to holistic rural development in Dharmapuri and across Tamil Nadu through education, clean water, healthcare, environmental protection, and sustainable livelihoods.","footerCopyright":"Mannin Maindhan Grama Arakkattalai. All rights reserved. Registered Charitable Trust."}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.programmes (id, slug, title, full_title, title_tamil, category, icon, image_url, description, details, highlights, projects, status, display_order)
VALUES ('prog-education', 'education', 'Education', 'Rural Education & Learning Centres', 'கிராமப்புற கல்வி மேம்பாடு', 'Education', 'GraduationCap', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80', 'Providing supplemental evening tuition, notebooks, learning kits, and mentorship to first-generation students in underserved rural hamlets.', 'Focuses on reducing drop-out rates, promoting foundational literacy and numeracy, and creating safe, well-lit village study spaces.', '["Village Study Centres","Notebook & School Kit Drives","Higher Education Guidance"]'::jsonb, '[{"id":"proj-edu-1","title":"Village Evening Study Support Circles","description":"Organising supervised evening learning circles with volunteer tutors to provide homework assistance and foundational numeracy support for rural school children.","location":"Palacode Taluk (Specific hamlet centres pending trust confirmation)","date":"Proposed Initiative (2025 Cycle)","images":["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80"],"videoUrl":null,"isPlaceholder":true,"placeholderNotice":"Project information will be added after confirmation."},{"id":"proj-edu-2","title":"School Learning Kit & Notebook Support Drive","description":"Annual educational supply drives providing essential writing books, mathematical kits, and school bags to underprivileged students across rural government schools.","location":"Rural schools across Dharmapuri district (Partner schools pending confirmation)","date":"Upcoming Academic Cycle","images":["https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80"],"videoUrl":null,"isPlaceholder":true,"placeholderNotice":"Project information will be added after confirmation."}]'::jsonb, 'active', 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.programmes (id, slug, title, full_title, title_tamil, category, icon, image_url, description, details, highlights, projects, status, display_order)
VALUES ('prog-livelihood-women', 'livelihood-development-women-empowerment', 'Livelihood Development and Women Empowerment', 'Rural Livelihood & Women Empowerment Initiative', 'வாழ்வாதாரம் மற்றும் மகளிர் மேம்பாடு', 'Livelihood Development and Women Empowerment', 'Briefcase', 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80', 'Empowering marginal farmers, women self-help groups, and rural youth with sustainable agricultural methods, vocational skills, and micro-enterprise guidance.', 'Supports women-led self-help micro-enterprises, organic cultivation practices, value addition to local farm produce, and vocational training in tailoring, crafts, and digital skills.', '["Women Self-Help Groups","Organic Farming Workshops","Micro-Enterprise & Skill Training"]'::jsonb, '[{"id":"proj-live-1","title":"Women Self-Help Group Tailoring & Handicrafts Collective","description":"Vocational skill-building modules designed to equip rural women with sewing, tailoring, and eco-friendly packaging skills to generate home-based auxiliary income.","location":"Eruthukuttahalli & neighbouring clusters (Centre venue pending confirmation)","date":"Planning Phase (2025)","images":["https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80"],"videoUrl":null,"isPlaceholder":true,"placeholderNotice":"Project information will be added after confirmation."},{"id":"proj-live-2","title":"Dryland Organic Farming & Millet Processing Demonstrations","description":"Hands-on demonstrations for smallholder farmers on organic bio-inputs, traditional millets cultivation, and direct rural market linkages.","location":"Dharmapuri agricultural tracts (Demonstration plots to be confirmed)","date":"Seasonal Agricultural Window","images":["https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80"],"videoUrl":null,"isPlaceholder":true,"placeholderNotice":"Project information will be added after confirmation."}]'::jsonb, 'active', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.programmes (id, slug, title, full_title, title_tamil, category, icon, image_url, description, details, highlights, projects, status, display_order)
VALUES ('prog-drug-free-sports', 'drug-free-communities-sports-development', 'Drug-Free Communities and Sports Development', 'Drug-Free Society & Rural Sports Development', 'போதையற்ற சமமூக மற்றும் விளையாட்டு மேம்பாடு', 'Drug-Free Communities and Sports Development', 'ShieldCheck', 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&auto=format&fit=crop&q=80', 'Conducting anti-substance abuse campaigns, village sports leagues, and peer counselling to foster healthy, empowered, and constructive rural youth.', 'Collaborates with village elders, local schools, and rural youth sports clubs to organize cricket, kabaddi, and athletic tournaments alongside substance abuse awareness workshops.', '["Substance Awareness Drives","Village Sports Leagues","Youth & Family Counselling"]'::jsonb, '[{"id":"proj-sport-1","title":"Annual Rural Youth Kabaddi & Volleyball Tournament","description":"Grassroots athletic tournaments organised across rural hamlets to build physical endurance, cultivate sportsman spirit, and channel youth energy into community sports.","location":"Palacode Community Grounds (Tournament venue pending confirmation)","date":"Upcoming Season","images":["https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80"],"videoUrl":null,"isPlaceholder":true,"placeholderNotice":"Project information will be added after confirmation."},{"id":"proj-sport-2","title":"Substance Abuse Awareness & Youth De-Addiction Counselling","description":"Community awareness campaigns and family counselling sessions aimed at deterring drug and tobacco usage among rural teenagers and young adults.","location":"Village panchayat centres (Schedule to be finalized)","date":"Awareness Campaign Cycle","images":["https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80"],"videoUrl":null,"isPlaceholder":true,"placeholderNotice":"Project information will be added after confirmation."}]'::jsonb, 'active', 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.programmes (id, slug, title, full_title, title_tamil, category, icon, image_url, description, details, highlights, projects, status, display_order)
VALUES ('prog-environment-energy', 'environmental-protection-renewable-energy', 'Environmental Protection and Renewable Energy', 'Afforestation, Biodiversity & Clean Solar Energy', 'சுற்றுச்சூழல் பாதுகாப்பு மற்றும் புதுப்பிக்கத்தக்க ஆற்றல்', 'Environmental Protection and Renewable Energy', 'TreePine', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80', 'Mass plantation of indigenous shade and fruit-bearing trees, seed-ball scattering, and decentralized solar lighting for sustainable rural habitations.', 'Preserves native trees such as Neem, Pungan, Peepal, and Tamarind suited to Dharmapuri climatic conditions, combined with rural solar lighting points and clean energy literacy.', '["Native Tree Plantations","Solar Street Illumination","School Green Clubs"]'::jsonb, '[{"id":"proj-env-1","title":"Native Tree Sapling Plantation & Seed-Ball Dispersal Drive","description":"Mass community planting of indigenous tree varieties suited to semi-arid climates (Neem, Tamarind, Pungan) to enhance green canopy and reduce soil erosion.","location":"Palacode roadsides & village commons (Planting sites pending confirmation)","date":"Monsoon Plantation Schedule","images":["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop&q=80"],"videoUrl":null,"isPlaceholder":true,"placeholderNotice":"Project information will be added after confirmation."},{"id":"proj-env-2","title":"Village Solar Lighting & Clean Energy Literacy","description":"Surveys and installations of standalone solar LED street units in remote hamlet lanes to increase safety and promote renewable energy awareness.","location":"Selected unelectrified hamlet stretches (Site list pending survey)","date":"Technical Survey Phase","images":["https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80"],"videoUrl":null,"isPlaceholder":true,"placeholderNotice":"Project information will be added after confirmation."}]'::jsonb, 'active', 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.programmes (id, slug, title, full_title, title_tamil, category, icon, image_url, description, details, highlights, projects, status, display_order)
VALUES ('prog-sanitation-healthcare', 'sanitation-healthcare', 'Sanitation and Healthcare', 'Rural Sanitation & Community Health Initiatives', 'சுகாதாரம் மற்றும் மருத்துவ நல்வாழ்வு', 'Sanitation and Healthcare', 'HeartPulse', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80', 'Advancing village hygiene, safe sanitation, waste segregation, and conducting preventive health screenings and medical camps in rural hamlets.', 'Combines volunteer-led village cleanliness drives and menstrual hygiene awareness with doorstep health screenings, geriatric checkups, eye camps, and basic medicines.', '["Free Medical Screenings","Village Cleanliness Drives","Hygiene & Health Awareness"]'::jsonb, '[{"id":"proj-san-1","title":"Comprehensive Rural Preventive Health Screening Camp","description":"Free medical camps providing geriatric health assessments, blood pressure checks, diabetes screening, and eye examinations for village elders and farm labourers.","location":"Eruthukuttahalli Community Center (Partner medical team pending confirmation)","date":"Quarterly Medical Schedule","images":["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"],"videoUrl":null,"isPlaceholder":true,"placeholderNotice":"Project information will be added after confirmation."},{"id":"proj-san-2","title":"Village Cleanliness (Shramdaan) & Drain Clearance Initiative","description":"Youth volunteer campaigns to clear stagnant street drain lines, eliminate mosquito breeding grounds, and conduct household hygiene demonstrations.","location":"Selected village wards across Palacode (Ward list to be confirmed)","date":"Community Shramdaan Calendar","images":["https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?w=800&auto=format&fit=crop&q=80"],"videoUrl":null,"isPlaceholder":true,"placeholderNotice":"Project information will be added after confirmation."}]'::jsonb, 'active', 4)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.programmes (id, slug, title, full_title, title_tamil, category, icon, image_url, description, details, highlights, projects, status, display_order)
VALUES ('prog-water-management', 'community-water-management', 'Community Water Management', 'Pond Restoration & Traditional Water Conservation', 'சமூக நீர் மேலாண்மை மற்றும் ஏரி புனரமைப்பு', 'Community Water Management', 'Waves', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80', 'Revitalizing traditional village ponds (oorani), clearing monsoon water inlet channels, and building check dams for groundwater recharge.', 'Re-establishes customary community water stewardship (Kudimaramathu), ensuring agriculture and livestock have sufficient seasonal water reserves.', '["Traditional Pond Desilting","Inflow Channel Clearance","Rainwater Harvesting Checks"]'::jsonb, '[{"id":"proj-wat-1","title":"Traditional Village Pond (Oorani) Revival & Desilting","description":"Deepening historical rain retention ponds and strengthening earthen bunds to augment monsoon water harvesting for domestic cattle and recharge shallow village wells.","location":"Palacode Taluk waterbodies (Oorani registry pending confirmation)","date":"Pre-Monsoon Season","images":["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&auto=format&fit=crop&q=80"],"videoUrl":null,"isPlaceholder":true,"placeholderNotice":"Project information will be added after confirmation."},{"id":"proj-wat-2","title":"Agricultural Feeder Canal Clearance & Scrub Removal","description":"Community-led clearance of invasive Prosopis juliflora and silt blockage along natural irrigation feeder channels to ensure unobstructed monsoon runoff to local tanks.","location":"Village tank canal network (Channel stretch pending verification)","date":"Seasonal Canal Maintenance","images":["https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80"],"videoUrl":null,"isPlaceholder":true,"placeholderNotice":"Project information will be added after confirmation."}]'::jsonb, 'active', 5)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaigns (id, slug, title, full_title, category, description, short_description, full_description, goal_amount, raised_amount, donors_count, start_date, end_date, image_url, status, publication_status, location)
VALUES ('camp-water', 'clean-drinking-water', 'Clean Drinking Water', 'Clean Drinking Water for Remote Village Hamlets', 'Water & Health', 'Help us install solar-powered RO water purification kiosks in 3 drinking water-stressed hamlets in Palacode block to deliver clean, fluoride-safe drinking water.', 'Help us install solar-powered RO water purification kiosks in 3 drinking water-stressed hamlets in Palacode block.', 'Across interior hamlets of Palacode taluk, groundwater frequently exhibits high total dissolved solids (TDS) and excessive fluoride concentrations, posing long-term dental and skeletal health challenges for children and elderly residents.

This project delivers 3 community-operated, solar-powered reverse-osmosis filtration units in Eruthukuttahalli and neighboring rural wards. Each kiosk produces up to 1,000 liters of pristine, mineral-balanced water daily with zero electricity grid dependence. A village water committee oversees distribution, filter maintenance, and quality logs.', 350000, 185000, 142, '2026-08-01', '2027-02-28', 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&auto=format&fit=crop&q=80', 'active', 'published', 'Palacode Block, Dharmapuri')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaigns (id, slug, title, full_title, category, description, short_description, full_description, goal_amount, raised_amount, donors_count, start_date, end_date, image_url, status, publication_status, location)
VALUES ('camp-education', 'education-support', 'Education Support', 'Rural Student Education & Evening Study Kits', 'Education', 'Equipping 5 village evening study centres with study desks, bilingual Tamil-English books, solar study lamps, and basic STEM science demonstration toolkits.', 'Equipping 5 village evening study centres with study desks, bilingual books, solar study lamps, and science toolkits.', 'Rural students often struggle with intermittent home electricity, lack of quiet study desks, and limited access to supplementary reading books in rural hamlets. Many first-generation learners drop out before secondary education without foundational guidance.

Our Evening Village Study Pods provide safe, well-illuminated communal study spaces led by volunteer college graduates. Funds directly purchase ergonomic wooden benches, solar emergency lamps, bilingual children’s encyclopedias, and hands-on math and science experimental kits for 250+ village children.', 200000, 134000, 98, '2026-09-01', '2027-03-31', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80', 'active', 'published', 'Dharmapuri Rural Taluks')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaigns (id, slug, title, full_title, category, description, short_description, full_description, goal_amount, raised_amount, donors_count, start_date, end_date, image_url, status, publication_status, location)
VALUES ('camp-green-villages', 'green-villages', 'Green Villages', 'Green Villages: 5,000 Native Trees Plantation Drive', 'Environment', 'Planting native drought-tolerant trees along rural roadsides, school grounds, and tank bunds with protective bamboo guards and community watering groups.', 'Planting native drought-tolerant trees along rural roadsides, school grounds, and tank bunds with protective bamboo guards.', 'Summer temperatures across Dharmapuri regularly cross 40°C, depleting rural soil moisture and diminishing tree canopy cover along communal livestock paths and village school grounds.

This community-led afforestation drive cultivates 5,000 native shade and fruit trees—including Neem (வேம்பு), Pongamia (புங்கன்), Tamarind (புளி), and Jamun (நாவல்). Funds cover sapling procurement from local social forestry nurseries, protective bio-degradable tree guards, drip irrigation tubes, and volunteer watering stipends.', 175000, 112000, 85, '2026-10-01', '2027-04-30', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80', 'active', 'published', 'Eruthukuttahalli & Surrounding Villages')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.impact_metrics (id, label, value, description, icon, display_order)
VALUES ('stat-programmes', 'Programmes', '9', 'Core developmental verticals in active implementation', 'FolderKanban', 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.impact_metrics (id, label, value, description, icon, display_order)
VALUES ('stat-villages', 'Villages Reached', '45+', 'Rural hamlets engaged across Palacode & Dharmapuri taluks', 'MapPin', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.impact_metrics (id, label, value, description, icon, display_order)
VALUES ('stat-people', 'People Supported', '12,500+', 'Children, farmers, self-help groups and rural elders', 'Users', 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.impact_metrics (id, label, value, description, icon, display_order)
VALUES ('stat-projects', 'Community Projects', '68+', 'Water points, study circles, afforestation and health camps', 'CheckCircle2', 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.gallery_items (id, title, category, image_url, status, display_order)
VALUES ('gal-1', 'Community Gathering & Planning', 'Events', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=640&q=80', 'published', 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.gallery_items (id, title, category, image_url, status, display_order)
VALUES ('gal-2', 'Rural Education Initiative', 'Education', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=640&q=80', 'published', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.gallery_items (id, title, category, image_url, status, display_order)
VALUES ('gal-3', 'Clean Water Initiative', 'Water', 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=640&q=80', 'published', 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.gallery_items (id, title, category, image_url, status, display_order)
VALUES ('gal-4', 'Tree Planting Drive', 'Environment', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=640&q=80', 'published', 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.careers (id, title, location, type, description, skills, status, publication_status, posted_date)
VALUES ('career-1', 'Field Coordinator — Education Programmes', 'Palacode / Dharmapuri, Tamil Nadu', 'Full-time', 'Lead village evening study centres, liaise with government schools, monitor student learning milestones, and manage volunteer tutors.', 'Degree in Social Work, Education, or Science; 1+ year field NGO experience', 'open', 'published', '2026-10-01')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.careers (id, title, location, type, description, skills, status, publication_status, posted_date)
VALUES ('career-2', 'Community Water & Sanitation Field Technician', 'Palacode Taluk, Dharmapuri', 'Full-time', 'Oversee the operation and preventive maintenance of solar-powered RO water kiosks and community chlorination units.', 'Diploma or ITI in Electrical/Mechanical/Plumbing; field troubleshooting experience', 'open', 'published', '2026-10-10')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.careers (id, title, location, type, description, skills, status, publication_status, posted_date)
VALUES ('career-3', 'Agro-Forestry & Green Village Project Associate', 'Dharmapuri Rural Taluks', 'Internship', 'Assist in nursery management, sapling distribution logistics, and community tree survival audits across participating villages.', 'Background in Agriculture, Botany, Forestry, or Environmental Science', 'open', 'published', '2026-10-15')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.careers (id, title, location, type, description, skills, status, publication_status, posted_date)
VALUES ('career-4', 'Rural Micro-Enterprise & SHG Facilitator', 'Palacode Block', 'Full-time', 'Facilitate skill development and value-addition training for women self-help groups in organic farming and handicrafts.', 'Experience working with SHGs or rural credit groups; Tamil proficiency', 'open', 'published', '2026-10-18')
ON CONFLICT (id) DO NOTHING;