import { supabase } from '../../../database';
import { KARMA_RULES } from '../../../common/constants/karma-rules.constant';
import { UserRole } from '../../../common/constants/roles.constant';
import { sanitizeAnonymousAuthor } from '../../../common/middlewares/anonymous-context.middleware';
import { AppError } from '../../../common/utils/response.util';
import { academicKarmaService } from '../../moderation/services/academic-karma.service';
import { realtimeNotificationService } from '../../communication/services/realtime-notification.service';
import { CreateCommentInput } from '../feed.types';
import { postEngineService } from './post-engine.service';

export class NestedCommentService {
  /**
   * Creates a comment (root or nested reply) on a post.
   */
  async createComment(
    postId: string,
    authorId: string,
    input: CreateCommentInput,
    viewerRole?: UserRole
  ) {
    const { data: post } = await supabase
      .from('posts')
      .select('id, title, author_id, comment_count')
      .eq('id', postId)
      .maybeSingle();

    if (!post) {
      throw new AppError('Không tìm thấy bài viết.', 404, 'POST_NOT_FOUND');
    }

    if (input.parentCommentId) {
      const { data: parent } = await supabase
        .from('comments')
        .select('id, post_id')
        .eq('id', input.parentCommentId)
        .maybeSingle();

      if (!parent || parent.post_id !== postId) {
        throw new AppError(
          'Bình luận gốc không hợp lệ.',
          400,
          'INVALID_PARENT_COMMENT'
        );
      }
    }

    const { sanitizedBody, hasLatex, hasCode } =
      postEngineService.prepareAcademicContent(input.contentBody);

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: authorId,
        parent_comment_id: input.parentCommentId ?? null,
        content_body: sanitizedBody,
        has_latex: hasLatex,
        has_code: hasCode,
        is_anonymous: Boolean(input.isAnonymous),
      })
      .select('*')
      .single();

    if (error || !comment) {
      throw new AppError(
        error?.message || 'Không thể tạo bình luận.',
        500,
        'COMMENT_CREATE_ERROR'
      );
    }

    await supabase
      .from('posts')
      .update({ comment_count: (post.comment_count || 0) + 1 })
      .eq('id', postId);

    if (post.author_id && post.author_id !== authorId) {
      await realtimeNotificationService.dispatchNotification({
        recipientId: post.author_id,
        actorId: input.isAnonymous ? null : authorId,
        type: 'POST_REPLY',
        title: 'Có phản hồi mới trên bài thảo luận của bạn',
        body: `Bài viết "${post.title}" vừa nhận được một bình luận mới.`,
        referenceUrl: `/feed/posts/${postId}`,
      });
    }

    const { data: profile } = await supabase
      .from('academic_profiles')
      .select('*')
      .eq('user_id', authorId)
      .maybeSingle();

    return sanitizeAnonymousAuthor(
      {
        ...comment,
        author: profile
          ? {
              id: profile.user_id,
              full_name: profile.full_name,
              student_code: profile.student_code,
              avatar_url: profile.avatar_url,
              anonymous_handle: profile.anonymous_handle,
              anonymous_avatar: profile.anonymous_avatar,
            }
          : { anonymous_handle: 'SinhVienAnDanh' },
      },
      viewerRole,
      false
    );
  }

  /**
   * Builds a nested comment tree for a post with Controlled Anonymity applied.
   */
  async getNestedCommentsForPost(postId: string, viewerRole?: UserRole) {
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'PUBLISHED')
      .order('is_accepted', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      throw new AppError(error.message, 500, 'DB_QUERY_ERROR');
    }

    const rows = comments || [];
    const authorIds = Array.from(new Set(rows.map((c) => c.author_id)));

    const profileMap = new Map<string, Record<string, any>>();
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('academic_profiles')
        .select('*')
        .in('user_id', authorIds);
      for (const p of profiles || []) {
        profileMap.set(p.user_id, p);
      }
    }

    const nodeMap = new Map<string, Record<string, any>>();
    const roots: Array<Record<string, any>> = [];

    for (const c of rows) {
      const profile = profileMap.get(c.author_id);
      const sanitized = sanitizeAnonymousAuthor(
        {
          ...c,
          author: profile
            ? {
                id: profile.user_id,
                full_name: profile.full_name,
                student_code: profile.student_code,
                avatar_url: profile.avatar_url,
                anonymous_handle: profile.anonymous_handle,
                anonymous_avatar: profile.anonymous_avatar,
              }
            : { anonymous_handle: 'SinhVienAnDanh' },
          replies: [],
        },
        viewerRole,
        false
      );
      nodeMap.set(c.id, sanitized);
    }

    for (const c of rows) {
      const node = nodeMap.get(c.id)!;
      if (c.parent_comment_id && nodeMap.has(c.parent_comment_id)) {
        nodeMap.get(c.parent_comment_id)!.replies.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Marks a comment as the "Accepted Answer" for a QUESTION post and grants +15 Karma.
   */
  async markAcceptedAnswer(
    postId: string,
    commentId: string,
    requesterUserId: string
  ) {
    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id, post_type, accepted_comment_id')
      .eq('id', postId)
      .maybeSingle();

    if (!post) {
      throw new AppError('Không tìm thấy bài viết.', 404, 'POST_NOT_FOUND');
    }

    if (post.author_id !== requesterUserId) {
      throw new AppError(
        'Chỉ tác giả của câu hỏi mới có quyền chọn câu trả lời đúng (Accepted Answer).',
        403,
        'ONLY_QUESTION_AUTHOR_CAN_ACCEPT'
      );
    }

    if (post.post_type !== 'QUESTION') {
      throw new AppError(
        'Chỉ bài đăng thuộc loại Hỏi đáp (QUESTION) mới hỗ trợ đánh dấu Accepted Answer.',
        400,
        'POST_NOT_A_QUESTION'
      );
    }

    const { data: comment } = await supabase
      .from('comments')
      .select('id, post_id, author_id')
      .eq('id', commentId)
      .maybeSingle();

    if (!comment || comment.post_id !== postId) {
      throw new AppError(
        'Bình luận không thuộc bài đăng này.',
        404,
        'COMMENT_NOT_FOUND'
      );
    }

    // Clear previous accepted answer if any
    await supabase
      .from('comments')
      .update({ is_accepted: false })
      .eq('post_id', postId);

    await supabase
      .from('comments')
      .update({ is_accepted: true })
      .eq('id', commentId);

    await supabase
      .from('posts')
      .update({ accepted_comment_id: commentId })
      .eq('id', postId);

    await academicKarmaService.recordKarmaTransaction({
      userId: comment.author_id,
      actorUserId: requesterUserId,
      actionType: 'ANSWER_ACCEPTED',
      pointsDelta: KARMA_RULES.ANSWER_ACCEPTED,
      referenceType: 'COMMENT',
      referenceId: commentId,
    });

    if (comment.author_id !== requesterUserId) {
      await realtimeNotificationService.dispatchNotification({
        recipientId: comment.author_id,
        actorId: requesterUserId,
        type: 'ANSWER_ACCEPTED',
        title: 'Câu trả lời của bạn được chọn là Accepted Answer! (+15 Karma)',
        body: 'Cảm ơn đóng góp học thuật xuất sắc của bạn cho cộng đồng sinh viên.',
        referenceUrl: `/feed/posts/${postId}`,
      });
    }

    return {
      postId,
      acceptedCommentId: commentId,
      karmaAwarded:
        comment.author_id !== requesterUserId
          ? KARMA_RULES.ANSWER_ACCEPTED
          : 0,
    };
  }
}

export const nestedCommentService = new NestedCommentService();
