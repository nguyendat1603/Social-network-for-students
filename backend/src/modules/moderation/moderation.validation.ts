import { AppError } from '../../common/errors/app.error';
import {
  MODERATION_ACTION_TYPES,
  ModerationActionType,
  REPORT_REASON_CODES,
  REPORT_TARGET_TYPES,
  ReportReasonCode,
  ReportTargetType,
} from '../../common/constants/moderation-thresholds.constant';
import {
  ExecuteModerationActionDTO,
  KarmaLeaderboardQuery,
  ModerationQueueQuery,
  ReportStatus,
  ResolveReportDTO,
  SubmitReportDTO,
} from './moderation.types';

export const validateSubmitReport = (body: Record<string, unknown>): SubmitReportDTO => {
  const targetType = body.targetType as ReportTargetType;
  const targetId = typeof body.targetId === 'string' ? body.targetId.trim() : '';
  const reasonCode = body.reasonCode as ReportReasonCode;
  const description =
    typeof body.description === 'string' ? body.description.trim() : undefined;

  if (!Object.values(REPORT_TARGET_TYPES).includes(targetType)) {
    throw new AppError(
      'Loại đối tượng bị báo cáo không hợp lệ.',
      400,
      'INVALID_REPORT_TARGET_TYPE'
    );
  }

  if (!targetId) {
    throw new AppError(
      'Mã đối tượng (targetId) không được để trống.',
      400,
      'MISSING_TARGET_ID'
    );
  }

  if (!Object.values(REPORT_REASON_CODES).includes(reasonCode)) {
    throw new AppError(
      'Lý do báo cáo vi phạm không hợp lệ.',
      400,
      'INVALID_REPORT_REASON_CODE'
    );
  }

  return {
    targetType,
    targetId,
    reasonCode,
    description: description || undefined,
  };
};

export const validateResolveReport = (body: Record<string, unknown>): ResolveReportDTO => {
  const status = body.status as ReportStatus;
  const actionTaken = body.actionTaken as ModerationActionType | undefined;
  const sanctionTargetUser = Boolean(body.sanctionTargetUser);
  const reason = typeof body.reason === 'string' ? body.reason.trim() : undefined;

  if (status !== 'RESOLVED_REMOVED' && status !== 'RESOLVED_DISMISSED') {
    throw new AppError(
      'Trạng thái giải quyết phải là RESOLVED_REMOVED hoặc RESOLVED_DISMISSED.',
      400,
      'INVALID_REPORT_STATUS'
    );
  }

  if (actionTaken && !Object.values(MODERATION_ACTION_TYPES).includes(actionTaken)) {
    throw new AppError(
      'Hành động chế tài không hợp lệ.',
      400,
      'INVALID_MODERATION_ACTION'
    );
  }

  return {
    status,
    actionTaken,
    sanctionTargetUser,
    reason,
  };
};

export const validateExecuteModerationAction = (
  body: Record<string, unknown>
): ExecuteModerationActionDTO => {
  const targetType = body.targetType as ReportTargetType;
  const targetId = typeof body.targetId === 'string' ? body.targetId.trim() : '';
  const actionTaken = body.actionTaken as ModerationActionType;
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  const targetUserId =
    typeof body.targetUserId === 'string' && body.targetUserId.trim()
      ? body.targetUserId.trim()
      : null;
  const expiresAt =
    typeof body.expiresAt === 'string' && body.expiresAt.trim()
      ? body.expiresAt.trim()
      : null;
  const deductKarma = body.deductKarma !== undefined ? Boolean(body.deductKarma) : true;

  if (!Object.values(REPORT_TARGET_TYPES).includes(targetType)) {
    throw new AppError('Loại đối tượng không hợp lệ.', 400, 'INVALID_TARGET_TYPE');
  }

  if (!targetId) {
    throw new AppError('Mã đối tượng không được để trống.', 400, 'MISSING_TARGET_ID');
  }

  if (!Object.values(MODERATION_ACTION_TYPES).includes(actionTaken)) {
    throw new AppError('Hành động chế tài không hợp lệ.', 400, 'INVALID_ACTION_TAKEN');
  }

  if (!reason || reason.length < 5) {
    throw new AppError('Lý do xử lý kỷ luật phải từ 5 ký tự trở lên.', 400, 'INVALID_REASON');
  }

  return {
    targetType,
    targetId,
    actionTaken,
    reason,
    targetUserId,
    expiresAt,
    deductKarma,
  };
};

export const validateModerationQueueQuery = (
  query: Record<string, unknown>
): ModerationQueueQuery => {
  const status = query.status as ReportStatus | undefined;
  const targetType = query.targetType as ReportTargetType | undefined;
  const reasonCode = query.reasonCode as ReportReasonCode | undefined;
  const page = query.page ? Math.max(1, Number(query.page)) : 1;
  const limit = query.limit ? Math.min(100, Math.max(1, Number(query.limit))) : 20;

  return {
    status: status || undefined,
    targetType: targetType || undefined,
    reasonCode: reasonCode || undefined,
    page,
    limit,
  };
};

export const validateKarmaLeaderboardQuery = (
  query: Record<string, unknown>
): KarmaLeaderboardQuery => {
  const limit = query.limit ? Math.min(100, Math.max(1, Number(query.limit))) : 20;
  const facultyId =
    typeof query.facultyId === 'string' && query.facultyId.trim()
      ? query.facultyId.trim()
      : undefined;

  return {
    limit,
    facultyId,
  };
};
