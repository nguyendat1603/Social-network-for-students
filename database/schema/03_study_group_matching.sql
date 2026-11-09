-- ============================================================================
-- MODULE 3: STUDY GROUP & TEAM MATCHING (TÌM NHÓM & QUẢN LÝ ĐỒ ÁN)
-- Target Database: Supabase PostgreSQL 17
-- Reference: docs/mvp-specification.md (Module 3)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'target_grade_goal') THEN
        CREATE TYPE public.target_grade_goal AS ENUM ('A+', 'A', 'B+', 'PASS');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE public.application_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'group_member_role') THEN
        CREATE TYPE public.group_member_role AS ENUM ('LEAD', 'MEMBER');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kanban_task_status') THEN
        CREATE TYPE public.kanban_task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kanban_task_priority') THEN
        CREATE TYPE public.kanban_task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    semester VARCHAR(20) NOT NULL,
    leader_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_grade public.target_grade_goal NOT NULL DEFAULT 'A',
    max_members SMALLINT NOT NULL DEFAULT 4 CHECK (max_members BETWEEN 2 AND 15),
    description TEXT,
    is_recruiting BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_groups_course_id ON public.study_groups(course_id, is_recruiting);
CREATE INDEX IF NOT EXISTS idx_study_groups_leader_id ON public.study_groups(leader_id);

CREATE TABLE IF NOT EXISTS public.recruitment_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    role_name VARCHAR(80) NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    quantity_needed SMALLINT NOT NULL DEFAULT 1 CHECK (quantity_needed >= 1),
    quantity_filled SMALLINT NOT NULL DEFAULT 0 CHECK (quantity_filled >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recruitment_slots_group_id ON public.recruitment_slots(group_id);

CREATE TABLE IF NOT EXISTS public.group_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    slot_id UUID REFERENCES public.recruitment_slots(id) ON DELETE SET NULL,
    applicant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    cover_note TEXT NOT NULL,
    portfolio_url TEXT,
    status public.application_status NOT NULL DEFAULT 'PENDING',
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_group_applicant UNIQUE (group_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_group_applications_group_id ON public.group_applications(group_id, status);
CREATE INDEX IF NOT EXISTS idx_group_applications_applicant_id ON public.group_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_group_applications_slot_id ON public.group_applications(slot_id);

CREATE TABLE IF NOT EXISTS public.group_members (
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    member_role public.group_member_role NOT NULL DEFAULT 'MEMBER',
    assigned_position VARCHAR(80) NOT NULL DEFAULT 'Member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);

CREATE TABLE IF NOT EXISTS public.kanban_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status public.kanban_task_status NOT NULL DEFAULT 'TODO',
    priority public.kanban_task_priority NOT NULL DEFAULT 'MEDIUM',
    assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    position_order INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kanban_tasks_group_id ON public.kanban_tasks(group_id, status, position_order);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_assignee_id ON public.kanban_tasks(assignee_id);

CREATE TABLE IF NOT EXISTS public.group_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL DEFAULT 0 CHECK (file_size >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_documents_group_id ON public.group_documents(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_documents_uploader_id ON public.group_documents(uploader_id);

CREATE OR REPLACE TRIGGER trg_study_groups_updated_at
BEFORE UPDATE ON public.study_groups
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_kanban_tasks_updated_at
BEFORE UPDATE ON public.kanban_tasks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_documents ENABLE ROW LEVEL SECURITY;
