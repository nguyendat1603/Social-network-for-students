import { apiRequest } from './api.client';
import {
  AutoModSettingItem,
  ExecuteActionPayload,
  KarmaLeaderboardItem,
  KarmaSummaryResponse,
  ModerationActionItem,
  ModerationQueueItem,
  ReportReasonCode,
  ReportStatus,
  ReportTargetType,
  ResolveReportPayload,
  SubmitReportPayload,
  UserPrivilegesResponse,
} from '../types/moderation.types';

export const moderationService = {
  getMyKarma() {
    return apiRequest<KarmaSummaryResponse>('/moderation/karma/me');
  },

  getMyPrivileges() {
    return apiRequest<UserPrivilegesResponse>('/moderation/karma/privileges');
  },

  getLeaderboard(params?: { facultyId?: string; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.facultyId) qs.set('facultyId', params.facultyId);
    if (params?.limit) qs.set('limit', String(params.limit));
    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<KarmaLeaderboardItem[]>(`/moderation/karma/leaderboard${queryStr}`);
  },

  submitReport(payload: SubmitReportPayload) {
    return apiRequest<{
      report: Record<string, unknown>;
      autoHidden: boolean;
      currentReportCount: number;
    }>('/moderation/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getModerationQueue(params?: {
    status?: ReportStatus;
    targetType?: ReportTargetType;
    reasonCode?: ReportReasonCode;
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.targetType) qs.set('targetType', params.targetType);
    if (params?.reasonCode) qs.set('reasonCode', params.reasonCode);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<ModerationQueueItem[]>(`/moderation/admin/queue${queryStr}`);
  },

  resolveReports(
    targetType: ReportTargetType,
    targetId: string,
    payload: ResolveReportPayload
  ) {
    return apiRequest<{ resolvedCount: number; actionTaken: string }>(
      `/moderation/admin/queue/${targetType}/${targetId}/resolve`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
  },

  executeAction(payload: ExecuteActionPayload) {
    return apiRequest<ModerationActionItem>('/moderation/admin/actions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listModerationActions() {
    return apiRequest<ModerationActionItem[]>('/moderation/admin/actions');
  },

  getAutoModSettings() {
    return apiRequest<AutoModSettingItem[]>('/moderation/admin/settings');
  },

  updateAutoModSetting(
    reasonCode: ReportReasonCode,
    payload: { thresholdCount: number; isEnabled: boolean }
  ) {
    return apiRequest<AutoModSettingItem>(
      `/moderation/admin/settings/${reasonCode}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
  },
};
