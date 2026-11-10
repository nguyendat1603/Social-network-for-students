import { supabase } from '../../../database';
import {
  MODERATION_THRESHOLDS,
  ReportReasonCode,
  ReportTargetType,
} from '../../../common/constants/moderation-thresholds.constant';
import { realtimeNotificationService } from '../../communication/services/realtime-notification.service';

export class AutoModerationService {
  /**
   * Checks if an entity has crossed the threshold of independent reports.
   * If so, auto-hides the content and creates a moderation action log.
   */
  async checkAndTriggerAutoModeration(
    targetType: ReportTargetType,
    targetId: string,
    reasonCode: ReportReasonCode
  ): Promise<{ autoHidden: boolean; reportsCount: number }> {
    // 1. Fetch threshold setting from database, fallback to constants
    const { data: setting } = await supabase
      .from('auto_mod_settings')
      .select('threshold_count, is_enabled')
      .eq('reason_code', reasonCode)
      .maybeSingle();

    if (setting && !setting.is_enabled) {
      return { autoHidden: false, reportsCount: 0 };
    }

    const threshold = setting?.threshold_count || MODERATION_THRESHOLDS[reasonCode] || 5;

    // 2. Count independent pending reports for this target
    const { data: reports, error: countError } = await supabase
      .from('content_reports')
      .select('id, reporter_id, reason_code')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('status', 'PENDING');

    if (countError || !reports) {
      return { autoHidden: false, reportsCount: 0 };
    }

    const reportsCount = reports.length;
    if (reportsCount < threshold) {
      return { autoHidden: false, reportsCount };
    }

    // 3. Threshold reached -> Hide the target content across corresponding tables
    let authorId: string | null = null;
    let contentTitle = 'Nội dung';

    switch (targetType) {
      case 'POST': {
        const { data: post } = await supabase
          .from('posts')
          .select('id, author_id, title')
          .eq('id', targetId)
          .maybeSingle();
        if (post) {
          authorId = post.author_id;
          contentTitle = post.title || 'Bài viết';
          await supabase
            .from('posts')
            .update({ status: 'HIDDEN_PENDING_REVIEW' })
            .eq('id', targetId);
        }
        break;
      }

      case 'COMMENT': {
        const { data: comment } = await supabase
          .from('comments')
          .select('id, author_id, content_body')
          .eq('id', targetId)
          .maybeSingle();
        if (comment) {
          authorId = comment.author_id;
          contentTitle = 'Bình luận';
          await supabase
            .from('comments')
            .update({ status: 'HIDDEN_PENDING_REVIEW' })
            .eq('id', targetId);
        }
        break;
      }

      case 'DOCUMENT': {
        const { data: doc } = await supabase
          .from('documents')
          .select('id, uploader_id, title')
          .eq('id', targetId)
          .maybeSingle();
        if (doc) {
          authorId = doc.uploader_id;
          contentTitle = doc.title || 'Tài liệu';
          await supabase
            .from('documents')
            .update({ status: 'HIDDEN_PENDING_REVIEW' })
            .eq('id', targetId);
        }
        break;
      }

      case 'COURSE_REVIEW': {
        const { data: rev } = await supabase
          .from('course_reviews')
          .select('id, author_id')
          .eq('id', targetId)
          .maybeSingle();
        if (rev) {
          authorId = rev.author_id;
          contentTitle = 'Đánh giá học phần';
          await supabase
            .from('course_reviews')
            .update({ status: 'HIDDEN_PENDING_REVIEW' })
            .eq('id', targetId);
        }
        break;
      }

      case 'MARKETPLACE_ITEM': {
        const { data: item } = await supabase
          .from('marketplace_items')
          .select('id, seller_id, title')
          .eq('id', targetId)
          .maybeSingle();
        if (item) {
          authorId = item.seller_id;
          contentTitle = item.title || 'Mặt hàng thanh lý';
          await supabase
            .from('marketplace_items')
            .update({ status: 'RESERVED' })
            .eq('id', targetId);
        }
        break;
      }

      case 'HOUSING_LISTING': {
        const { data: listing } = await supabase
          .from('housing_listings')
          .select('id, poster_id, title')
          .eq('id', targetId)
          .maybeSingle();
        if (listing) {
          authorId = listing.poster_id;
          contentTitle = listing.title || 'Tin phòng trọ';
          await supabase
            .from('housing_listings')
            .update({ status: 'CLOSED' })
            .eq('id', targetId);
        }
        break;
      }
    }

    // 4. Log auto-moderation action
    await supabase.from('moderation_actions').insert({
      moderator_id: null, // System automated action
      target_user_id: authorId,
      target_type: targetType,
      target_id: targetId,
      action_taken: 'AUTO_HIDE',
      reason: `Nội dung tự động bị ẩn do nhận ${reportsCount} báo cáo vi phạm (${reasonCode}). Đang chờ Ban quản trị xét duyệt.`,
    });

    // 5. Notify the content author (if found)
    if (authorId) {
      await realtimeNotificationService.dispatchNotification({
        recipientId: authorId,
        type: 'POST_REPLY', // Reusing valid notification type for safety
        title: 'Nội dung của bạn tạm thời bị ẩn để kiểm duyệt',
        body: `"${contentTitle}" đã nhận nhiều báo cáo vi phạm và được tự động tạm ẩn để Ban quản trị xem xét.`,
        referenceUrl: '/profile',
      });
    }

    return { autoHidden: true, reportsCount };
  }
}

export const autoModerationService = new AutoModerationService();
