import { supabase } from '../../../database';
import { KARMA_RULES } from '../../../common/constants/karma-rules.constant';
import { AppError } from '../../../common/utils/response.util';
import { academicKarmaService } from '../../moderation/services/academic-karma.service';

export class DocumentRatingService {
  /**
   * Casts an UPVOTE or DOWNVOTE on a document and rewards +5 Karma to the uploader on UPVOTE.
   */
  async voteDocument(
    documentId: string,
    userId: string,
    voteType: 'UPVOTE' | 'DOWNVOTE'
  ) {
    const { data: doc } = await supabase
      .from('documents')
      .select('id, uploader_id, upvote_count, downvote_count')
      .eq('id', documentId)
      .maybeSingle();

    if (!doc) {
      throw new AppError(
        'Không tìm thấy tài liệu.',
        404,
        'DOCUMENT_NOT_FOUND'
      );
    }

    const { data: existing } = await supabase
      .from('document_votes')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .maybeSingle();

    let upDelta = 0;
    let downDelta = 0;
    let currentVote: 'UPVOTE' | 'DOWNVOTE' | null = voteType;

    if (existing) {
      if (existing.vote_type === voteType) {
        await supabase.from('document_votes').delete().eq('id', existing.id);
        if (voteType === 'UPVOTE') upDelta = -1;
        if (voteType === 'DOWNVOTE') downDelta = -1;
        currentVote = null;
      } else {
        await supabase
          .from('document_votes')
          .update({ vote_type: voteType })
          .eq('id', existing.id);
        if (voteType === 'UPVOTE') {
          upDelta = 1;
          downDelta = -1;
        } else {
          upDelta = -1;
          downDelta = 1;
        }
      }
    } else {
      await supabase.from('document_votes').insert({
        document_id: documentId,
        user_id: userId,
        vote_type: voteType,
      });

      if (voteType === 'UPVOTE') {
        upDelta = 1;
        await academicKarmaService.recordKarmaTransaction({
          userId: doc.uploader_id,
          actorUserId: userId,
          actionType: 'DOCUMENT_UPVOTED',
          pointsDelta: KARMA_RULES.DOCUMENT_UPVOTED,
          referenceType: 'DOCUMENT',
          referenceId: documentId,
        });
      } else {
        downDelta = 1;
      }
    }

    const updatedCounts = {
      upvote_count: Math.max(0, (doc.upvote_count || 0) + upDelta),
      downvote_count: Math.max(0, (doc.downvote_count || 0) + downDelta),
    };

    await supabase
      .from('documents')
      .update(updatedCounts)
      .eq('id', documentId);

    return {
      documentId,
      currentVote,
      ...updatedCounts,
    };
  }
}

export const documentRatingService = new DocumentRatingService();
