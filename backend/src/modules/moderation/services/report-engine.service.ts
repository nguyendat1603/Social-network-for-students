import { supabase } from '../../../database';
import { AppError } from '../../../common/errors/app.error';
import { KARMA_RULES } from '../../../common/constants/karma-rules.constant';
import {
  ExecuteModerationActionDTO,
  ModerationQueueItem,
  ModerationQueueQuery,
  ResolveReportDTO,
  SubmitReportDTO,
} from '../moderation.types';
import { autoModerationService } from './auto-moderation.service';
import { academicKarmaService } from './academic-karma.service';
import { realtimeNotificationService } from '../../communication/services/realtime-notification.service';

export class ReportEngineService {
  /**
   * Submits a violation report from a student on any supported content.
   */
  async submitReport(reporterId: string, dto: SubmitReportDTO) {
    // 1. Check if user already reported this item
    const { data: existingReport } = await supabase
      .from('content_reports')
      .select('id, status')
      .eq('reporter_id', reporterId)
      .eq('target_type', dto.targetType)
      .eq('target_id', dto.targetId)
      .maybeSingle();

    if (existingReport) {
      throw new AppError(
        'Bạn đã gửi báo cáo cho nội dung này trước đó rồi.',
        400,
        'DUPLICATE_REPORT'
      );
    }

    // 2. Insert the report
    const { data: report, error: insertError } = await supabase
      .from('content_reports')
      .insert({
        reporter_id: reporterId,
        target_type: dto.targetType,
        target_id: dto.targetId,
        reason_code: dto.reasonCode,
        description: dto.description || null,
        status: 'PENDING',
      })
      .select('*')
      .single();

    if (insertError || !report) {
      throw new AppError(
        insertError?.message || 'Không thể gửi báo cáo vi phạm.',
        500,
        'REPORT_INSERT_ERROR'
      );
    }

    // 3. Trigger auto-moderation check
    const autoModResult = await autoModerationService.checkAndTriggerAutoModeration(
      dto.targetType,
      dto.targetId,
      dto.reasonCode
    );

    return {
      report,
      autoHidden: autoModResult.autoHidden,
      currentReportCount: autoModResult.reportsCount,
    };
  }

  /**
   * Fetches moderation queue for Admin/Moderator grouped by target content.
   */
  async getModerationQueue(query: ModerationQueueQuery): Promise<{
    items: ModerationQueueItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let dbQuery = supabase
      .from('content_reports')
      .select(
        `
        *,
        reporter:users!content_reports_reporter_id_fkey(
          id,
          full_name,
          avatar_url,
          is_verified_student
        )
      `,
        { count: 'exact' }
      );

    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    } else {
      dbQuery = dbQuery.eq('status', 'PENDING');
    }

    if (query.targetType) {
      dbQuery = dbQuery.eq('target_type', query.targetType);
    }

    if (query.reasonCode) {
      dbQuery = dbQuery.eq('reason_code', query.reasonCode);
    }

    dbQuery = dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: reports, count, error } = await dbQuery;
    if (error) {
      throw new AppError(error.message, 500, 'DB_ERROR');
    }

    const reportRows = reports || [];

    // Group reports by target_type + target_id
    const groupsMap = new Map<string, typeof reportRows>();
    for (const r of reportRows) {
      const key = `${r.target_type}:${r.target_id}`;
      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
      }
      groupsMap.get(key)!.push(r);
    }

    const queueItems: ModerationQueueItem[] = [];

    for (const [key, groupReports] of groupsMap.entries()) {
      const [targetType, targetId] = key.split(':');
      const latestReport = groupReports[0];

      // Retrieve target content metadata and actual author identity (even if posted anonymously)
      const targetContent = await this.resolveTargetContentMetadata(
        targetType as any,
        targetId
      );

      queueItems.push({
        target_type: targetType as any,
        target_id: targetId,
        report_count: groupReports.length,
        unique_reporters_count: new Set(groupReports.map((g) => g.reporter_id)).size,
        latest_reason: latestReport.reason_code,
        latest_reported_at: latestReport.created_at,
        reports: groupReports,
        target_content: targetContent,
      });
    }

    return {
      items: queueItems,
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Helper to look up content title/snippet and the actual author profile.
   */
  private async resolveTargetContentMetadata(
    targetType: string,
    targetId: string
  ) {
    try {
      switch (targetType) {
        case 'POST': {
          const { data } = await supabase
            .from('posts')
            .select(
              `
              title,
              content_body,
              is_anonymous,
              status,
              author:users!posts_author_id_fkey(
                id,
                full_name,
                email,
                karma_points,
                academic_profile:academic_profiles(student_code)
              )
            `
            )
            .eq('id', targetId)
            .maybeSingle();

          if (!data) return null;
          const author: any = data.author;
          const profile = Array.isArray(author?.academic_profile)
            ? author.academic_profile[0]
            : author?.academic_profile;

          return {
            title: data.title,
            content: data.content_body,
            is_anonymous: data.is_anonymous,
            status: data.status,
            author_id: author?.id,
            author_name: author?.full_name,
            real_author: author
              ? {
                  id: author.id,
                  full_name: author.full_name,
                  email: author.email,
                  student_code: profile?.student_code || null,
                  karma_points: author.karma_points,
                }
              : null,
          };
        }

        case 'COMMENT': {
          const { data } = await supabase
            .from('comments')
            .select(
              `
              content_body,
              is_anonymous,
              status,
              author:users!comments_author_id_fkey(
                id,
                full_name,
                email,
                karma_points,
                academic_profile:academic_profiles(student_code)
              )
            `
            )
            .eq('id', targetId)
            .maybeSingle();

          if (!data) return null;
          const author: any = data.author;
          const profile = Array.isArray(author?.academic_profile)
            ? author.academic_profile[0]
            : author?.academic_profile;

          return {
            title: 'Bình luận',
            content: data.content_body,
            is_anonymous: data.is_anonymous,
            status: data.status,
            author_id: author?.id,
            author_name: author?.full_name,
            real_author: author
              ? {
                  id: author.id,
                  full_name: author.full_name,
                  email: author.email,
                  student_code: profile?.student_code || null,
                  karma_points: author.karma_points,
                }
              : null,
          };
        }

        case 'DOCUMENT': {
          const { data } = await supabase
            .from('documents')
            .select(
              `
              title,
              description,
              status,
              uploader:users!documents_uploader_id_fkey(
                id,
                full_name,
                email,
                karma_points
              )
            `
            )
            .eq('id', targetId)
            .maybeSingle();

          if (!data) return null;
          const uploader: any = data.uploader;

          return {
            title: data.title,
            content: data.description,
            is_anonymous: false,
            status: data.status,
            author_id: uploader?.id,
            author_name: uploader?.full_name,
            real_author: uploader
              ? {
                  id: uploader.id,
                  full_name: uploader.full_name,
                  email: uploader.email,
                  karma_points: uploader.karma_points,
                }
              : null,
          };
        }

        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  /**
   * Resolves all pending reports on a target.
   */
  async resolveReportsForTarget(
    moderatorId: string,
    targetType: string,
    targetId: string,
    dto: ResolveReportDTO
  ) {
    // 1. Update status of reports
    const { data: updatedReports, error: updateError } = await supabase
      .from('content_reports')
      .update({
        status: dto.status,
        reviewed_by: moderatorId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('status', 'PENDING')
      .select('*');

    if (updateError) {
      throw new AppError(updateError.message, 500, 'REPORT_UPDATE_ERROR');
    }

    // 2. If RESOLVED_DISMISSED -> restore content visibility
    if (dto.status === 'RESOLVED_DISMISSED') {
      await this.restoreContentVisibility(targetType, targetId);
      return { resolvedCount: (updatedReports || []).length, actionTaken: 'RESTORED' };
    }

    // 3. If RESOLVED_REMOVED -> permanent removal & sanction
    if (dto.status === 'RESOLVED_REMOVED') {
      const meta = await this.resolveTargetContentMetadata(targetType, targetId);
      const authorId = meta?.author_id;

      // Delete/archive target content
      await this.deleteTargetContent(targetType, targetId);

      // Deduct -20 Karma for confirmed violation
      if (authorId) {
        await academicKarmaService.recordKarmaTransaction({
          userId: authorId,
          actorUserId: moderatorId,
          actionType: 'CONTENT_REMOVED_VIOLATION',
          pointsDelta: KARMA_RULES.CONTENT_REMOVED_VIOLATION,
          referenceType: targetType,
          referenceId: targetId,
        });

        // Record moderation action audit
        await supabase.from('moderation_actions').insert({
          moderator_id: moderatorId,
          target_user_id: authorId,
          target_type: targetType as any,
          target_id: targetId,
          action_taken: dto.actionTaken || 'DELETE_CONTENT',
          reason: dto.reason || 'Nội dung bị xóa do xác nhận vi phạm nguyên tắc cộng đồng (-20 Karma).',
        });

        // Notify author
        await realtimeNotificationService.dispatchNotification({
          recipientId: authorId,
          actorId: moderatorId,
          type: 'POST_REPLY',
          title: 'Nội dung của bạn đã bị gỡ bỏ do vi phạm quy định (-20 Karma)',
          body: dto.reason || 'Nội dung vi phạm tiêu chuẩn cộng đồng sinh viên và đã bị xóa.',
          referenceUrl: '/profile',
        });
      }

      return { resolvedCount: (updatedReports || []).length, actionTaken: 'DELETED' };
    }

    return { resolvedCount: (updatedReports || []).length, actionTaken: 'UPDATED' };
  }

  private async restoreContentVisibility(targetType: string, targetId: string) {
    switch (targetType) {
      case 'POST':
        await supabase.from('posts').update({ status: 'PUBLISHED' }).eq('id', targetId);
        break;
      case 'COMMENT':
        await supabase.from('comments').update({ status: 'PUBLISHED' }).eq('id', targetId);
        break;
      case 'DOCUMENT':
        await supabase.from('documents').update({ status: 'APPROVED' }).eq('id', targetId);
        break;
      case 'COURSE_REVIEW':
        await supabase.from('course_reviews').update({ status: 'PUBLISHED' }).eq('id', targetId);
        break;
      case 'MARKETPLACE_ITEM':
        await supabase.from('marketplace_items').update({ status: 'AVAILABLE' }).eq('id', targetId);
        break;
      case 'HOUSING_LISTING':
        await supabase.from('housing_listings').update({ status: 'OPEN' }).eq('id', targetId);
        break;
    }
  }

  private async deleteTargetContent(targetType: string, targetId: string) {
    switch (targetType) {
      case 'POST':
        await supabase.from('posts').delete().eq('id', targetId);
        break;
      case 'COMMENT':
        await supabase.from('comments').delete().eq('id', targetId);
        break;
      case 'DOCUMENT':
        await supabase.from('documents').delete().eq('id', targetId);
        break;
      case 'COURSE_REVIEW':
        await supabase.from('course_reviews').delete().eq('id', targetId);
        break;
      case 'MARKETPLACE_ITEM':
        await supabase.from('marketplace_items').delete().eq('id', targetId);
        break;
      case 'HOUSING_LISTING':
        await supabase.from('housing_listings').delete().eq('id', targetId);
        break;
    }
  }

  /**
   * Executes a direct sanction / disciplinary action against a user or content.
   */
  async executeDirectAction(moderatorId: string, dto: ExecuteModerationActionDTO) {
    // 1. If sanctioning a user (WARN, TEMPORARY_BAN, PERMANENT_BAN)
    if (dto.targetUserId) {
      let nextStatus = 'ACTIVE';
      if (dto.actionTaken === 'WARN') nextStatus = 'WARNED';
      if (dto.actionTaken === 'TEMPORARY_BAN') nextStatus = 'SUSPENDED';
      if (dto.actionTaken === 'PERMANENT_BAN') nextStatus = 'BANNED';

      await supabase
        .from('users')
        .update({ status: nextStatus })
        .eq('id', dto.targetUserId);

      if (dto.deductKarma) {
        await academicKarmaService.recordKarmaTransaction({
          userId: dto.targetUserId,
          actorUserId: moderatorId,
          actionType: 'CONTENT_REMOVED_VIOLATION',
          pointsDelta: KARMA_RULES.CONTENT_REMOVED_VIOLATION,
          referenceType: dto.targetType,
          referenceId: dto.targetId,
        });
      }
    }

    if (dto.actionTaken === 'DELETE_CONTENT') {
      await this.deleteTargetContent(dto.targetType, dto.targetId);
    }

    // 2. Log into moderation_actions
    const { data: action, error } = await supabase
      .from('moderation_actions')
      .insert({
        moderator_id: moderatorId,
        target_user_id: dto.targetUserId || null,
        target_type: dto.targetType,
        target_id: dto.targetId,
        action_taken: dto.actionTaken,
        reason: dto.reason,
        expires_at: dto.expiresAt || null,
      })
      .select('*')
      .single();

    if (error || !action) {
      throw new AppError(error?.message || 'Không thể lưu hành động kỷ luật.', 500, 'ACTION_ERROR');
    }

    return action;
  }

  /**
   * Lists historical moderation actions for audit.
   */
  async listModerationActions(limit = 50) {
    const { data, error } = await supabase
      .from('moderation_actions')
      .select(
        `
        *,
        moderator:users!moderation_actions_moderator_id_fkey(id, full_name),
        target_user:users!moderation_actions_target_user_id_fkey(id, full_name, email, karma_points)
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new AppError(error.message, 500, 'DB_ERROR');
    }

    return data || [];
  }
}

export const reportEngineService = new ReportEngineService();
