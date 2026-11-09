export const KARMA_RULES = {
  DOCUMENT_UPVOTED: 5,
  ANSWER_ACCEPTED: 15,
  POST_OR_COMMENT_UPVOTED: 2,
  KANBAN_TASK_COMPLETED_ON_TIME: 5,
  MARKETPLACE_FREE_GIVEAWAY: 5,
  CONTENT_REMOVED_VIOLATION: -20,
} as const;

export const PRIVILEGE_TIERS = {
  RESTRICTED: {
    minKarma: -9999,
    dailyDownloadLimit: 0,
    canCreateCustomGroup: false,
    badgeLabel: 'Tài khoản bị giới hạn',
  },
  VERIFIED_MEMBER: {
    minKarma: 0,
    dailyDownloadLimit: 10,
    canCreateCustomGroup: false,
    badgeLabel: 'Verified Student',
  },
  ACTIVE_CONTRIBUTOR: {
    minKarma: 50,
    dailyDownloadLimit: null,
    canCreateCustomGroup: false,
    badgeLabel: 'Active Contributor',
  },
  TRUSTED_SCHOLAR: {
    minKarma: 150,
    dailyDownloadLimit: null,
    canCreateCustomGroup: true,
    badgeLabel: 'Trusted Scholar',
  },
} as const;
