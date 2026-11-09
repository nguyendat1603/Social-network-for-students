-- ============================================================================
-- MODULE 4: COURSE REVIEW & PEER Q&A (ĐÁNH GIÁ HỌC PHẦN & HỎI ĐÁP THEO MÔN)
-- Target Database: Supabase PostgreSQL 17
-- Reference: docs/mvp-specification.md (Module 4)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lecturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
    academic_title VARCHAR(80) DEFAULT 'Giảng viên',
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lecturers_faculty_id ON public.lecturers(faculty_id);

CREATE TABLE IF NOT EXISTS public.course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lecturer_id UUID REFERENCES public.lecturers(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    semester VARCHAR(20) NOT NULL,
    difficulty_score SMALLINT NOT NULL CHECK (difficulty_score BETWEEN 1 AND 5),
    workload_score SMALLINT NOT NULL CHECK (workload_score BETWEEN 1 AND 5),
    grading_fairness_score SMALLINT NOT NULL CHECK (grading_fairness_score BETWEEN 1 AND 5),
    teaching_quality_score SMALLINT NOT NULL CHECK (teaching_quality_score BETWEEN 1 AND 5),
    reading_load_score SMALLINT NOT NULL DEFAULT 3 CHECK (reading_load_score BETWEEN 1 AND 5),
    review_content TEXT NOT NULL,
    tips_for_junior TEXT,
    expected_grade VARCHAR(10),
    is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    status public.content_status NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_course_review_per_semester UNIQUE NULLS NOT DISTINCT (course_id, lecturer_id, author_id, semester)
);

CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON public.course_reviews(course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_reviews_lecturer_id ON public.course_reviews(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_author_id ON public.course_reviews(author_id);

CREATE TABLE IF NOT EXISTS public.course_review_aggregates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lecturer_id UUID REFERENCES public.lecturers(id) ON DELETE CASCADE,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    avg_difficulty NUMERIC(3,2) NOT NULL DEFAULT 0,
    avg_workload NUMERIC(3,2) NOT NULL DEFAULT 0,
    avg_fairness NUMERIC(3,2) NOT NULL DEFAULT 0,
    avg_teaching NUMERIC(3,2) NOT NULL DEFAULT 0,
    avg_reading_load NUMERIC(3,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_course_lecturer_aggregate UNIQUE NULLS NOT DISTINCT (course_id, lecturer_id)
);

CREATE INDEX IF NOT EXISTS idx_course_review_aggregates_course_id ON public.course_review_aggregates(course_id);
CREATE INDEX IF NOT EXISTS idx_course_review_aggregates_lecturer_id ON public.course_review_aggregates(lecturer_id);

CREATE OR REPLACE TRIGGER trg_lecturers_updated_at
BEFORE UPDATE ON public.lecturers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_course_reviews_updated_at
BEFORE UPDATE ON public.course_reviews
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_review_aggregates ENABLE ROW LEVEL SECURITY;
