-- ============================================================================
-- MODULE 2: ACADEMIC DISCUSSION & FEED (BẢNG TIN & THẢO LUẬN HỌC THUẬT)
-- Target Database: Supabase PostgreSQL 17
-- Reference: docs/mvp-specification.md (Module 2)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feed_scope') THEN
        CREATE TYPE public.feed_scope AS ENUM ('CAMPUS', 'DEPARTMENT', 'COURSE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_type') THEN
        CREATE TYPE public.post_type AS ENUM ('DISCUSSION', 'QUESTION', 'ANNOUNCEMENT');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
        CREATE TYPE public.content_status AS ENUM ('PUBLISHED', 'HIDDEN_PENDING_REVIEW', 'DELETED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_target_type') THEN
        CREATE TYPE public.vote_target_type AS ENUM ('POST', 'COMMENT');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_type') THEN
        CREATE TYPE public.vote_type AS ENUM ('UPVOTE', 'DOWNVOTE', 'HELPFUL');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    feed_scope public.feed_scope NOT NULL DEFAULT 'CAMPUS',
    faculty_id UUID REFERENCES public.faculties(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    post_type public.post_type NOT NULL DEFAULT 'DISCUSSION',
    title VARCHAR(255) NOT NULL,
    content_body TEXT NOT NULL,
    has_latex BOOLEAN NOT NULL DEFAULT FALSE,
    has_code BOOLEAN NOT NULL DEFAULT FALSE,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    upvote_count INTEGER NOT NULL DEFAULT 0,
    downvote_count INTEGER NOT NULL DEFAULT 0,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    accepted_comment_id UUID,
    status public.content_status NOT NULL DEFAULT 'PUBLISHED',
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content_body, ''))
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_faculty_id ON public.posts(faculty_id);
CREATE INDEX IF NOT EXISTS idx_posts_course_id ON public.posts(course_id);
CREATE INDEX IF NOT EXISTS idx_posts_feed_scope_created ON public.posts(feed_scope, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON public.posts USING gin (search_vector);

CREATE TABLE IF NOT EXISTS public.post_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(80) NOT NULL DEFAULT 'application/pdf',
    file_size INTEGER NOT NULL DEFAULT 0 CHECK (file_size >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_attachments_post_id ON public.post_attachments(post_id);

CREATE TABLE IF NOT EXISTS public.post_course_tags (
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_post_course_tags_course_id ON public.post_course_tags(course_id);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content_body TEXT NOT NULL,
    has_latex BOOLEAN NOT NULL DEFAULT FALSE,
    has_code BOOLEAN NOT NULL DEFAULT FALSE,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    upvote_count INTEGER NOT NULL DEFAULT 0,
    downvote_count INTEGER NOT NULL DEFAULT 0,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    status public.content_status NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON public.comments(parent_comment_id);

CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_type public.vote_target_type NOT NULL,
    target_id UUID NOT NULL,
    vote_type public.vote_type NOT NULL DEFAULT 'UPVOTE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_target_vote UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_target ON public.votes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);

CREATE OR REPLACE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_course_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
