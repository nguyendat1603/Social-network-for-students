import { supabase } from '../../../database';
import { KARMA_RULES } from '../../../common/constants/karma-rules.constant';
import { AppError } from '../../../common/utils/response.util';
import { academicKarmaService } from '../../moderation/services/academic-karma.service';
import { VoteTargetType, VoteType } from '../feed.types';

export class VoteEngagementService {
  /**
   * Handles Upvote / Downvote / Helpful voting on a POST or COMMENT.
   * Toggles off if the user clicks the same vote type again.
   */
  async castVote(params: {
    userId: string;
    targetType: VoteTargetType;
    targetId: string;
    voteType: VoteType;
  }) {
    const tableName = params.targetType === 'POST' ? 'posts' : 'comments';

    const { data: target, error: targetErr } = await supabase
      .from(tableName)
      .select('id, author_id, upvote_count, downvote_count, helpful_count')
      .eq('id', params.targetId)
      .maybeSingle();

    if (targetErr || !target) {
      throw new AppError(
        'Không tìm thấy nội dung cần bình chọn.',
        404,
        'VOTE_TARGET_NOT_FOUND'
      );
    }

    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', params.userId)
      .eq('target_type', params.targetType)
      .eq('target_id', params.targetId)
      .maybeSingle();

    let upvoteDelta = 0;
    let downvoteDelta = 0;
    let helpfulDelta = 0;
    let currentVote: VoteType | null = params.voteType;

    const adjustCounter = (type: VoteType, dir: 1 | -1) => {
      if (type === 'UPVOTE') upvoteDelta += dir;
      if (type === 'DOWNVOTE') downvoteDelta += dir;
      if (type === 'HELPFUL') helpfulDelta += dir;
    };

    if (existingVote) {
      if (existingVote.vote_type === params.voteType) {
        // Toggle off existing vote
        await supabase.from('votes').delete().eq('id', existingVote.id);
        adjustCounter(params.voteType, -1);
        currentVote = null;
      } else {
        // Switch vote type
        await supabase
          .from('votes')
          .update({ vote_type: params.voteType })
          .eq('id', existingVote.id);
        adjustCounter(existingVote.vote_type as VoteType, -1);
        adjustCounter(params.voteType, 1);
      }
    } else {
      await supabase.from('votes').insert({
        user_id: params.userId,
        target_type: params.targetType,
        target_id: params.targetId,
        vote_type: params.voteType,
      });
      adjustCounter(params.voteType, 1);

      if (params.voteType === 'UPVOTE' || params.voteType === 'HELPFUL') {
        await academicKarmaService.recordKarmaTransaction({
          userId: target.author_id,
          actorUserId: params.userId,
          actionType: 'POST_OR_COMMENT_UPVOTED',
          pointsDelta: KARMA_RULES.POST_OR_COMMENT_UPVOTED,
          referenceType: params.targetType,
          referenceId: params.targetId,
        });
      }
    }

    const updatedCounts = {
      upvote_count: Math.max(0, (target.upvote_count || 0) + upvoteDelta),
      downvote_count: Math.max(0, (target.downvote_count || 0) + downvoteDelta),
      helpful_count: Math.max(0, (target.helpful_count || 0) + helpfulDelta),
    };

    await supabase
      .from(tableName)
      .update(updatedCounts)
      .eq('id', params.targetId);

    return {
      targetId: params.targetId,
      targetType: params.targetType,
      currentVote,
      ...updatedCounts,
    };
  }
}

export const voteEngagementService = new VoteEngagementService();
