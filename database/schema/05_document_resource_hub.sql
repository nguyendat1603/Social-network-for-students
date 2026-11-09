-- ============================================================================
-- MODULE 5: DOCUMENT & RESOURCE HUB (KHO TÀI LIỆU MỞ)
-- Target Database: Supabase PostgreSQL 17
-- Reference: docs/mvp-specification.md (Module 5)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE public.document_type AS ENUM (
            'MIDTERM_EXAM',
            'FINAL_EXAM',
            'ASSIGNMENT_PROJECT',
            'LECTURE_SLIDE',
            'SUMMARY_NOTE'
        );
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE RESTRICT,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    semester VARCHAR(20) NOT NULL,
    doc_type public.document_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    preview_url TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL DEFAULT 0 CHECK (file_size >= 0),
    file_sha256 VARCHAR(64) NOT NULL,
    download_count INTEGER NOT NULL DEFAULT 0,
    upvote_count INTEGER NOT NULL DEFAULT 0,
    downvote_count INTEGER NOT NULL DEFAULT 0,
    status public.content_status NOT NULL DEFAULT 'PUBLISHED',
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(file_name, ''))
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_document_course_sha256 UNIQUE (course_id, file_sha256)
);

CREATE INDEX IF NOT EXISTS idx_documents_uploader_id ON public.documents(uploader_id);
CREATE INDEX IF NOT EXISTS idx_documents_hierarchy ON public.documents(faculty_id, course_id, semester, doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_course_id ON public.documents(course_id);
CREATE INDEX IF NOT EXISTS idx_documents_search_vector ON public.documents USING gin (search_vector);

CREATE TABLE IF NOT EXISTS public.document_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vote_type public.vote_type NOT NULL DEFAULT 'UPVOTE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_document_user_vote UNIQUE (document_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_document_votes_document_id ON public.document_votes(document_id);
CREATE INDEX IF NOT EXISTS idx_document_votes_user_id ON public.document_votes(user_id);

CREATE TABLE IF NOT EXISTS public.document_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_downloads_user_date ON public.document_downloads(user_id, downloaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_downloads_document_id ON public.document_downloads(document_id);

CREATE OR REPLACE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_downloads ENABLE ROW LEVEL SECURITY;
