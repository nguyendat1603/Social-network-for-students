export type ReportReasonCode =
  | 'LEAKED_EXAM'
  | 'SCAM_HOUSING'
  | 'HARASSMENT_TOXIC'
  | 'COPYRIGHT_WRONG_DOC'
  | 'SPAM';

export type ReportTargetType =
  | 'POST'
  | 'COMMENT'
  | 'DOCUMENT'
  | 'COURSE_REVIEW'
  | 'MARKETPLACE_ITEM'
  | 'HOUSING_LISTING';

export type ReportStatus = 'PENDING' | 'RESOLVED_REMOVED' | 'RESOLVED_DISMISSED';

export type ModerationActionType =
  | 'AUTO_HIDE'
  | 'DELETE_CONTENT'
  | 'WARN'
  | 'TEMPORARY_BAN'
  | 'PERMANENT_BAN';

export interface SubmitReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reasonCode: ReportReasonCode;
  description?: string;
}

export interface ResolveReportPayload {
  status: 'RESOLVED_REMOVED' | 'RESOLVED_DISMISSED';
  actionTaken?: ModerationActionType;
  sanctionTargetUser?: boolean;
  reason?: string;
}

export interface ExecuteActionPayload {
  targetUserId?: string | null;
  targetType: ReportTargetType;
  targetId: string;
  actionTaken: ModerationActionType;
  reason: string;
  expiresAt?: string | null;
  deductKarma?: boolean;
}

export interface KarmaLedgerItem {
  id: string;
  user_id: string;
  action_type: string;
  points_delta: number;
  reference_type: string;
  reference_id: string;
  created_at: string;
}

export interface KarmaSummaryResponse {
  currentKarma: number;
  tier: {
    tierCode: string;
    badgeLabel: string;
    dailyDownloadLimit: number | null;
    canCreateCustomGroup: boolean;
    nextTierPoints: number | null;
  };
  stats: {
    totalEarned: number;
    totalDeducted: number;
    transactionsCount: number;
  };
  recentTransactions: KarmaLedgerItem[];
}

export interface UserPrivilegesResponse {
  userId: string;
  karmaPoints: number;
  tierCode: string;
  badgeLabel: string;
  isRestricted: boolean;
  dailyDownloadLimit: number | null;
  downloadsUsedToday: number;
  remainingDownloadsToday: number | null;
  canCreateCustomGroup: boolean;
  canPost: boolean;
}

export interface KarmaLeaderboardItem {
  rank: number;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  studentCode?: string | null;
  major?: string | null;
  facultyId?: string | null;
  karmaPoints: number;
  badgeLabel: string;
}

export interface ContentReportItem {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason_code: ReportReasonCode;
  description?: string | null;
  status: ReportStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  reporter?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    is_verified_student: boolean;
  } | null;
}

export interface ModerationQueueItem {
  target_type: ReportTargetType;
  target_id: string;
  report_count: number;
  unique_reporters_count: number;
  latest_reason: ReportReasonCode;
  latest_reported_at: string;
  reports: ContentReportItem[];
  target_content?: {
    title?: string;
    content?: string;
    author_id?: string;
    author_name?: string;
    is_anonymous?: boolean;
    real_author?: {
      id: string;
      full_name: string;
      email?: string;
      student_code?: string;
      karma_points?: number;
    } | null;
    status?: string;
  } | null;
}

export interface ModerationActionItem {
  id: string;
  moderator_id?: string | null;
  target_user_id?: string | null;
  target_type: ReportTargetType;
  target_id: string;
  action_taken: ModerationActionType;
  reason: string;
  expires_at?: string | null;
  created_at: string;
  moderator?: {
    id: string;
    full_name: string;
  } | null;
  target_user?: {
    id: string;
    full_name: string;
    email?: string;
    karma_points?: number;
  } | null;
}

export interface AutoModSettingItem {
  id: string;
  reason_code: ReportReasonCode;
  threshold_count: number;
  action_to_take: string;
  is_enabled: boolean;
  updated_at: string;
}
