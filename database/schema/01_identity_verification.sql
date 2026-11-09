-- ============================================================================
-- GIAI ĐOẠN 1: NỀN TẢNG HỌC THUẬT & MODULE 1 (IDENTITY & STUDENT VERIFICATION)
-- Target Database: Supabase PostgreSQL 17
-- Reference: docs/mvp-specification.md (Module 1)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- ----------------------------------------------------------------------------
-- 1. ENUMS
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM (
            'UNVERIFIED_USER',
            'VERIFIED_STUDENT',
            'MODERATOR',
            'ADMIN'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE public.user_status AS ENUM (
            'ACTIVE',
            'WARNED',
            'SUSPENDED',
            'BANNED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_provider') THEN
        CREATE TYPE public.verification_provider AS ENUM (
            'EDU_OTP',
            'SSO_OAUTH2'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_category') THEN
        CREATE TYPE public.skill_category AS ENUM (
            'TECHNICAL',
            'LANGUAGE',
            'SOFT_SKILL'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_proficiency') THEN
        CREATE TYPE public.skill_proficiency AS ENUM (
            'BEGINNER',
            'INTERMEDIATE',
            'ADVANCED',
            'EXPERT'
        );
    END IF;
END
$$;

-- ----------------------------------------------------------------------------
-- 2. UTILITY TRIGGER FOR updated_at (Secure search_path)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. FOUNDATIONAL TABLES: FACULTIES, COURSES, PRIVILEGE TIERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faculties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
    credits SMALLINT NOT NULL DEFAULT 3 CHECK (credits >= 0 AND credits <= 15),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_faculty_id ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_courses_code_trgm ON public.courses USING gin (code gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_courses_name_trgm ON public.courses USING gin (name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS public.privilege_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_code VARCHAR(40) NOT NULL UNIQUE,
    min_karma INTEGER NOT NULL UNIQUE,
    daily_download_limit INTEGER, -- NULL means unlimited downloads
    can_create_custom_group BOOLEAN NOT NULL DEFAULT FALSE,
    badge_label VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. MODULE 1 TABLES: USERS, VERIFICATIONS, ACADEMIC PROFILES, USER SKILLS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT,
    role public.user_role NOT NULL DEFAULT 'UNVERIFIED_USER',
    is_verified_student BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    karma_points INTEGER NOT NULL DEFAULT 0,
    status public.user_status NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_karma_points ON public.users(karma_points DESC);

CREATE TABLE IF NOT EXISTS public.student_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    edu_email VARCHAR(255) NOT NULL,
    otp_hash TEXT,
    provider public.verification_provider NOT NULL DEFAULT 'EDU_OTP',
    sso_subject_id VARCHAR(255),
    expires_at TIMESTAMPTZ NOT NULL,
    attempts SMALLINT NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    max_attempts SMALLINT NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_verifications_user_id ON public.student_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_student_verifications_edu_email ON public.student_verifications(edu_email);

CREATE TABLE IF NOT EXISTS public.academic_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    student_code VARCHAR(30) UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    avatar_url TEXT,
    faculty_id UUID REFERENCES public.faculties(id) ON DELETE SET NULL,
    major VARCHAR(150),
    cohort VARCHAR(30),
    class_name VARCHAR(80),
    career_goal TEXT,
    bio TEXT,
    anonymous_handle VARCHAR(60) NOT NULL UNIQUE,
    anonymous_avatar TEXT,
    anonymous_last_changed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_profiles_faculty_id ON public.academic_profiles(faculty_id);
CREATE INDEX IF NOT EXISTS idx_academic_profiles_cohort ON public.academic_profiles(cohort);

CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    category public.skill_category NOT NULL DEFAULT 'TECHNICAL',
    proficiency_level public.skill_proficiency NOT NULL DEFAULT 'INTERMEDIATE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_skill UNIQUE (user_id, skill_name, category)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_name ON public.user_skills(skill_name);

-- ----------------------------------------------------------------------------
-- 5. TRIGGERS FOR updated_at
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_faculties_updated_at ON public.faculties;
CREATE TRIGGER trg_faculties_updated_at
BEFORE UPDATE ON public.faculties
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_academic_profiles_updated_at ON public.academic_profiles;
CREATE TRIGGER trg_academic_profiles_updated_at
BEFORE UPDATE ON public.academic_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES (Supabase Security Standard)
-- ----------------------------------------------------------------------------
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privilege_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- Public Reference Tables: Readable by everyone (anon & authenticated)
DROP POLICY IF EXISTS "faculties_select_all" ON public.faculties;
CREATE POLICY "faculties_select_all"
ON public.faculties FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "courses_select_all" ON public.courses;
CREATE POLICY "courses_select_all"
ON public.courses FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "privilege_tiers_select_all" ON public.privilege_tiers;
CREATE POLICY "privilege_tiers_select_all"
ON public.privilege_tiers FOR SELECT
TO anon, authenticated
USING (true);

-- Users Table: Authenticated users can view their own account record
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own"
ON public.users FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
ON public.users FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- Student Verifications: Users can only read their own verification state
DROP POLICY IF EXISTS "student_verifications_select_own" ON public.student_verifications;
CREATE POLICY "student_verifications_select_own"
ON public.student_verifications FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Academic Profiles: Readable by authenticated students; editable only by owner
DROP POLICY IF EXISTS "academic_profiles_select_authenticated" ON public.academic_profiles;
CREATE POLICY "academic_profiles_select_authenticated"
ON public.academic_profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "academic_profiles_insert_own" ON public.academic_profiles;
CREATE POLICY "academic_profiles_insert_own"
ON public.academic_profiles FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "academic_profiles_update_own" ON public.academic_profiles;
CREATE POLICY "academic_profiles_update_own"
ON public.academic_profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- User Skills: Readable by authenticated students; managed only by owner
DROP POLICY IF EXISTS "user_skills_select_authenticated" ON public.user_skills;
CREATE POLICY "user_skills_select_authenticated"
ON public.user_skills FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "user_skills_insert_own" ON public.user_skills;
CREATE POLICY "user_skills_insert_own"
ON public.user_skills FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_skills_update_own" ON public.user_skills;
CREATE POLICY "user_skills_update_own"
ON public.user_skills FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_skills_delete_own" ON public.user_skills;
CREATE POLICY "user_skills_delete_own"
ON public.user_skills FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);
