-- ============================================================================
-- SEED DATA: KHUNG ĐẶC QUYỀN ĐIỂM UY TÍN (ACADEMIC KARMA PRIVILEGE TIERS)
-- ============================================================================

INSERT INTO public.privilege_tiers (tier_code, min_karma, daily_download_limit, can_create_custom_group, badge_label)
VALUES
    ('RESTRICTED', -9999, 0, FALSE, 'Tài khoản bị giới hạn'),
    ('VERIFIED_MEMBER', 0, 10, FALSE, 'Verified Student'),
    ('ACTIVE_CONTRIBUTOR', 50, NULL, FALSE, 'Active Contributor'),
    ('TRUSTED_SCHOLAR', 150, NULL, TRUE, 'Trusted Scholar')
ON CONFLICT (tier_code) DO UPDATE
SET min_karma = EXCLUDED.min_karma,
    daily_download_limit = EXCLUDED.daily_download_limit,
    can_create_custom_group = EXCLUDED.can_create_custom_group,
    badge_label = EXCLUDED.badge_label;
