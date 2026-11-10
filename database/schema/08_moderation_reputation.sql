-- ============================================================================
-- 08_moderation_reputation.sql
-- Module 8: Moderation & Reputation System
-- Platform: MXH_HSSV (PostgreSQL / Supabase Online)
-- ============================================================================

-- 1. CONTENT REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- 'POST', 'COMMENT', 'DOCUMENT', 'COURSE_REVIEW', 'MARKETPLACE_ITEM', 'HOUSING_LISTING'
    target_id TEXT NOT NULL,
    reason_code VARCHAR(50) NOT NULL, -- 'LEAKED_EXAM', 'SCAM_HOUSING', 'HARASSMENT_TOXIC', 'COPYRIGHT_WRONG_DOC', 'SPAM'
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'RESOLVED_REMOVED', 'RESOLVED_DISMISSED'
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_content_reports_reporter_target UNIQUE (reporter_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_content_reports_target ON public.content_reports (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON public.content_reports (status);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON public.content_reports (created_at DESC);

-- 2. MODERATION ACTIONS TABLE (Immutable Audit Log)
CREATE TABLE IF NOT EXISTS public.moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id TEXT NOT NULL,
    action_taken VARCHAR(50) NOT NULL, -- 'AUTO_HIDE', 'DELETE_CONTENT', 'WARN', 'TEMPORARY_BAN', 'PERMANENT_BAN'
    reason TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_target ON public.moderation_actions (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_user ON public.moderation_actions (target_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_created ON public.moderation_actions (created_at DESC);

-- 3. AUTO-MODERATION THRESHOLD SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.auto_mod_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reason_code VARCHAR(50) NOT NULL UNIQUE,
    threshold_count INTEGER NOT NULL DEFAULT 5,
    action_to_take VARCHAR(50) NOT NULL DEFAULT 'AUTO_HIDE',
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default Auto-Moderation Rules
INSERT INTO public.auto_mod_settings (reason_code, threshold_count, action_to_take, is_enabled)
VALUES
    ('LEAKED_EXAM', 3, 'AUTO_HIDE', TRUE),
    ('SCAM_HOUSING', 3, 'AUTO_HIDE', TRUE),
    ('HARASSMENT_TOXIC', 5, 'AUTO_HIDE', TRUE),
    ('COPYRIGHT_WRONG_DOC', 5, 'AUTO_HIDE', TRUE),
    ('SPAM', 5, 'AUTO_HIDE', TRUE)
ON CONFLICT (reason_code) DO NOTHING;

-- 4. TRIGGERS
CREATE OR REPLACE TRIGGER trg_content_reports_updated_at
BEFORE UPDATE ON public.content_reports
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_auto_mod_settings_updated_at
BEFORE UPDATE ON public.auto_mod_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_mod_settings ENABLE ROW LEVEL SECURITY;

-- content_reports policies
CREATE POLICY "content_reports_select_own_or_mod"
ON public.content_reports FOR SELECT
TO authenticated
USING (
    reporter_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
          AND users.role IN ('ADMIN', 'MODERATOR')
    )
);

CREATE POLICY "content_reports_insert_own"
ON public.content_reports FOR INSERT
TO authenticated
WITH CHECK (
    reporter_id = auth.uid()
);

CREATE POLICY "content_reports_update_mod"
ON public.content_reports FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
          AND users.role IN ('ADMIN', 'MODERATOR')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
          AND users.role IN ('ADMIN', 'MODERATOR')
    )
);

-- moderation_actions policies
CREATE POLICY "moderation_actions_select_target_or_mod"
ON public.moderation_actions FOR SELECT
TO authenticated
USING (
    target_user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
          AND users.role IN ('ADMIN', 'MODERATOR')
    )
);

CREATE POLICY "moderation_actions_insert_mod"
ON public.moderation_actions FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
          AND users.role IN ('ADMIN', 'MODERATOR')
    )
);

-- auto_mod_settings policies
CREATE POLICY "auto_mod_settings_select_auth"
ON public.auto_mod_settings FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "auto_mod_settings_update_mod"
ON public.auto_mod_settings FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
          AND users.role IN ('ADMIN', 'MODERATOR')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
          AND users.role IN ('ADMIN', 'MODERATOR')
    )
);
