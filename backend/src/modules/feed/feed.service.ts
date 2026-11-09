import { UserRole } from '../../common/constants/roles.constant';
import { AppError } from '../../common/utils/response.util';
import { feedRepository } from './feed.repository';
import {
  CreateCommentInput,
  CreatePostInput,
  FeedFilterQuery,
  VoteType,
} from './feed.types';
import { courseTaggerService } from './services/course-tagger.service';
import { nestedCommentService } from './services/nested-comment.service';
import { postEngineService } from './services/post-engine.service';
import { voteEngagementService } from './services/vote-engagement.service';

export class FeedService {
  async listFeed(filter: FeedFilterQuery, viewerRole?: UserRole) {
    const { rows, total, page, limit } =
      await feedRepository.listFeedPosts(filter);

    const postIds = rows.map((r) => r.id);
    const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));

    const [tagsByPostId, profilesByUserId] = await Promise.all([
      feedRepository.getCourseTagsForPostIds(postIds),
      feedRepository.getProfilesForUserIds(authorIds),
    ]);

    const items = rows.map((row) => {
      const formatted = postEngineService.formatPostForClient(
        row,
        profilesByUserId.get(row.author_id),
        viewerRole
      );
      return {
        ...formatted,
        courseTags: tagsByPostId.get(row.id) || [],
      };
    });

    return {
      items,
      meta: { page, limit, total },
    };
  }

  async createPost(
    authorId: string,
    input: CreatePostInput,
    viewerRole?: UserRole
  ) {
    if (
      input.postType === 'ANNOUNCEMENT' &&
      input.isAnonymous
    ) {
      throw new AppError(
        'Bài thông báo toàn trường (ANNOUNCEMENT) không được phép đăng ẩn danh.',
        400,
        'ANNOUNCEMENT_CANNOT_BE_ANONYMOUS'
      );
    }

    const { sanitizedBody, hasLatex, hasCode } =
      postEngineService.prepareAcademicContent(input.contentBody);

    const created = await feedRepository.createPostRecord({
      authorId,
      input,
      sanitizedBody,
      hasLatex,
      hasCode,
    });

    const courseTags = await courseTaggerService.syncPostCourseTags(
      created.id,
      input.title,
      sanitizedBody,
      input.courseId
    );

    const fullPost = await feedRepository.findPostById(created.id);
    const profiles = await feedRepository.getProfilesForUserIds([authorId]);

    return {
      ...postEngineService.formatPostForClient(
        fullPost || created,
        profiles.get(authorId),
        viewerRole
      ),
      courseTags,
    };
  }

  async getPostDetail(postId: string, viewerRole?: UserRole) {
    const post = await feedRepository.findPostById(postId);
    if (!post || post.status !== 'PUBLISHED') {
      throw new AppError('Không tìm thấy bài viết.', 404, 'POST_NOT_FOUND');
    }

    const [tagsByPostId, profiles, comments] = await Promise.all([
      feedRepository.getCourseTagsForPostIds([postId]),
      feedRepository.getProfilesForUserIds([post.author_id]),
      nestedCommentService.getNestedCommentsForPost(postId, viewerRole),
    ]);

    const formattedPost = postEngineService.formatPostForClient(
      post,
      profiles.get(post.author_id),
      viewerRole
    );

    return {
      ...formattedPost,
      courseTags: tagsByPostId.get(postId) || [],
      comments,
    };
  }

  async votePost(userId: string, postId: string, voteType: VoteType) {
    return voteEngagementService.castVote({
      userId,
      targetType: 'POST',
      targetId: postId,
      voteType,
    });
  }

  async voteComment(userId: string, commentId: string, voteType: VoteType) {
    return voteEngagementService.castVote({
      userId,
      targetType: 'COMMENT',
      targetId: commentId,
      voteType,
    });
  }

  async addComment(
    postId: string,
    authorId: string,
    input: CreateCommentInput,
    viewerRole?: UserRole
  ) {
    return nestedCommentService.createComment(
      postId,
      authorId,
      input,
      viewerRole
    );
  }

  async acceptAnswer(
    postId: string,
    commentId: string,
    requesterUserId: string
  ) {
    return nestedCommentService.markAcceptedAnswer(
      postId,
      commentId,
      requesterUserId
    );
  }
}

export const feedService = new FeedService();
